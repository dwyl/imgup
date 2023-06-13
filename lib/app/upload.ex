defmodule App.Upload do
  @moduledoc """
  Handles uploading to S3 in a convenient reusable (DRY) function.
  """
  import SweetXml

  @region Application.compile_env(:ex_aws, :region)
  @compressed_baseurl "https://s3.#{@region}.amazonaws.com/imgup-compressed/"

  @doc """
  `upload/1` receives an `image` with the format
  %{
    path: "/var/folders/0n/g78kfqfx4vn65p_2kl7fmtl00000gn/T/plug-1686/multipart-1686652824",
    content_type: "image/png",
    filename: "my-awesome-image.png"
  }
  Uploads to `AWS S3` using `ExAws.S3.upload` and returns the result.
  """
  def upload(image) do
    # Create `CID` from file contents so filenames are unique
    #
    {:ok, file_binary} = File.read(image.path)
    file_cid = Cid.cid(file_binary)
    file_name = "#{file_cid}.#{Enum.at(MIME.extensions(image.content_type), 0)}"

    # Upload to S3
    {:ok, body} = image.path
      |> ExAws.S3.Upload.stream_file()
      |> ExAws.S3.upload("imgup-original", file_name, acl: :public_read)
      |> ExAws.request(get_ex_aws_request_config_override())
      # |> dbg()

    # Sample response:
    # %{
    #   body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\n
    #    <CompleteMultipartUploadResult xmlns=\"http://s3.amazonaws.com/doc/2006-03-01/\">
    #    <Location>https://s3.eu-west-3.amazonaws.com/imgup-original/zb2rhcoyUPqvWtbC7WaT.jpg</Location>
    #    <Bucket>imgup-original</Bucket><Key>zb2rhco5pVyouQGX1FQFfYtiA89QswquLbcsyUPqvWtbC7WaT.jpg</Key>
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
    # case upload do
    #   {:ok, body} ->
        # Fetch the contents of the returned XML string from `ex_aws`.
        # This XML is parsed with `sweet_xml`:
        # github.com/kbrw/sweet_xml#the-x-sigil
        url = body.body |> xpath(~x"//text()") |> List.to_string()
        compressed_url = "#{@compressed_baseurl}#{file_name}"
        {:ok, %{url: url, compressed_url: compressed_url}}

      # return the error for handling in the controller
    #   {:error, error} ->
    #     {:error, error}
    # end
  end

  def get_ex_aws_request_config_override,
    do: Application.get_env(:ex_aws, :request_config_override)
end
