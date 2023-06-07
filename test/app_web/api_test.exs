defmodule AppWeb.APITest do
  use AppWeb.ConnCase
  import Mox

  @create_attrs %{
    "image" => %Plug.Upload{
      content_type: "image/png",
      filename: "phoenix.png",
      path: [:code.priv_dir(:app), "static", "images", "phoenix.png"] |> Path.join()
    }
  }

  @invalid_attrs %{
    "image" => %Plug.Upload{
      content_type: "application/pdf",
      filename: "some_pdf.pdf",
      path: [:code.priv_dir(:app), "static", "images", "some.pdf"] |> Path.join()
    }
  }

  @invalid_field %{
    "invalid" => %Plug.Upload{
      content_type: "application/pdf",
      filename: "some_pdf.pdf",
      path: [:code.priv_dir(:app), "static", "images", "some.pdf"] |> Path.join()
    }
  }


  test "upload fails", %{conn: conn} do
    # Stub the ExAws behaviour
    stub(ExAws.Request.HttpMock, :request, fn
      _method, _url, _body, _headers, _opts ->
           {:ok, %{status_code: 400, body: "error"}}
    end)

    conn = post(conn, ~p"/api/images", @create_attrs)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{"detail" => "error"}
  end

  test "wrong file extension", %{conn: conn} do
    # Stub the ExAws behaviour
    stub(ExAws.Request.HttpMock, :request, fn
      _method, _url, _body, _headers, _opts ->
           {:ok, %{status_code: 400, body: "error"}}
    end)

    conn = post(conn, ~p"/api/images", @invalid_attrs)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{"detail" => "File is not an image."}
  end

  test "wrong field passed", %{conn: conn} do
    # Stub the ExAws behaviour
    stub(ExAws.Request.HttpMock, :request, fn
      _method, _url, _body, _headers, _opts ->
           {:ok, %{status_code: 400, body: "error"}}
    end)

    conn = post(conn, ~p"/api/images", @invalid_field)

    assert Map.get(Jason.decode!(response(conn, 400)), "errors") == %{"detail" => "No \'image'\ field provided."}
  end

  test "valid call", %{conn: conn} do
    # Stub the ExAws behaviour
    stub(ExAws.Request.HttpMock, :request, fn
      _method, _url, _body, _headers, _opts ->
        {:ok,
        %{
          body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\n<CompleteMultipartUploadResult xmlns=\"http://s3.amazonaws.com/doc/2006-03-01/\"><Location>https://s3.eu-west-3.amazonaws.com/imgup-original/phoenix.png</Location><Bucket>imgup-original</Bucket><Key>115faa2f5cbe273cfc9fbcffd44b7eab.1000x1000x1.jpg</Key><ETag>\"ab6e7ac6323915e0f8995ae9cec21d99-1\"</ETag></CompleteMultipartUploadResult>",
          status_code: 200,
          src: [],
          opts: [],
          bucket: "bucket",
          path: "path",
        }}
    end)

    conn = post(conn, ~p"/api/images", @create_attrs)

    assert Map.get(Jason.decode!(response(conn, 200)), "url") == "https://s3.eu-west-3.amazonaws.com/imgup-original/phoenix.png"
  end

end
