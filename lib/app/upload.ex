defmodule App.Upload do
  @moduledoc """
  Handles uploading to S3 in a convenient reusable (DRY) function.
  """
  require Logger

  # function gets cached
  defp compressed_baseurl() do
    compressed_bucket = Application.get_env(:ex_aws, :compressed_bucket)
    "https://s3.eu-west-3.amazonaws.com/#{compressed_bucket}/"
  end

  @doc """
  `upload/1` receives an `image` with the format
  %{
    path: "/var/folders/0n/g78kfqfx4vn65p_2kl7fmtl00000gn/T/plug-1686/multipart-1686652824",
    content_type: "image/png",
    filename: "my-awesome-image.png"
  }
  Uploads to `AWS S3` using `ExAws.S3.upload` and returns the result.
  If the upload fails for whatever reason (invalid content type, invalid CID, request to S3 fails),
  the an error is returned `{:error, reason}`.
  """
  def upload(image) do
    with {:ok, {file_cid, file_extension}} <- check_file_binary_and_extension(image),
         {:ok, {file_name, upload_response_body}} <-
           upload_file_to_s3(file_cid, file_extension, image) do
      # Fetching the URL of the returned file.
      url = upload_response_body.body.location

      # Creating the compressed URL to return as well
      compressed_url = "#{compressed_baseurl()}#{file_name}"
      {:ok, %{url: url, compressed_url: compressed_url}}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  def upload_file_to_s3(file_cid, file_extension, image) do
    # Creating filename with the retrieved extension
    file_name = "#{file_cid}.#{file_extension}"
    s3_bucket = Application.get_env(:ex_aws, :original_bucket)

    # Make request.
    # Return the body of the response if successful.
    # Otherwise, error.
    try do
      {:ok, upload_response_body} =
        image.path
        |> ExAws.S3.Upload.stream_file()
        |> ExAws.S3.upload(s3_bucket, file_name,
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
            Logger.error(
              "File extension is invalid and the CID derived from the file contents is also invalid: #{inspect(image)}"
            )

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

  def get_ex_aws_request_config_override,
    do: Application.get_env(:ex_aws, :request_config_override)
end
