defmodule AppWeb.ImgupNoClientLive do
  use AppWeb, :live_view

  @upload_dir Application.app_dir(:app, ["priv", "static", "image_uploads"])

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:uploaded_files, [])
     |> assign(:uploaded_files_locally, [])
     |> assign(:uploaded_files_to_S3, [])
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
        consume_uploaded_entry(socket, entry, fn %{path: path} ->
          dest = Path.join(@upload_dir, entry.client_name)

          # Copying the file from temporary folder to static folder
          File.mkdir_p(@upload_dir)
          File.cp!(path, dest)

          # Adding properties to the entry.
          # It should look like %{image_url: url, url_path: path, errors: []}
          entry =
            entry
            |> Map.put(
              :image_url,
              AppWeb.Endpoint.url() <>
                AppWeb.Endpoint.static_path("/image_uploads/#{entry.client_name}")
            )
            |> Map.put(
              :url_path,
              AppWeb.Endpoint.static_path("/image_uploads/#{entry.client_name}")
            )
            |> Map.put(
              :errors,
              []
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
  def handle_event("upload_to_s3", params, socket) do
    # Get file element from the local files array
    file_element =
      Enum.find(socket.assigns.uploaded_files_locally, fn %{uuid: uuid} ->
        uuid == Map.get(params, "uuid")
      end)

    # Create file object to upload
    file = %{
      path: @upload_dir <> "/" <> Map.get(file_element, :client_name),
      content_type: file_element.client_type,
      filename: file_element.client_name
    }

    # Upload file
    case App.Upload.upload(file) do
      # If the upload succeeds...
      {:ok, body} ->
        # We add the `uuid` to the object to display on the view template.
        body = Map.put(body, :uuid, file_element.uuid)

        # Delete the file locally
        File.rm!(file.path)

        # Update the socket accordingly
        updated_local_array = List.delete(socket.assigns.uploaded_files_locally, file_element)

        socket = update(socket, :uploaded_files_to_S3, &(&1 ++ [body]))
        socket = assign(socket, :uploaded_files_locally, updated_local_array)

        {:noreply, socket}

      # If the upload fails...
      {:error, reason} ->
        # Update the failed local file element to show an error message
        index = Enum.find_index(socket.assigns.uploaded_files_locally, &(&1 == file_element))
        updated_file_element = Map.put(file_element, :errors, ["#{reason}"])

        updated_local_array =
          List.replace_at(socket.assigns.uploaded_files_locally, index, updated_file_element)

        {:noreply, assign(socket, :uploaded_files_locally, updated_local_array)}
    end
  end
end
