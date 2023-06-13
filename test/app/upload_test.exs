defmodule App.UploadTest do
  use ExUnit.Case

  # @valid_aws_access_key_id System.fetch_env!("AWS_ACCESS_KEY_ID")
  # @invalid_aws_access_key "AKIAIOSFODNN7EXAMPLE"

  test "upload/1 happy path REAL Upload" do
    image = %Plug.Upload{
      content_type: "image/png",
      filename: "phoenix.png",
      path: [:code.priv_dir(:app), "static", "images", "phoenix.png"] |> Path.join()
    }

    expected_response = %{
      compressed_url: "https://s3.eu-west-3.amazonaws.com/imgup-compressed/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png",
      url: "https://s3.eu-west-3.amazonaws.com/imgup-original/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png"
    }

    assert App.Upload.upload(image) == {:ok, expected_response}
  end
end
