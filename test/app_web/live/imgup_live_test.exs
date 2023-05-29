defmodule AppWeb.MessageLiveTest do
  use AppWeb.ConnCase
  import Phoenix.LiveViewTest

  test "connected mount", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 200) =~ "Image Upload"

    {:ok, _view, _html} = live(conn)
  end
end
