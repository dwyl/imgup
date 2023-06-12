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

end
