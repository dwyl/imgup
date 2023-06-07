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

  #test "valid call", %{conn: conn} do
  #  # Stub the ExAws behaviour
  #  stub(ExAws.Request.HttpMock, :request, fn
  #    _method, _url, _body, _headers, _opts ->
  #      {:ok,
  #        %{
  #          body: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<InitiateMultipartUploadResult xmlns=\"http://s3.amazonaws.com/doc/2006-03-01/\"><Bucket>imgup-original</Bucket><Key>115faa2f5cbe273cfc9fbcffd44b7eab.1000x1000x1.jpg</Key><UploadId>15.wV2G24C474anjHn8O.F8kbDictg1C0IklGV1yH_3wcHL1RnJr08GktO4Ea2dX_2oOFaXFbAQAKYESagZUKfubI4RAfxcROPdpMQDQ9PFRlGrYkbAUHRhD0Sj3cXiH</UploadId></InitiateMultipartUploadResult>",
  #          headers: [
  #            {"x-amz-id-2",
  #              "heguooYPmftY6XoxvaChgSsWobRiNNvR3O4/ze/b4VT1HJ2DVcuan818khKn6CXlMmHDFB6dJGU="},
  #            {"x-amz-request-id", "6NH87ARZVQRFZ48Z"},
  #            {"Date", "Wed, 07 Jun 2023 13:29:14 GMT"},
  #            {"x-amz-abort-date", "Fri, 09 Jun 2023 00:00:00 GMT"},
  #            {"x-amz-abort-rule-id", "delete-after-1-day"},
  #            {"x-amz-server-side-encryption", "AES256"},
  #            {"Transfer-Encoding", "chunked"},
  #            {"Server", "AmazonS3"}
  #          ],
  #          status_code: 200
  #    }}
  #  end)

  #  conn = post(conn, ~p"/api/images", @create_attrs)

  #  assert Map.get(Jason.decode!(response(conn, 200)), "url") == "https://s3.eu-west-3.amazonaws.com/imgup-original/phoenix.png"
  #end

end
