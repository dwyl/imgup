defmodule App.Upload do
  @moduledoc """
  Handles uploading to S3 in a convenient reusable (DRY) function.
  """

  def upload(image) do
    # Create `CID` from file contents
      {:ok, file_binary} = File.read(image.path)
      file_cid = Cid.cid(file_binary)
      file_name = "#{file_cid}.#{Enum.at(MIME.extensions(image.content_type), 0)}"

      # Upload to S3
      image.path
      |> ExAws.S3.Upload.stream_file()
      |> ExAws.S3.upload("imgup-original", file_name, acl: :public_read)
      |> ExAws.request(get_ex_aws_request_config_override())
      |> dbg()
  end

  def get_ex_aws_request_config_override,
    do: Application.get_env(:ex_aws, :request_config_override)
end
