defmodule AppWeb.ApiController do
  use AppWeb, :controller
  import SweetXml

  def create(conn, %{"image" => image}) do

    # Check if file is an image
    fileIsAnImage = String.contains?(image.content_type, "image")

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

  def get_ex_aws_request_config_override,
    do: Application.get_env(:ex_aws, :request_config_override)

end
