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
  - [2.2 _Test_ the `upload/1` function](#22-test-the-upload1-function)
  - [2.3 _Use_ the `upload/1` function in `ApiController`](#23-use-the-upload1-function-in-apicontroller)
- [3. Limiting filetype and size](#3-limiting-filetype-and-size)
- [4. Testing the `API` from `Hoppscotch`](#4-testing-the-api-from-hoppscotch)
- [5. Returning meaningful errors](#5-returning-meaningful-errors)



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

  def upload(image) do
    # Create `CID` from file contents so filenames are unique
    #
    {:ok, file_binary} = File.read(image.path)
    file_cid = Cid.cid(file_binary)
    file_name = "#{file_cid}.#{Enum.at(MIME.extensions(image.content_type), 0)}"

    # Upload to S3
    {:ok, body} =
      image.path
      |> ExAws.S3.Upload.stream_file()
      |> ExAws.S3.upload("imgup-original", file_name, acl: :public_read)
      |> ExAws.request(get_ex_aws_request_config_override())

    # Fetch the contents of the returned XML string from `ex_aws`.
    # This XML is parsed with `sweet_xml`:
    # github.com/kbrw/sweet_xml#the-x-sigil
    url = body.body |> xpath(~x"//text()") |> List.to_string()
    compressed_url = "#{@compressed_baseurl}#{file_name}"
    {:ok, %{url: url, compressed_url: compressed_url}}
  end

  def get_ex_aws_request_config_override,
    do: Application.get_env(:ex_aws, :request_config_override)
end

```

The `upload/1` function uses a `Content ID` (`cid`)
as the filename for the uploaded `image`. 
Use the `cid` and concatenate with the extension of the 
*content type of the image*.
This way, we'll have a cid with the correct format,
e.g: `zb2rhhPShfsYqzqYPG8wxnsb4zNe2HxDrqKRxU6wSWQQWMHsZ.jpg`.


To parse the `XML` response returned by `AWS`,
[`sweet_xml`](https://github.com/kbrw/sweet_xml)
is used.
The response has a `<Location>` tag,
which is the `URL` we are returning.


## 2.2 _Test_ the `upload/1` function

Create a test file `test/app/upload_test.exs`
and add the following code to it:

```elixir
defmodule App.UploadTest do
  use ExUnit.Case, async: true

  test "upload/1 happy path REAL Upload" do
    image = %Plug.Upload{
      content_type: "image/png",
      filename: "phoenix.png",
      path: [:code.priv_dir(:app), "static", "images", "phoenix.png"] |> Path.join()
    }

    expected_response = %{
      compressed_url:
        "https://s3.eu-west-3.amazonaws.com/imgup-compressed/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png",
      url:
        "https://s3.eu-west-3.amazonaws.com/imgup-original/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png"
    }

    assert App.Upload.upload(image) == {:ok, expected_response}
  end
end
```

Run the test with:

```sh
mix test test/app/upload_test.exs
```

> **Note**: this is an end-to-end test that uploads a _real_ file to `S3`, no "mocks".
> So you will need to have the environment variables defined for this to work. 


## 2.3 _Use_ the `upload/1` function in `ApiController`

In `lib/app_web/controllers/api_controller.ex`, 
change it to the following piece of code: 

```elixir
defmodule AppWeb.ApiController do
  use AppWeb, :controller
  require Logger

  def create(conn, %{"" => params}) do
    # check if content_type e.g: "image/png"
    if String.contains?(params.content_type, "image") do
      try do
        {:ok, body} = App.Upload.upload(params)
        render(conn, :success, body)
      rescue
        e ->
          Logger.error(Exception.format(:error, e, __STACKTRACE__))
          render(conn |> put_status(400), %{body: "Error uploading file #26"})
      end
    else
      render(conn |> put_status(400), %{body: "Uploaded file is not a valid image."})
    end
  end

  # preserve backward compatibility with "image" keyword:
  def create(conn, %{"image" => image}) do
    create(conn, %{"" => image})
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


# 4. Testing the `API` from `Hoppscotch` 

Once you've saved all the files, 
run the app with the command: 

```sh
mix s
```

Open `Hoppscotch` on your `localhost` and prepare to upload!

> **Note**: if you're new to using `Hoppscotch` for `API` testing, 
> see: 
> [`hoppscotch.md`](https://github.com/dwyl/mvp/blob/main/lib/api/hoppscotch.md)
> For uploading files see:
> https://docs.hoppscotch.io/documentation/getting-started/rest/uploading-data/


1. Create a `POST` request with the `URL`: `http://localhost:4000/api/images`.
2. Set the `Content Type` to `multipart/form-data` and 
3. Select a file to upload

![imgup-hoppscotch-upload-via-api](https://github.com/dwyl/imgup/assets/194400/c6d529bf-effd-40b4-9a5d-e5760c199344)


You should see a public `URL` after uploading an `image` file:

```json
{
  "compressed_url":
    "https://s3.eu-west-3.amazonaws.com/imgup-compressed/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png",
  "url":
    "https://s3.eu-west-3.amazonaws.com/imgup-original/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png"
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

# 5. Returning meaningful errors

If something *fails*, the person using the API
will have a `JSON` body stating 
`"Error uploading file #26"` returned.
This type of information is not particularly *useful*.
We don't know exactly *why* it failed, 
we just know it did.

In order to fix this, 
let's make some changes to tell the person
a more meaningful message so they know *what went wrong*.
We want the person to know whether any of these scenarios:
- reading the `path` from the `image`.
- creating the `CID` from the file contents.
- getting the `file extension`.
- uploading the file to `S3`.

Before making any changes, let's add a few tests to cover these.
First, let's create an empty file, which will be used in our tests.
In `priv/static/images`, create an empty file called `empty`.

After this,
open `test/app_web/api_test.exs` and add this.

```elixir
  import Mock

  @empty_file %{
    "" => %Plug.Upload{
      content_type: "image/something",
      filename: "empty",
      path: [:code.priv_dir(:app), "static", "images", "empty"] |> Path.join()
    }
  }

  test "empty file should return appropriate error", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @empty_file)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Error uploading file. The file extension and contents are invalid."
           }
  end

  test "empty image (meaning it has a valid content type) should return an error", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @empty_image)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Error uploading file. Failure creating the CID filename."
           }
  end

  test "valid file but the upload to S3 failed. It should return an error.", %{conn: conn} do

    with_mock ExAws, [request: fn(_input) -> {:error, :failure} end] do
      conn = post(conn, ~p"/api/images", @valid_image_attrs)

      assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
               "detail" => "Error uploading file. There was an error uploading the file to S3."
             }
    end
  end
```

> **Note** 
>
> We are using the [`mock` ](https://github.com/jjh42/mock)
> library so we are able to correctly test 
> whenever `S3` is down.
> Although using mocks *can lead to false positives*,
> here's acceptable because we're simulating a third-party service to be down.


We've added a test for each scenario 
and what we expect the API to return to us.
We are using the `empty` file
to simulate an invalid binary file content,
which will result in failing the `CID` creation.
Check the files needed for these test to pass inside
[`priv/static/images`](./priv/static/images/).

Now let's implement the features so our tests pass! ✅

Open `lib/app/upload.ex`.
We are going to refactor this function
so it returns specific errors 
as the image is read all the way until it is uploaded to `S3`.

```elixir
def upload(image) do
    # Create `CID` from file contents so filenames are unique
    case File.read(image.path) do
      {:ok, file_binary} ->
        contents = if byte_size(file_binary) == 0, do: [], else: file_binary
        file_cid = Cid.cid(contents)

        file_extension =
          image.content_type
          |> MIME.extensions()
          |> List.first()

        # Check if file `cid` and extension are valid.
        case {file_cid, file_extension} do
          {"invalid data type", nil} ->
            {:error, :invalid_extension_and_cid}

          {"invalid data type", _extension} ->
            {:error, :invalid_cid}

          {_cid, nil} ->
            {:error, :invalid_extension}

          # If the `cid` and extension are valid, we are safe to upload
          {file_cid, file_extension} ->
            # Creating filename with the retrieved extension
            file_name = "#{file_cid}.#{file_extension}"

            # Upload to S3
            request_response =
              try do
                image.path
                |> ExAws.S3.Upload.stream_file()
                |> ExAws.S3.upload(Application.get_env(:ex_aws, :original_bucket), file_name,
                  acl: :public_read,
                  content_type: image.content_type
                )
                |> ExAws.request(get_ex_aws_request_config_override())
              rescue
                _e ->
                  {:error, :upload_fail}
              end

            # Check if the request was successful
            case request_response do
              # If the request was successful, we parse the result
              {:ok, body} ->
                # Sample response:
                # %{
                #   body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\n
                #    <CompleteMultipartUploadResult xmlns=\"http://s3.amazonaws.com/doc/2006-03-01/\">
                #    <Location>https://s3.eu-west-3.amazonaws.com/imgup-original/qvWtbC7WaT.jpg</Location>
                #    <Bucket>imgup-original</Bucket><Key>qvWtbC7WaT.jpg</Key>
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
                # }

                # Fetch the contents of the returned XML string from `ex_aws`.
                # This XML is parsed with `sweet_xml`:
                # github.com/kbrw/sweet_xml#the-x-sigil
                url = body.body |> xpath(~x"//text()") |> List.to_string()
                compressed_url = "#{@compressed_baseurl}#{file_name}"
                {:ok, %{url: url, compressed_url: compressed_url}}

              # If the request was unsuccessful, throw an error
              {:error, _reason} ->
                {:error, :upload_fail}
            end
        end

      {:error, _reason} ->
        {:error, :failure_read}
    end
  end
```

We've added [`case`](https://elixir-lang.org/getting-started/case-cond-and-if.html)
statements for the aforementioned scenarios:

In each of these cases,
we yield a tuple `{:error, reason}`.

All we have to do now is to change the function that *uses*
our refactored `upload/1` function!

Head over to `lib/app_web/controllers/api_controller.ex`
and change the following function so it pattern matches
the possible returning value from `upload/1`.

```elixir
def create(conn, %{"" => params}) do

    # Check if content_type e.g: "image/png"
    if String.contains?(params.content_type, "image") do
      case App.Upload.upload(params) do
        {:ok, body} ->
          render(conn, :success, body)

        {:error, :failure_read} ->
          render(conn |> put_status(400), %{body: "Error uploading file. Failure reading file."})

        {:error, :invalid_cid} ->
          render(conn |> put_status(400), %{
            body: "Error uploading file. Failure creating the CID filename."
          })

        {:error, :invalid_extension_and_cid} ->
          render(conn |> put_status(400), %{
            body: "Error uploading file. The file extension and contents are invalid."
          })

        {:error, :upload_fail} ->
          render(conn |> put_status(400), %{
            body: "Error uploading file. There was an error uploading the file to S3."
          })
      end
    else
      render(conn |> put_status(400), %{body: "Uploaded file is not a valid image."})
    end
  end
```

As you can see, we're returning a `JSON` object
to the person with a specific error
depending on the outcome of the `upload/1` function.

And that's it!
Quite simple, right?

If we run `mix test`,
all tests should pass!


```sh
...........
Finished in 1.1 seconds (1.0s async, 0.1s sync)
15 tests, 0 failures
```
