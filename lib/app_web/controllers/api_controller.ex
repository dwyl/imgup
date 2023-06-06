defmodule AppWeb.ApiController do
  use AppWeb, :controller
  import SweetXml

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

  def create(conn, _params) do
    render(conn |> put_status(400), :field_error)
  end

end