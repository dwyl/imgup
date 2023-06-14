defmodule AppWeb.ImgupLive do
  use AppWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:uploaded_files, [])
     |> allow_upload(:image_list,
       accept: ~w(image/*),
       max_entries: 6,
       chunk_size: 64_000,
       max_file_size: 5_000_000,
       external: &presign_upload/2
     )}
  end

  # Adding presign for each entry for S3 upload --------

  defp presign_upload(entry, socket) do
    uploads = socket.assigns.uploads
    bucket_original = "imgup-original"
    bucket_compressed = "imgup-compressed"
    key = Cid.cid("#{DateTime.utc_now() |> DateTime.to_iso8601()}_#{entry.client_name}")

    config = %{
      region: System.get_env("AWS_REGION"),
      access_key_id: System.get_env("AWS_ACCESS_KEY_ID"),
      secret_access_key: System.get_env("AWS_SECRET_ACCESS_KEY")
    }

    {:ok, fields} =
      SimpleS3Upload.sign_form_upload(config, bucket_original,
        key: key,
        content_type: entry.client_type,
        max_file_size: uploads[entry.upload_config].max_file_size,
        expires_in: :timer.hours(1)
      )

    meta = %{
      uploader: "S3",
      key: key,
      url: "https://#{bucket_original}.s3-#{config.region}.amazonaws.com",
      compressed_url: "https://#{bucket_compressed}.s3-#{config.region}.amazonaws.com",
      fields: fields
    }

    {:ok, meta, socket}
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

  @impl true
  def handle_event("save", _params, socket) do
    uploaded_files =
      consume_uploaded_entries(socket, :image_list, fn %{uploader: _} = meta, _entry ->
        public_url = meta.url <> "/#{meta.key}"
        compressed_url = meta.compressed_url <> "/#{meta.key}"

        meta = Map.put(meta, :public_url, public_url)
        meta = Map.put(meta, :compressed_url, compressed_url)

        {:ok, meta}
      end)

    {:noreply, update(socket, :uploaded_files, &(&1 ++ uploaded_files))}
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
