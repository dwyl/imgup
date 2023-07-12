defmodule App.UploadTest do
  use ExUnit.Case, async: true

  @compressed_bucket Application.compile_env(:ex_aws, :compressed_bucket)
  @original_bucket Application.compile_env(:ex_aws, :original_bucket)

  test "upload/1 happy path REAL Upload" do
    image = %Plug.Upload{
      content_type: "image/png",
      filename: "phoenix.png",
      path: [:code.priv_dir(:app), "static", "images", "phoenix.png"] |> Path.join()
    }

    expected_response = %{
      compressed_url:
        "https://s3.eu-west-3.amazonaws.com/#{@compressed_bucket}/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png",
      url:
        "https://s3.eu-west-3.amazonaws.com/#{@original_bucket}/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png"
    }

    assert App.Upload.upload(image) == {:ok, expected_response}
  end

  test "upload/1 ginger.jpg (cat pic)" do
    image = %Plug.Upload{
      content_type: "image/jpeg",
      filename: "ginger.jpg",
      path: [:code.priv_dir(:app), "static", "images", "ginger.jpg"] |> Path.join()
    }

    expected_response = %{
      compressed_url:
        "https://s3.eu-west-3.amazonaws.com/#{@compressed_bucket}/zb2rhe5aFXPKonoWchLRYo9yJDqWyUdUeTQ6MQQJsTWnzzNum.jpg",
      url:
        "https://s3.eu-west-3.amazonaws.com/#{@original_bucket}/zb2rhe5aFXPKonoWchLRYo9yJDqWyUdUeTQ6MQQJsTWnzzNum.jpg"
    }
    assert App.Upload.upload(image) == {:ok, expected_response}
  end

  test "upload/1 corrupted.jpg CORRPUTED jpeg to test failure" do
    image = %Plug.Upload{
      content_type: "image/jpeg",
      filename: "corrupted.jpg",
      path: [:code.priv_dir(:app), "static", "images", "corrupted.jpg"] |> Path.join()
    }
    # Even though the jpeg is *deliberately* corrupted the upload & CID still works!!
    expected_response =  %{
      compressed_url: "https://s3.eu-west-3.amazonaws.com/#{@compressed_bucket}/zb2rhngHXWi8mR5YHX3Go4xDYpZqqcAtGefn8sktQMM7YzKEz.jpg",
      url: "https://s3.eu-west-3.amazonaws.com/#{@original_bucket}/zb2rhngHXWi8mR5YHX3Go4xDYpZqqcAtGefn8sktQMM7YzKEz.jpg"
    }
    assert App.Upload.upload(image) == {:ok, expected_response}
  end


  test "upload/1 an EMPTY file to test failure" do
    image = %Plug.Upload{
      content_type: "",
      filename: "empty",
      path: [:code.priv_dir(:app), "static", "images", "empty"] |> Path.join()
    }

    assert App.Upload.upload(image) == {:error, :invalid_extension}
  end
end
