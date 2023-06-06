<div align="center">

# Uploading files in `Phoenix` through an API

Learn how to do image uploads from a `Phoenix` API!

</div>

> Before reading this guide,
> please follow the instructions in [`README.md`](./README.md),
> as this guide *continues* the progress made on it.


# 1. Add `/api` scope and pipeline and setting up controller

Let's create our API endpoint.
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

We need to create our `ApiController`
to serve these requests.
Inside `lib/app_web/controllers`,
create `api_controller.ex` 
and paste the following code.

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
  def render("create.json", _assigns) do
    %{url: "Some URL"}
  end

  def render(template, _assigns) do
    %{errors: %{detail: Phoenix.Controller.status_message_from_template(template)}}
  end
end
```

Now, depending on the status of the response,
we will render a sample response
`%{url: "Some URL"}`.
Don't worry, 
we'll change this with the public URL
after implementing the feature 
that uploads the image file to `S3`.


# 2. Uploading to `S3` bucket

In order to upload the file to an `S3` bucket,
we are going to make use of the 
[`ex_aws`](https://github.com/ex-aws/ex_aws) package.
Let's install it by adding the following lines 
to the `deps` section in `mix.exs`.

```elixir
      {:ex_aws, "~> 2.0"},
      {:ex_aws_s3, "~> 2.0"},
      {:sweet_xml, "~> 0.7"}
```

Run `mix deps.get` to download the dependencies.

Next, we need to add configuration
of this newly added dependencies
in `config/config.ex`.
Open it and add these lines.

```elixir
config :ex_aws,
  access_key_id: System.fetch_env!("AWS_ACCESS_KEY_ID"),
  secret_access_key: System.fetch_env!("AWS_SECRET_ACCESS_KEY"),
  region: "eu-west-3"
```

This configuration is quite self-explanatory.
We are setting the default region to the `S3` bucket location,
as well as setting our `access_key_id` and `secret_access_key`
from the env variables we were using earlier.

Now let's upload our files to `S3`!
In `lib/app_web/controllers/api_controller.ex`, 
change it to the following piece of code.

```elixir
defmodule AppWeb.ApiController do
  use AppWeb, :controller


  def create(conn, %{"image" => image}) do

    # Upload to S3
    upload = image.path
    |> ExAws.S3.Upload.stream_file()
    |> ExAws.S3.upload("imgup-original", image.filename, acl: :public_read)
    |> ExAws.request

    # Check if upload was successful
    case upload do
      {:ok, _body} ->
        render(conn, :success)

      {:error, error} ->

        {_error_atom, http_code, body} = error
        render(conn |> put_status(http_code), body)
    end

  end

  def create(conn, _params) do
    render(conn |> put_status(400), :field_error)
  end

end
```

We are pattern matching the request
so the person *has to* send the file
with a field named `image`.
If they don't, a Bad Request response is yielded.

If they do this correctly,
we use `S3.upload` to send the file
to the `imgup-original` bucket we've created previously
with the filename of the image.

Depending on the result of this upload,
we return a success or error response.
For this, 
we ought to make some changes to how the `json` response is rendered.
Open `lib/app_web/controllers/api_json.ex`
and change it so it has the following functions.

```elixir
  def render("success.json", _assigns) do
    %{url: "Some URL"}
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
the error coming from the `ex_aws` upload,
using its output to show the error details to the person.


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
    length: 5_000_000       # Add this new line
```

We are limiting the person to only upload
files up to `5MB`.

Now, let's limit the uploads to only image files!
Luckily for us, this is fairly simple!
The [`Plug.Upload`](https://hexdocs.pm/plug/1.14.0/Plug.Upload.html#types)
that is automatically parsed in our API
(the `image` variable)
already has a field called `content_type`, 
which we can use to check if the file is an image.

For this, 
open `lib/app_web/controllers/api_controller.ex`
and change the `def create(conn, %{"image" => image})` function
to:

```elixir
  def create(conn, %{"image" => image}) do

    # Check if file is an image
    fileIsAnImage = String.contains?(image.content_type, "image")

    if fileIsAnImage do

      # Upload to S3
      upload = image.path
      |> ExAws.S3.Upload.stream_file()
      |> ExAws.S3.upload("imgup-original", image.filename, acl: :public_read)
      |> ExAws.request

      # Check if upload was successful
      case upload do
        {:ok, _body} ->
          render(conn, :success)

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

Now we are checking the filetype of the uploaded file
and providing feedback *back to the person*!


# 4 Returning the URL to the person

On success,
it might be useful for the person using the API
to get the public link where the image is stored.
For this,
we simply need to **parse the XML response from the `S3` upload**.
For this, visit `lib/app_web/controllers/api_controller.ex`
and change the `def create(conn, %{"image" => image})`
to this:

```elixir
  def create(conn, %{"image" => image}) do

    # Check if file is an image
    fileIsAnImage = String.contains?(image.content_type, "image")

    if fileIsAnImage do

      # Upload to S3
      upload = image.path
      |> ExAws.S3.Upload.stream_file()
      |> ExAws.S3.upload("imgup-original", image.filename, acl: :public_read)
      |> ExAws.request

      # Check if upload was successful
      case upload do
        {:ok, body} ->
          url = body.body |> xpath(~x"//text()") |> List.to_string()
          render(conn, :success, %{url: url})

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

We are using
[`sweet_xml`](https://github.com/kbrw/sweet_xml)
we've imported earlier in our dependencies list.
This will allow us to parse the output from the `S3` upload,
which is in `XML` format.
It has a `<Location>` tag,
which is the URl we are interested in returning to the user.

We then pass this URL to the `render/3` function.
All we need to do is change it 
to *return this URL to the person*.

Open `lib/app_web/controllers/api_json.ex` 
and change to.

```elixir
  def render("success.json", assigns) do
    %{url: assigns.url}
  end
```

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