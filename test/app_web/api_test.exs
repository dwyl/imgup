defmodule AppWeb.APITest do
  use AppWeb.ConnCase, async: true

  # import Mock

  # without image keyword:
  @create_attrs %{
    "" => %Plug.Upload{
      content_type: "image/png",
      filename: "phoenix.png",
      path: [:code.priv_dir(:app), "static", "images", "phoenix.png"] |> Path.join()
    }
  }

  # with "image" keyword in params
  @valid_image_attrs %{
    "image" => %Plug.Upload{
      content_type: "image/png",
      filename: "phoenix.png",
      path: [:code.priv_dir(:app), "static", "images", "phoenix.png"] |> Path.join()
    }
  }

  # Valid PDF
  @valid_pdf_attrs %{
    "image" => %Plug.Upload{
      content_type: "application/pdf",
      filename: "ginger.pdf",
      path: [:code.priv_dir(:app), "static", "images", "ginger.pdf"] |> Path.join()
    }
  }

  # random non-existent pdf
  @invalid_attrs %{
    "" => %Plug.Upload{
      content_type: "application/pdf",
      filename: "some_pdf.pdf",
      path: [:code.priv_dir(:app), "static", "images", "some.pdf"] |> Path.join()
    }
  }

  # non-existent image
  @non_existent_image %{
    "" => %Plug.Upload{
      content_type: "image/png",
      filename: "fail.png",
      path: [:code.priv_dir(:app), "static", "images", "fail.png"] |> Path.join()
    }
  }

  # empty_file
  @empty_file %{
    "" => %Plug.Upload{
      content_type: "image_something",
      filename: "empty",
      path: [:code.priv_dir(:app), "static", "images", "empty"] |> Path.join()
    }
  }

  # empty image
  @empty_image %{
    "" => %Plug.Upload{
      content_type: "image/jpeg",
      filename: "empty.jpg",
      path: [:code.priv_dir(:app), "static", "images", "empty.jpg"] |> Path.join()
    }
  }

  # image with invalid content type
  @invalid_content_type_image %{
    "" => %Plug.Upload{
      content_type: "image/xyz",
      filename: "phoenix.xyz",
      path: [:code.priv_dir(:app), "static", "images", "phoenix.xyz"] |> Path.join()
    }
  }

  test "upload succeeds (happy path)", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @create_attrs)

    expected = %{
      "compressed_url" =>
        "https://s3.eu-west-3.amazonaws.com/#{Application.get_env(:ex_aws, :compressed_bucket)}/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png",
      "url" =>
        "https://s3.eu-west-3.amazonaws.com/#{Application.get_env(:ex_aws, :original_bucket)}/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png"
    }

    assert Jason.decode!(response(conn, 200)) == expected
  end

  test "upload with image keyword", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @valid_image_attrs)

    expected = %{
      "compressed_url" =>
        "https://s3.eu-west-3.amazonaws.com/#{Application.get_env(:ex_aws, :compressed_bucket)}/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png",
      "url" =>
        "https://s3.eu-west-3.amazonaws.com/#{Application.get_env(:ex_aws, :original_bucket)}/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png"
    }

    assert Jason.decode!(response(conn, 200)) == expected
  end

  test "upload pdf", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @valid_pdf_attrs)
    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
      "detail" => "Uploaded file is not a valid image."
    }
  end

  test "wrong file extension", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @invalid_attrs)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Uploaded file is not a valid image."
           }
  end

  # github.com/elixir-lang/elixir/blob/main/lib/elixir/test/elixir/kernel/raise_test.exs
  test "non existent image throws runtime error (test rescue branch)", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @non_existent_image)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Error uploading file. Failure reading file."
           }
  end

  test "empty file should return appropriate error", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @empty_file)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "There was an error uploading the file. Please try again later."
           }
  end

  test "image file with invalid content type should return appropriate error", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @invalid_content_type_image)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Error uploading file. The content type of the uploaded file is not valid."
           }
  end

  test "file with invalid binary data type and extension should return error. ", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @empty_image)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Error uploading file. The contents of the uploaded file may be empty or invalid."
           }
  end

  # This MOCK is excluded because it doesn't do what we think it should ...
  # See: https://github.com/dwyl/imgup/pull/86/files#r1264339056
  # test "valid file but the upload to S3 failed. It should return an error.", %{conn: conn} do
  #   with_mock ExAws, [request: fn(_input) -> {:error, :failure} end] do
  #     conn = post(conn, ~p"/api/images", @valid_image_attrs)

  #     assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
  #              "detail" => "Error uploading file. There was an error uploading the file to S3."
  #            }
  #   end
  # end
end
