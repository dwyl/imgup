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
While this information is useful to know
*where* the code failed,
it's more relevant for developers than for the average API consumer.
The developers might know exactly exactly *why* it failed, 
but the API clients might not.

In order to fix this, 
let's make some changes to tell the person
a more meaningful message so they know *what went wrong*.
We want the person to know whether any of these scenarios:
- reading the `path` from the `image`.
- parsing the file contents.
- uploading the file to `S3`.

Before making any changes, let's add a few tests to cover these.
Open `test/app_web/api_test.exs` and change it like so.

```elixir
defmodule AppWeb.APITest do
  use AppWeb.ConnCase, async: true

  # without image keyword:
  @create_attrs %{
    "" => %Plug.Upload{
      content_type: "image/png",
      filename: "phoenix.png",
      path: [:code.priv_dir(:app), "static", "images", "phoenix.png"] |> Path.join()
    }
  }

  # with "image" keyword in params
  @valid_image_attrs %{
    "image" => %Plug.Upload{
      content_type: "image/png",
      filename: "phoenix.png",
      path: [:code.priv_dir(:app), "static", "images", "phoenix.png"] |> Path.join()
    }
  }

  # Valid PDF
  @valid_pdf_attrs %{
    "image" => %Plug.Upload{
      content_type: "application/pdf",
      filename: "ginger.pdf",
      path: [:code.priv_dir(:app), "static", "images", "ginger.pdf"] |> Path.join()
    }
  }

  # random non-existent pdf
  @invalid_attrs %{
    "" => %Plug.Upload{
      content_type: "application/pdf",
      filename: "some_pdf.pdf",
      path: [:code.priv_dir(:app), "static", "images", "some.pdf"] |> Path.join()
    }
  }

  # non-existent image
  @non_existent_image %{
    "" => %Plug.Upload{
      content_type: "image/png",
      filename: "fail.png",
      path: [:code.priv_dir(:app), "static", "images", "fail.png"] |> Path.join()
    }
  }

  # empty_file
  @empty_file %{
    "" => %Plug.Upload{
      content_type: "image_something",
      filename: "empty",
      path: [:code.priv_dir(:app), "static", "images", "empty"] |> Path.join()
    }
  }

  # empty image
  @empty_image %{
    "" => %Plug.Upload{
      content_type: "image/jpeg",
      filename: "empty.jpg",
      path: [:code.priv_dir(:app), "static", "images", "empty.jpg"] |> Path.join()
    }
  }

  # image with invalid content type
  @invalid_content_type_image %{
    "" => %Plug.Upload{
      content_type: "image/xyz",
      filename: "phoenix.xyz",
      path: [:code.priv_dir(:app), "static", "images", "phoenix.xyz"] |> Path.join()
    }
  }

  test "upload succeeds (happy path)", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @create_attrs)

    expected = %{
      "compressed_url" =>
        "https://s3.eu-west-3.amazonaws.com/#{Application.get_env(:ex_aws, :compressed_bucket)}/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png",
      "url" =>
        "https://s3.eu-west-3.amazonaws.com/#{Application.get_env(:ex_aws, :original_bucket)}/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png"
    }

    assert Jason.decode!(response(conn, 200)) == expected
  end

  test "upload with image keyword", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @valid_image_attrs)

    expected = %{
      "compressed_url" =>
        "https://s3.eu-west-3.amazonaws.com/#{Application.get_env(:ex_aws, :compressed_bucket)}/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png",
      "url" =>
        "https://s3.eu-west-3.amazonaws.com/#{Application.get_env(:ex_aws, :original_bucket)}/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png"
    }

    assert Jason.decode!(response(conn, 200)) == expected
  end

  test "upload pdf", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @valid_pdf_attrs)
    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
      "detail" => "Uploaded file is not a valid image."
    }
  end

  test "wrong file extension", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @invalid_attrs)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Uploaded file is not a valid image."
           }
  end

  # github.com/elixir-lang/elixir/blob/main/lib/elixir/test/elixir/kernel/raise_test.exs
  test "non existent image throws runtime error (test rescue branch)", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @non_existent_image)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Error uploading file. Failure reading file."
           }
  end

  test "empty file should return appropriate error", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @empty_file)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "There was an error uploading the file. Please try again later."
           }
  end

  test "image file with invalid content type should return appropriate error", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @invalid_content_type_image)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Error uploading file. The content type of the uploaded file is not valid."
           }
  end

  test "file with invalid binary data type and extension should return error. ", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @empty_image)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Error uploading file. The contents of the uploaded file may be empty or invalid."
           }
  end

end

```

We've added a test for each scenario 
and what we expect the API to return to us.
We are using the `empty` file
to simulate an invalid binary file content,
which will result in failing the `CID` creation.
We are using other types of files to test other scenarios.
Check the files needed for these test to pass inside
[`priv/static/images`](./priv/static/images/).

Now let's implement the features so our tests pass! ✅

Open `lib/app/upload.ex`.

