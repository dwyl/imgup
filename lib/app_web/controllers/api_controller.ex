defmodule AppWeb.ApiController do
  use AppWeb, :controller
  alias App.Todo

  def create(conn, params) do
    render(conn, :create)
  end

end
