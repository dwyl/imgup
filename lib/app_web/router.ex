defmodule AppWeb.Router do
  alias AppWeb.HomeController
  use AppWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {AppWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", AppWeb do
    pipe_through :browser

    get "/", PageController, :home
    live "/liveview", ImgupLive
  end

  # Other scopes may use custom stacks.
  scope "/api", AppWeb do
    pipe_through :api

    resources "/images", ApiController, only: [:create]
  end
end
