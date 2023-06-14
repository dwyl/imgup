defmodule AppWeb.APITest do
  use AppWeb.ConnCase, async: true

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

  test "upload succeeds (happy path)", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @create_attrs)

    expected = %{
      "compressed_url" =>
        "https://s3.eu-west-3.amazonaws.com/imgup-compressed/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png",
      "url" =>
        "https://s3.eu-west-3.amazonaws.com/imgup-original/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png"
    }

    assert Jason.decode!(response(conn, 200)) == expected
  end

  test "upload with image keyword", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @valid_image_attrs)

    expected = %{
      "compressed_url" =>
        "https://s3.eu-west-3.amazonaws.com/imgup-compressed/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png",
      "url" =>
        "https://s3.eu-west-3.amazonaws.com/imgup-original/zb2rhXACvyoVCaV1GF5ozeoNCXYdxcKAEWvBTpsnabo3moYwB.png"
    }

    assert Jason.decode!(response(conn, 200)) == expected
  end

  test "wrong file extension", %{conn: conn} do
    conn = post(conn, ~p"/api/images", @invalid_attrs)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Uploaded file is not a valid image."
           }
  end

  # github.com/elixir-lang/elixir/blob/main/lib/elixir/test/elixir/kernel/raise_test.exs
  test "non existent image throws runtime error (test rescue branch)", %{conn: conn} do
    IO.puts(" -> Don't Panic! This error stack trace is expected when file doesn't exist: ")
    conn = post(conn, ~p"/api/images", @non_existent_image)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{
             "detail" => "Error uploading file #26"
           }
  end
end
