defmodule AppWeb.ImgupLiveTest do
  use AppWeb.ConnCase
  import Phoenix.LiveViewTest

  test "connected mount", %{conn: conn} do
    conn = get(conn, "/liveview")
    assert html_response(conn, 200) =~ "Image Upload"

    {:ok, _view, _html} = live(conn)
  end

  test "file input and remove it from selected entries", %{conn: conn} do
    # Connect to LiveView
    {:ok, live_view, _html} = live(conn, ~p"/liveview")

    # Build the upload input
    upload =
      file_input(live_view, "#upload-form", :image_list, [
        %{name: "photo.png", content: "ok"}
      ])

    entry_ref = get_in(upload.entries, [Access.at(0), "ref"])

    # Render the form change from the input
    live_view |> form("#upload-form") |> render_change(upload)

    # Assert on pending upload entry
    assert live_view
            |> has_element?("#entry-#{entry_ref}")

    # Click on the remove button
    live_view |> element("#close_pic-#{entry_ref}") |> render_click()

    # Assert that no pending images should be found
    refute live_view
    |> has_element?("#entry-#{entry_ref}")
  end

  test "file input errors - file too large", %{conn: conn} do
    # Connect to LiveView
    {:ok, live_view, _html} = live(conn, ~p"/liveview")

    # Build the upload input
    upload =
      file_input(live_view, "#upload-form", :image_list, [
        %{name: "photo.png", content: "ok", size: 20_000_000}
      ])

    # Render the form change from the input
    view = live_view |> form("#upload-form") |> render_change(upload)

    # Assert there's a File Too Large error
    assert view =~ "Too large."
  end

  test "file input errors - unnaceptable file type", %{conn: conn} do
    # Connect to LiveView
    {:ok, live_view, _html} = live(conn, ~p"/liveview")

    # Build the upload input
    upload =
      file_input(live_view, "#upload-form", :image_list, [
        %{name: "photo.pdf", content: "ok", size: 100_000}
      ])

    # Render the form change from the input
    view = live_view |> form("#upload-form") |> render_change(upload)

    # Assert there's a File Too Large error
    assert view =~ "You have selected an unacceptable file type."
  end


  import AppWeb.UploadSupport

  test "uploading a file", %{conn: conn} do
    {:ok, lv, html} = live(conn, ~p"/liveview")
    assert html =~ "Image Upload"

    # Get file and add it to the form
    file =
      [:code.priv_dir(:app), "static", "images", "phoenix.png"]
      |> Path.join()
      |> build_upload("image/png")

    image = file_input(lv, "#upload-form", :image_list, [file])

    assert render_upload(image, file.name)
      |> Floki.parse_document!()
      |> Floki.find(".pending-upload-item")
      |> length() == 1

    # Render submit
    lv
      |> form("#upload-form", [])
      |> render_submit()

    # We need a render for the latent changes.
    # For some reason, we need to do this to verify if the form is devoid of selected entries
    doc = lv |> render() |> Floki.parse_document!()

    # Uploaded files should show and selected should be empty
    assert doc
      |> Floki.find(".uploaded-item")
      |> length() == 1

    assert doc
      |> Floki.find(".pending-upload-item")
      |> length() == 0
  end
end
