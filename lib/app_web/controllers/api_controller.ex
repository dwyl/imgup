defmodule AppWeb.ApiController do
  use AppWeb, :controller
  require Logger

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

  # Preserve backward compatibility with "image" keyword:
  def create(conn, %{"image" => image}) do
    # dbg(image)
    create(conn, %{"" => image})
  end
end