Add the following function definition:

```elixir
  def check_file_binary_and_extension(image) do
    case File.read(image.path) do
      # Create `CID` from file contents so filenames are unique
      {:ok, file_binary} ->
        contents = if byte_size(file_binary) == 0, do: [], else: file_binary
        file_cid = Cid.cid(contents)

        file_extension =
          image.content_type
          |> MIME.extensions()
          |> List.first()

        # Return the file's content CID and its MIME extension if valid.
        # Otherwise, return error.
        case {file_cid, file_extension} do
          {"invalid data type", nil} ->
            Logger.error("File extension is invalid and the CID derived from the file contents is also invalid: #{inspect(image)}")
            {:error, :invalid_extension_and_cid}

          {"invalid data type", _extension} ->
            Logger.error("The CID derived from the file contents is invalid: #{inspect(image)}")
            {:error, :invalid_cid}

          {_cid, nil} ->
            Logger.error("File extension is invalid: #{inspect(image)}")
            {:error, :invalid_extension}

          {file_cid, file_extension} ->
            {:ok, {file_cid, file_extension}}
        end

      # If image can't be opened, return error
      {:error, reason} ->
        Logger.error("Problem reading file: #{inspect(reason)}")
        {:error, :failure_read}
    end
  end
```

This function will try to open the downloaded image file
and check its contents and content type.
We are pattern matching possible scenarios where this can go wrong:

- the contents of the file might be invalid/empty, 
so creating a `CID` is not possible.
- the `content type` of the image file is not valid.
- reading the file errored out.

All of these scenarios are promptly **logged**
so we know what went wrong if a request errors.

Let's put the `S3` request in a different function.
In the same file,
add:

```elixir
  def upload_file_to_s3(file_cid, file_extension, image) do
    # Creating filename with the retrieved extension
    file_name = "#{file_cid}.#{file_extension}"

    # Make request.
    # Return the body of the response if successful.
    # Otherwise, error.
    try do
      {:ok, upload_response_body} =
        image.path
        |> ExAws.S3.Upload.stream_file()
        |> ExAws.S3.upload(Application.get_env(:ex_aws, :original_bucket), file_name,
          acl: :public_read,
          content_type: image.content_type
        )
        |> ExAws.request(get_ex_aws_request_config_override())

      {:ok, {file_name, upload_response_body}}
    rescue
      e ->
        Logger.error("There was a problem uploading the file to S3.")
        Logger.error(Exception.format(:error, e, __STACKTRACE__))
        {:error, :upload_fail}
    end
  end
```

Similarly, we are trying to create a request
with the given image file, extension and created `CID`.
If anything happens, the error is logged 
and it's returned.


We can now use both these functions
`check_file_binary_and_extension/1`
and `upload_file_to_s3/3`
in our `upload/1` function, 
making it simpler!



```elixir
  def upload(image) do
    with {:ok, {file_cid, file_extension}} <- check_file_binary_and_extension(image),
         {:ok, {file_name, upload_response_body}} <-
           upload_file_to_s3(file_cid, file_extension, image) do
      # Sample AWS S3 XML response:
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
      #
      # Fetching the URL of the returned file.
      url = upload_response_body.body |> xpath(~x"//text()") |> List.to_string()

      # Creating the compressed URL to return as well
      compressed_bucket_baseurl = "https://s3.eu-west-3.amazonaws.com/#{Application.get_env(:ex_aws, :compressed_bucket)}/"
      compressed_url = "#{compressed_bucket_baseurl}#{file_name}"
      {:ok, %{url: url, compressed_url: compressed_url}}
    else
      {:error, reason} -> {:error, reason}
    end
  end
```


We return the tuple `{:error, reason}` that is matched
on whatever error occurred during the file check and uploading process.
This error is to later be handled
by the API controller,
where an appropriate message is shown to the person so they know what exactly went wrong. 

All we have to do now is to change the function that *uses*
our refactored `upload/1` function!

Head over to `lib/app_web/controllers/api_controller.ex`
and change the following function so it pattern matches
the possible returning values from `upload/1`.

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
            body:
              "Error uploading file. The contents of the uploaded file may be empty or invalid."
          })

        {:error, :invalid_extension} ->
          render(conn |> put_status(400), %{
            body:
              "Error uploading file. The content type of the uploaded file is not valid."
          })

        _ ->
          render(conn |> put_status(400), %{
            body: "There was an error uploading the file. Please try again later."
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
Some errors are highly unlikely to happen
(for example, the `S3` request might fail but
this event is exceedingly rare, 
[given that the last outage was in 2017](https://aws.amazon.com/message/41926/)),
so we provide a more generic response to the person.
But we're logging this event, 
so we can backtrace later to know exactly why a request errored!

And that's it!
Quite simple, right?

If we run `mix test`,
all tests should pass!


```sh
...........
Finished in 1.1 seconds (1.0s async, 0.1s sync)
21 tests, 0 failures
```
