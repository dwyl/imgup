defmodule AppWeb.PageController do
  use AppWeb, :controller

  @env_required ~w/AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION AWS_S3_BUCKET_ORIGINAL/

  def home(conn, _params) do
    init =
      if Envar.is_set_all?(@env_required) do
        "All Set!"
      else
        "cannot be run until all required environment variables are set"
      end

    # The home page is often custom made,
    # so skip the default app layout.
    render(conn, :home, layout: false, env: check_env(@env_required), init: init)
  end

  defp check_env(keys) do
    Enum.reduce(keys, %{}, fn key, acc ->
      src =
        "https://raw.githubusercontent.com/dwyl/auth/main/assets/static/images/#{Envar.is_set?(key)}.png"

      Map.put(acc, key, src)
    end)
  end
end
