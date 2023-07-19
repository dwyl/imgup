defmodule AppWeb.ImgupClientlessLiveTest do
  use AppWeb.ConnCase
  import Phoenix.LiveViewTest

  test "connected mount", %{conn: conn} do
    conn = get(conn, "/liveview_clientless")
    assert html_response(conn, 200) =~ "(without file upload from client-side code)"

    {:ok, _view, _html} = live(conn)
  end

  import AppWeb.UploadSupport

  test "uploading a file", %{conn: conn} do
    {:ok, lv, html} = live(conn, ~p"/liveview_clientless")
    assert html =~ "Image Upload"

    # Get file and add it to the form
    file =
      [:code.priv_dir(:app), "static", "images", "phoenix.png"]
      |> Path.join()
      |> build_upload("image/png")

    image = file_input(lv, "#upload-form", :image_list, [file])

    # Should show an uploaded local file
    assert render_upload(image, file.name)
           |> Floki.parse_document!()
           |> Floki.find(".uploaded-local-item")
           |> length() == 1

    # Click on the upload button
    lv |> element(".submit_button") |> render_click()

    # Should show an uploaded S3 file
    assert lv
           |> render()
           |> Floki.parse_document!()
           |> Floki.find(".uploaded-s3-item")
           |> length() == 1
  end

  test "uploading an image file with invalid extension fails and should show error", %{conn: conn} do
    {:ok, lv, html} = live(conn, ~p"/liveview_clientless")
    assert html =~ "Image Upload"

    # Get empty file and add it to the form
    file =
      [:code.priv_dir(:app), "static", "images", "phoenix.xyz"]
      |> Path.join()
      |> build_upload("image/invalid")

    image = file_input(lv, "#upload-form", :image_list, [file])

    # Upload locally
    assert render_upload(image, file.name)

    # Click on the upload button
    lv |> element(".submit_button") |> render_click()

    # Should show an error
    assert lv |> render() =~ "invalid_extension"
  end

  test "validate function should reply `no_reply`", %{conn: conn} do
    assert AppWeb.ImgupNoClientLive.handle_event("validate", %{}, conn) == {:noreply, conn}
  end
end
