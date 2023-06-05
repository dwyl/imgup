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

