defmodule AppWeb.ImgupNoClientLive do
  use AppWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:uploaded_files, [])
     |> assign(:uploaded_files_locally, [])
     |> allow_upload(:image_list,
       accept: ~w(image/*),
       max_entries: 6,
       chunk_size: 64_000,
       auto_upload: true,
       max_file_size: 5_000_000,
       progress: &handle_progress/3
       # Do not defined presign_upload. This will create a local photo in /vars
     )}
  end

  # With `auto_upload: true`, we can consume files here
  defp handle_progress(:image_list, entry, socket) do
    if entry.done? do
      uploaded_file =
        consume_uploaded_entry(socket, entry, fn %{path: path} = meta ->
          # Uploading the files to local directory
          upload_dir = Application.app_dir(:app, ["priv", "static", "image_uploads"])

          base = Path.basename(path)
          dest = Path.join(upload_dir, entry.client_name)

          # Copying the file from temporary folder to static folder
          File.mkdir_p(upload_dir)
          File.cp!(path, dest)

          entry =
            Map.put(
              entry,
              :url_path,
              AppWeb.Endpoint.static_path("/image_uploads/#{entry.client_name}")
            )

          {:ok, entry}
        end)

      {:noreply, update(socket, :uploaded_files_locally, &(&1 ++ [uploaded_file]))}
    else
      {:noreply, socket}
    end
  end

  # Event handlers -------

  @impl true
  def handle_event("validate", _params, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_event("remove-selected", %{"ref" => ref}, socket) do
    {:noreply, cancel_upload(socket, :image_list, ref)}
  end

  # View utilities -------

  def are_files_uploadable?(image_list) do
    error_list = Map.get(image_list, :errors)
    Enum.empty?(error_list) and length(image_list.entries) > 0
  end

  def error_to_string(:too_large), do: "Too large."
  def error_to_string(:not_accepted), do: "You have selected an unacceptable file type."
  # coveralls-ignore-start
  def error_to_string(:external_client_failure),
    do: "Couldn't upload files to S3. Open an issue on Github and contact the repo owner."

  # coveralls-ignore-stop
end
