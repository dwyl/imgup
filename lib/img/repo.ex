defmodule Img.Repo do
  use Ecto.Repo,
    otp_app: :img,
    adapter: Ecto.Adapters.Postgres
end
