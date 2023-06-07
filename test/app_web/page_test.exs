defmodule AppWeb.PageTest do
  use AppWeb.ConnCase

  test "show homepage", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 200) =~ "Simple file upload"
  end

end
