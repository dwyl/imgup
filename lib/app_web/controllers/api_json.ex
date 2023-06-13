defmodule AppWeb.ApiJSON do
  # If you want to customize a particular status code,
  # you may add your own clauses, such as:
  #
  # def render("500.json", _assigns) do
  #   %{errors: %{detail: "Internal Server Error"}}
  # end

  # By default, Phoenix returns the status message from
  # the template name. For example, "404.json" becomes
  # "Not Found".
  def render("success.json", assigns) do
    %{url: assigns.url, compressed_url: assigns.compressed_url}
  end

  def render(_template, assigns) do
    body = Map.get(assigns, :body, "Internal server error.")
    %{errors: %{detail: body}}
  end
end
