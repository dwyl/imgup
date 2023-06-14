defmodule AppWeb.ApiController do
  use AppWeb, :controller
  require Logger

  def create(conn, %{"" => params}) do
    dbg(params)
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
    dbg(image)
    create(conn, %{"" => image})
  end
end
