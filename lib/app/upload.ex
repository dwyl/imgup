defmodule App.Upload do
  @moduledoc """
  Handles uploading to S3 in a convenient reusable (DRY) function.
  """
  import SweetXml
  require Logger

  @original_bucket Application.compile_env(:ex_aws, :original_bucket)
  @compressed_bucket Application.compile_env(:ex_aws, :compressed_bucket)
  @compressed_baseurl "https://s3.eu-west-3.amazonaws.com/#{@compressed_bucket}/"

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
      url = upload_response_body.body |> xpath(~x"//text()") |> List.to_string()
      compressed_url = "#{@compressed_baseurl}#{file_name}"
      {:ok, %{url: url, compressed_url: compressed_url}}
    else
      {:error, reason} -> {:error, reason}
    end
  end

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
        |> ExAws.S3.upload(@original_bucket, file_name,
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

  def get_ex_aws_request_config_override,
    do: Application.get_env(:ex_aws, :request_config_override)
end
