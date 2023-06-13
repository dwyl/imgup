<div align="center">

# Upload Images to `S3` via `REST API`

Learn how upload `images` via a `REST API` in a `Phoenix` App.

</div>

> **Note**: Before reading this guide,
> please follow the steps in [`README.md`](./README.md),
> as the `API` builds upon it.

- [Upload Images to `S3` via `REST API`](#upload-images-to-s3-via-rest-api)
- [1. Add `/api` scope and pipeline and setting up controller](#1-add-api-scope-and-pipeline-and-setting-up-controller)
- [2. Uploading to `S3` Bucket using `ex_aws_s3`](#2-uploading-to-s3-bucket-using-ex_aws_s3)
  - [2.1 Create Reusable `DRY` Upload Function](#21-create-reusable-dry-upload-function)
  - [2.2 _Use_ the `upload/1` function in `ApiController`](#22-use-the-upload1-function-in-apicontroller)
- [3. Limiting filetype and size](#3-limiting-filetype-and-size)
- [4. Testing the `API` from `Hoppscotch`](#4-testing-the-api-from-hoppscotch)
- [5. Saving the image with the `CID` of its contents](#5-saving-the-image-with-the-cid-of-its-contents)



# 1. Add `/api` scope and pipeline and setting up controller

Start by creating our API endpoint.
Open `lib/router.ex`
and uncomment the `pipeline :api` and `scope :api`.
We are going to set our endpoint to create a given image
that is sent via `multipart/form-data`.

```elixir

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", AppWeb do
    pipe_through :api

    resources "/images", ApiController, only: [:create]
  end
```

Next create the `ApiController`
to serve these requests.
Inside `lib/app_web/controllers`,
create `api_controller.ex` 
and paste the following code:

```elixir
defmodule AppWeb.ApiController do
  use AppWeb, :controller
  alias App.Todo

  def create(conn, params) do
    render(conn, :create)
  end

end
```

We're yet to serve anything, 
we'll do this at a later stage.

To render a `json` response,
let's create a simple JSON template.
In the same folder, create `api_json.ex`.

```elixir
defmodule AppWeb.ApiJSON do
  def render("success.json", assigns) do
    %{url: assigns.url, compressed_url: assigns.compressed_url}
  end

  def render(template, _assigns) do
    %{errors: %{detail: Phoenix.Controller.status_message_from_template(template)}}
  end
end
```

Now, depending on the status of the response,
we will render a sample response
`%{url: "Some URL"}`.
Don't dwell on this file, 
the code will be updated shortly. 

# 2. Uploading to `S3` Bucket using `ex_aws_s3`

Thankfully, the difficult part of uploading 
files to `AWS S3` has already been resolved
and there is a library we can use: 
[`ex_aws`](https://github.com/ex-aws/ex_aws) package.
Install it by adding the following lines 
to the `deps` section in `mix.exs`:

```elixir
{:ex_aws, "~> 2.0"},
{:ex_aws_s3, "~> 2.0"},
{:sweet_xml, "~> 0.7"}
```

Run `mix deps.get` to download the dependencies.

Next, we need to add configuration
of these newly added dependencies
in `config/config.ex`.
Open it and add these lines.

```elixir
config :ex_aws,
  access_key_id: System.fetch_env!("AWS_ACCESS_KEY_ID"),
  secret_access_key: System.fetch_env!("AWS_SECRET_ACCESS_KEY"),
  region: System.fetch_env!("AWS_REGION")
```

This configuration is self-explanatory to anyone with `AWS` experience.
We are setting the default region of the `S3` bucket,
and setting our `access_key_id` and `secret_access_key`
from the environment variables defined earlier.

## 2.1 Create Reusable `DRY` Upload Function

Create a file with the path: 
`lib/app/upload.ex`
And paste the following code in it:

```elixir
defmodule App.Upload do
  @moduledoc """
  Handles uploading to S3 in a convenient reusable (DRY) function.
  """
  import SweetXml

  @region Application.compile_env(:ex_aws, :region)
  @compressed_baseurl "https://s3.#{@region}.amazonaws.com/imgup-compressed/"

  @doc """
  `upload/1` receives an `image` with the format
  %{
    path: "/var/folders/0n/g78kfqfx4vn65p_2kl7fmtl00000gn/T/plug-1686/multipart-1686652824",
    content_type: "image/png",
    filename: "my-awesome-image.png"
  }
  Uploads to `AWS S3` using `ExAws.S3.upload` and returns the result.
  """
  def upload(image) do
    # Create `CID` from file contents
    {:ok, file_binary} = File.read(image.path)
    file_cid = Cid.cid(file_binary)
    file_name = "#{file_cid}.#{Enum.at(MIME.extensions(image.content_type), 0)}"

    # Upload to S3
    response = image.path
    |> ExAws.S3.Upload.stream_file()
    |> ExAws.S3.upload("imgup-original", file_name, acl: :public_read)
    |> ExAws.request(get_ex_aws_request_config_override())

    # Sample response:
    # %{
    #   body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\n
    #    <CompleteMultipartUploadResult xmlns=\"http://s3.amazonaws.com/doc/2006-03-01/\">
    #    <Location>https://s3.eu-west-3.amazonaws.com/imgup-original/zb2rhcoyUPqvWtbC7WaT.jpg</Location>
    #    <Bucket>imgup-original</Bucket><Key>zb2rhco5pVyouQGX1FQFfYtiA89QswquLbcsyUPqvWtbC7WaT.jpg</Key>
    #    <ETag>\"4ecd62951576b7e5b4a3e869e5e98a0f-1\"</ETag></CompleteMultipartUploadResult>",
    #   headers: [
    #     {"x-amz-id-2",
    #      "wNTNZKt82vgnOuT1o2Tz8z3gcRzd6wXofYxQmBUkGbBGTpmv1WbwjjGiRAUtOTYIm92bh/VJHhI="},
    #     {"x-amz-request-id", "QRENBY1MJTQWD7CZ"},
    #     {"Date", "Tue, 13 Jun 2023 10:22:44 GMT"},
    #     {"x-amz-expiration",
    #      "expiry-date=\"Thu, 15 Jun 2023 00:00:00 GMT\", rule-id=\"delete-after-1-day\""},
    #     {"x-amz-server-side-encryption", "AES256"},
    #     {"Content-Type", "application/xml"},
    #     {"Transfer-Encoding", "chunked"},
    #     {"Server", "AmazonS3"}
    #   ],
    #   status_code: 200
    # }}
    case response do
      {:ok, body} ->
        # Fetch the contents of the returned XML string from `ex_aws`.
        # This XML is parsed with `sweet_xml`:
        # https://github.com/kbrw/sweet_xml#the-x-sigil
        url = body.body |> xpath(~x"//text()") |> List.to_string()
        compressed_url = "#{@compressed_baseurl}#{file_name}"
        {:ok, %{url: url, compressed_url: compressed_url}}

      # return the error for handling in the controller
      {:error, error} ->
        {:error, error}
      end
  end

  def get_ex_aws_request_config_override,
    do: Application.get_env(:ex_aws, :request_config_override)
end
```

The `upload/1` function uses a `Content ID` (`cid`)
as the filename for the uploaded `image`. 

We are creating a `cid` from the contents of the image.
We then use this `cid` and concatenate with the extension of the 
*content type of the image*.
This way, we'll have a cid with the correct format,
e.g. `zb2rhhPShfsYqzqYPG8wxnsb4zNe2HxDrqKRxU6wSWQQWMHsZ.jpg`.


To parse the `XML` response returned by `AWS`,
[`sweet_xml`](https://github.com/kbrw/sweet_xml)
is used.
The response has a `<Location>` tag,
which is the `URL` we are returning.

## 2.2 _Use_ the `upload/1` function in `ApiController`

In `lib/app_web/controllers/api_controller.ex`, 
change it to the following piece of code: 

```elixir
defmodule AppWeb.ApiController do
  use AppWeb, :controller

  def create(conn, %{"image" => image}) do
    # Check if file is an image
    if String.contains?(image.content_type, "image") do
      #  Upload to S3
      case App.Upload.upload(image) do
        {:ok, body} ->
          render(conn, :success, body)

        {:error, error} ->
          {_error_atom, http_code, body} = error
          render(conn |> put_status(http_code), body)
      end

      # If it's not an image, return 400
    else
      render(conn |> put_status(400), %{body: "File is not an image."})
    end
  end

  # handle *any* uploaded data even without "image" key
  def create(conn, %{"" => params}) do
    # check if content_type e.g: "image/png"
    if String.contains?(params.content_type, "image") do
      create(conn, %{
        "image" => %{
          content_type: params.content_type,
          path: params.path,
          filename: params.filename
        }
      })
    else
      render(conn |> put_status(400), :field_error)
    end
  end
end
```

The `create/2` function is pattern matching the request
to extract the `image` data from the `multipart/form-data`.
If the request does not contain a valid `image` a `400` error is returned.

If they `image` is valid,
attempt to use `S3.upload` to upload the file
to the `imgup-original` bucket.

Depending on the result of the upload,
return a `success` or `error` response.
For this, 
we need to make some changes
to how the `json` response is rendered.

Open `lib/app_web/controllers/api_json.ex`
and change it so it has the following functions:

```elixir
  def render("success.json", assigns) do
    %{url: assigns.url, compressed_url: assigns.compressed_url}
  end

  def render("field_error.json", _assigns) do
    %{errors: %{detail: "No \'image'\ field provided."}}
  end

  def render(template, assigns) do
    body = Map.get(assigns, :body, "Internal server error.")
    %{errors: %{detail: body}}
  end
```

We are adding two clauses:

- the `field_error.json` is invoked
when the pattern matches to the default,
meaning the person passed a field named *not* `image`.

- a default template that uses
the `error` coming from the `ex_aws` upload,
using its output to return the `error` details in the `JSON` response.


# 3. Limiting filetype and size

We want the clients of our API
to only upload fairly lightweight files 
and only images.
So let's limit our API's behaviour!

To limit the size,
simple open `lib/app_web/endpoint.ex`
and add the following attribute to the
`plug Plug.Parsers`.

```elixir
  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library(),
    length: 20_000_000       # Add this new line
```

We are limiting the person to only upload
files up to `20MB`.
This is more than enough for 99% of images.

> **Note**: `iPhone 14 Pro` and other similar "flagship" smartphones
> have `48 Megapixel +` camera sensors.
> According to several sources:
> "_`48 Megapixel ProRAW` photos taken on the Main camera 
> will be approximately **`75MB`** in size._"
> e.g: https://www.macrumors.com/2022/09/09/iphone-14-pro-48mp-photo-size
> When people with latest flagship phones use our `App`
> and want to upload `ProRAW` images, 
> we will officially have 
> ["champagne problems"](https://www.urbandictionary.com/define.php?term=champagne%20problem)
> and can revisit this limit.


Next: limit uploads to only `image` files!
The 
[`Plug.Upload type`](https://hexdocs.pm/plug/1.14.0/Plug.Upload.html#types)
is automatically parsed in our API.
`params` has a field called `content_type`, 
which we can use to check if the file is an `image`.

Open `lib/app_web/controllers/api_controller.ex`
and change the `def create(conn, %{"image" => image})` function
to:

```elixir
def create(conn, %{"image" => image}) do
    # Check if file is an image
    if String.contains?(image.content_type, "image") do
      #  Upload to S3
      case App.Upload.upload(image) do
        {:ok, body} ->
          render(conn, :success, body)

        {:error, error} ->
          {_error_atom, http_code, body} = error
          render(conn |> put_status(http_code), body)
      end

      # If it's not an image, return 400
    else
      render(conn |> put_status(400), %{body: "File is not an image."})
    end
  end

```

This is checking the filetype of the uploaded file
and providing feedback *back to the person*!



# 4. Testing the `API` from `Hoppscotch` 

Once you've saved 

Awesome!
Now if you run `mix phx.server`
and make a `multipart/form-data` request
(we recommend using a tool like 
[`Postman`](https://www.postman.com/) or [`Hoppscotch`](https://hoppscotch.io/) - which is open-source!),
you should see a public URL after loading an image file!

```json
{
  "url": "https://s3.eu-west-3.amazonaws.com/imgup-original/115faa2f5cbe273cfc9fbcffd44b7eab.1000x1000x1.jpg"
}
```

If the person makes an invalid input,
he should see error details.
For example,
if you try to upload another file other than an image:

```json
{
  "errors": {
    "detail": "File is not an image."
  }
}
```

Or an image size that's too large,
you'll get an `413 Request Entity Too Large` error.


# 5. Saving the image with the `CID` of its contents

Similarly to what we've done to the `LiveView`,
we want our images to have its name
**as the `CID` of the image's contents**.

To do this, it's quite simple!
Visit `lib/app_web/controllers/api_controller.ex`
and change the `create` function like so:

```elixir
    if fileIsAnImage do

      # Create `CID` from file contents
      {:ok, file_binary} = File.read(image.path)
      file_cid = Cid.cid(file_binary)
      file_name = "#{file_cid}.#{Enum.at(MIME.extensions(image.content_type), 0)}"

      # Upload to S3
      upload = image.path
      |> ExAws.S3.Upload.stream_file()
      |> ExAws.S3.upload("imgup-original", file_name, acl: :public_read)
      |> ExAws.request(get_ex_aws_request_config_override())
```




