defmodule AppWeb.ImgupLive do
  use AppWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:uploaded_files, [])
     |> allow_upload(:exhibit, accept: ~w(video/* image/*), max_entries: 6, chunk_size: 64_000)}
  end
end
