<div align="center">

# Upload images to `AWS S3` via  `Phoenix LiveView`

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/dwyl/imgup/ci.yml?label=build&style=flat-square&branch=main)
[![codecov.io](https://img.shields.io/codecov/c/github/dwyl/imgup/main.svg?style=flat-square)](https://codecov.io/github/dwyl/imgup?branch=main)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)](https://github.com/dwyl/imgup/issues)
[![HitCount](https://hits.dwyl.com/dwyl/imgup.svg?style=flat-square&show=unique)](https://hits.dwyl.com/dwyl/imgup)

Learn how to do image uploads seamlessly with any type of image
and have it saved in a reliable place like `AWS S3`!

</div>

<br />

- [Upload images to `AWS S3` via  `Phoenix LiveView`](#upload-images-to-aws-s3-via--phoenix-liveview)
- [Why? 🤷](#why-)
- [What? 💭](#what-)
- [Who? 👤](#who-)
- [How? 💻](#how-)
  - [Prerequisites](#prerequisites)
  - [0. Creating a fresh `Phoenix` project](#0-creating-a-fresh-phoenix-project)
  - [1. Adding `LiveView` capabilities to our project](#1-adding-liveview-capabilities-to-our-project)
  - [2. Local file upload and preview](#2-local-file-upload-and-preview)
  - [3. File validation](#3-file-validation)
  - [4. Uploading image to `AWS S3` bucket](#4-uploading-image-to-aws-s3-bucket)
    - [4.1 Adding multipart form data for images to be uploaded to the bucket](#41-adding-multipart-form-data-for-images-to-be-uploaded-to-the-bucket)
    - [4.2 Implementing the `S3` `JavaScript` client uploader](#42-implementing-the-s3-javascript-client-uploader)
    - [4.3 Creating the `AWS S3` bucket](#43-creating-the-aws-s3-bucket)
      - [4.3.1 Changing the bucket permissions](#431-changing-the-bucket-permissions)
    - [4.4 Getting our credentials](#44-getting-our-credentials)
    - [4.5 Changing view to upload files](#45-changing-view-to-upload-files)
  - [5. Feedback on progress of upload](#5-feedback-on-progress-of-upload)


<br />

# Why? 🤷

As we're building our 
[app](https://github.com/dwyl/app),
we are interested in allowing people
to upload their own images to better manage their daily tasks.

By adding support for interactive file uploads,
we can leverage this feature and easily apply it 
any client app that wishes to upload their images
in a secure place.

# What? 💭

This run-through will create a simple
`LiveView` web application
that will allow you to choose/drag an image
and upload it to your own [`AWS S3`](https://aws.amazon.com/s3/) bucket.


# Who? 👤

This tutorial is aimed at `LiveView` beginners 
that want to grasp how to do a simple file upload. 

But it's also for us,
for future reference on how to implement image (and file)
upload on other applications.

If you are completely new to `Phoenix` and `LiveView`,
we recommend you follow the **`LiveView` _Counter_ Tutorial**:
[dwyl/phoenix-liveview-counter-tutorial](https://github.com/dwyl/phoenix-liveview-counter-tutorial)


# How? 💻

## Prerequisites 

This tutorial requires you have `Elixir` and `Phoenix` installed.
If you you don't, please see 
[how to install Elixir](https://github.com/dwyl/learn-elixir#installation)
and 
[Phoenix](https://hexdocs.pm/phoenix/installation.html#phoenix).

We assume you know the basics of `Phoenix` 
and have *some* knowledge of how it works.
If you don't, 
we *highly suggest* you follow our other tutorials first.

In addition to this,
we assume you have *some* knowledge of `AWS` - 
what it is, what an `S3` bucket is/does.


## 0. Creating a fresh `Phoenix` project

Let's create a fresh `Phoenix` project.
Run the following command in a given folder:

```sh
mix phx.new . --app app --no-dashboard --no-mailer
```

We're running [`mix phx.new`](https://hexdocs.pm/phoenix/Mix.Tasks.Phx.New.html)
to generate a new project without a dashboard
and mailer service,
since we don't need those in our project.

After this,
if you run `mix phx.server` to run your server,
you should be able to see the following page.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/b40f4e79-e225-4226-8112-c490b5b4bf46">
</p>

We're ready to start implementing!


## 1. Adding `LiveView` capabilities to our project

As it stands,
our project is not using `LiveView`.
Let's fix this.

In `lib/app_web/router.ex`,
change the `scope "/"` to the following.

```elixir
  scope "/", AppWeb do
    pipe_through :browser

    live "/", ImgupLive
  end
```

Instead of using the `PageController`,
we are going to be creating `ImgupLive`,
a `LiveView` file.

Let's create our `LiveView` files.
Inside `lib/app_web`, 
create a folder called `live`
and create the following file 
`imgup_live.ex`.

```elixir
defmodule AppWeb.ImgupLive do
  use AppWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:uploaded_files, [])
     |> allow_upload(:image_list, accept: ~w(image/*), max_entries: 6, chunk_size: 64_000)}
  end
end
```

This is a simple `LiveView` controller
with the `mount/3` function
where we use the 
[`allow_upload/3`](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html#allow_upload/3)
function,
which is needed to allow file uploads in our `LiveView`.

In the same `live` folder,
create a file called `imgup_live.html.heex`
and use the following code.

```html
<.flash_group flash={@flash} />
<div class="px-4 py-10 flex justify-center sm:px-6 sm:py-28 lg:px-8 xl:px-28 xl:py-32">
  <div class="mx-auto max-w-xl w-[50vw] lg:mx-0">
    <form>
      <div class="space-y-12">
        <div class="border-b border-gray-900/10 pb-12">
          <h2 class="text-base font-semibold leading-7 text-gray-900">Image Upload</h2>
          <p class="mt-1 text-sm leading-6 text-gray-600">Drag your images and they'll be uploaded to the cloud! ☁️</p>

          <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div class="col-span-full">
              <div class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                  </svg>
                  <div class="mt-4 flex text-sm leading-6 text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only">
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end gap-x-6">
        <button type="button" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
        <button type="submit" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save</button>
      </div>
    </form>
  </div>
</div>
```

This is a simple HTML form that uses `TailwindCSS`
to allow the people to upload a file.
We'll also remove the header of the page layout,
while we're at it.

Locate the file `lib/app_web/components/layouts/app.html.heex`
and remove the `<header>` class.
The file should only have the following code.

```html
<main class="px-4 py-20 sm:px-6 lg:px-8">
  <div class="mx-auto max-w-2xl">
    <.flash_group flash={@flash} />
    <%= @inner_content %>
  </div>
</main>
```

Now you can safely delete the `lib/app_web/controllers` folder,
which is no longer used.

If you run `mix phx.server`,
you should see the following screen.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/5a3438fe-fa45-47f9-8cb2-9d6d405f55a0">
</p>

This means we've successfully added `LiveView`
and changed our view!
We can now start implementing file uploads! 🗳️

> If you want to see the changes made to the project,
> check [b414b11](https://github.com/dwyl/imgup/pull/55/commits).


## 2. Local file upload and preview

Let's add the ability for people to upload their images
in our `LiveView` app and preview them *before* uploading to `AWS S3`.

Change `lib/app_web/live/imgup_live.html.heex` 
to the following piece of code.

```html
<div class="px-4 py-10 flex justify-center sm:px-6 sm:py-28 lg:px-8 xl:px-28 xl:py-32">
  <div class="mx-auto max-w-xl w-[50vw] lg:mx-0">

    <div class="space-y-12">
      <div class="border-gray-900/10 pb-12">
        <h2 class="text-base font-semibold leading-7 text-gray-900">Image Upload</h2>
        <p class="mt-1 text-sm leading-6 text-gray-600">Drag your images and they'll be uploaded to the cloud! ☁️</p>
        <p class="mt-1 text-sm leading-6 text-gray-600">You may add up to <%= @uploads.image_list.max_entries %> exhibits at a time.</p>

        <!-- File upload section -->
        <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

          <div class="col-span-full">
            <div
              class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
              phx-drop-target={@uploads.image_list.ref}
            >
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                </svg>
                <div class="mt-4 flex text-sm leading-6 text-gray-600">
                  <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                    <form phx-change="validate" phx-submit="save">
                      <label class="cursor-pointer">
                        <.live_file_input upload={@uploads.image_list} class="hidden" />
                        Upload
                      </label>
                    </form>
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- File upload form -->
    <div class="mt-6 flex items-center justify-end gap-x-6">
      <button type="button" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
      <button type="submit" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Upload
      </button>
    </div>

    <!-- Selected files preview section -->
    <div class="mt-12">
      <h2 class="text-base font-semibold leading-7 text-gray-900">Selected files</h2>
      <ul role="list" class="divide-y divide-gray-100">

        <%= for entry <- @uploads.image_list.entries do %>
          <li class="relative flex justify-between gap-x-6 py-5" id={"entry-#{entry.ref}"}>
            <div class="flex gap-x-4">
              <.live_img_preview entry={entry} class="h-auto w-12 flex-none bg-gray-50" />
              <div class="min-w-0 flex-auto">
                <p class="text-sm font-semibold leading-6 break-all text-gray-900">
                  <span class="absolute inset-x-0 -top-px bottom-0"></span>
                  <%= entry.client_name %>
                </p>
              </div>
            </div>
            <div
              class="flex items-center gap-x-4 cursor-pointer z-10"
              phx-click="remove-selected" phx-value-ref={entry.ref}
            >
              <svg fill="#cfcfcf" height="10" width="10" version="1.1" id={"close_pic-#{entry.ref}"} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 460.775 460.775" xml:space="preserve">
                <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
                  c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
                  c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
                  c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
                  l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
                  c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/>
              </svg>
            </div>
          </li>
        <% end %>
      </ul>
    </div>
  </div>
</div>
```

We've added a few features:

- used [`<.live_file_input/>`](https://hexdocs.pm/phoenix_live_view/Phoenix.Component.html#live_file_input/1)
for `LiveView` file upload.
We've wrapped this component
with an element that is annotated with the `phx-drop-target` attribute
pointing to the DOM `id` of the file input.
This allows people to click on the `Upload` text 
or drag and drop files into the container
to upload an image.
- iterated over `@uploads.image_list.entries` socket assign
to list and preview the uploaded images.
For this,
we're using 
[`live_img_preview/1`](https://hexdocs.pm/phoenix_live_view/Phoenix.Component.html#live_img_preview/1)
to generate an image preview on the client.
- the person using the app can remove entries that they've uploaded
to the web app.
We are adding an `X` icon that, once clicked,
creates a `remove-selected` event,
which passes the entry reference to the event handler.
The latter makes use of the 
[`cancel_upload/3`](https://hexdocs.pm/phoenix_live_view/0.18.16/Phoenix.LiveView.html#cancel_upload/3) function.

Because `<.live_file_input/>` is being used,
we need to annotate its wrapping element
with `phx-submit` and `phx-change`, 
as per https://hexdocs.pm/phoenix_live_view/uploads.html#render-reactive-elements.

Because we've added these bindings,
we need to add the event handlers in 
`lib/app_web/live/imgup_live.ex`.
Open it and update it to:

```elixir
defmodule AppWeb.ImgupLive do
  use AppWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:uploaded_files, [])
     |> allow_upload(:image_list, accept: ~w(image/*), max_entries: 6, chunk_size: 64_000)}
  end

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
    {:noreply, socket}
  end
end
```

For now, we're not validating and not doing anything on save.
We just want to preview the images within the web app.

If you run `mix phx.server`,
you should see the following screen.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/ca60e4c5-1e6e-4179-ad39-5fd9f63b244a">
</p>


## 3. File validation

Let's block the person to upload invalid files.
Validation occurs automatically based on the conditions
that we specified in `allow_upload/3` in the `mount/3` function.

Entries for files that do not match the `allow_upload/3` spec
*will* contain errors.
Luckily, we can leverage
[`upload_errors/2`](https://hexdocs.pm/phoenix_live_view/Phoenix.Component.html#upload_errors/2)
helper function to render an error message pertaining to each entry.

By defining `allow_upload/3`,
the object is defined in the socket assigns.
We can find an array of errors pertaining to all of the entries/files that were selected
inside the `@uploads` socket assigns 
under the `:errors` key.

With this, we can block the person to upload the files if:
- there aren't any.
- any of the files/entries have errors.

Let's implement this useful function to then use in our view.
Open `lib/app_web/live/imgup_live.ex`
and add the following functions.

```elixir
  def are_files_uploadable?(image_list) do
    error_list = Map.get(image_list, :errors)
    Enum.empty?(error_list) and length(image_list.entries) > 0
  end

  def error_to_string(:too_large), do: "Too large"
  def error_to_string(:not_accepted), do: "You have selected an unacceptable file type"
```

Next, open `lib/app_web/live/imgup_live.html.heex`
and change it to:

```html
<div class="px-4 py-10 flex justify-center sm:px-6 sm:py-28 lg:px-8 xl:px-28 xl:py-32">
  <div class="mx-auto max-w-xl w-[50vw] lg:mx-0">

    <div class="space-y-12">
      <div class="border-gray-900/10 pb-12">
        <h2 class="text-base font-semibold leading-7 text-gray-900">Image Upload</h2>
        <p class="mt-1 text-sm leading-6 text-gray-600">Drag your images and they'll be uploaded to the cloud! ☁️</p>
        <p class="mt-1 text-sm leading-6 text-gray-600">You may add up to <%= @uploads.image_list.max_entries %> exhibits at a time.</p>

        <!-- File upload section -->
        <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

          <div class="col-span-full">
            <div
              class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
              phx-drop-target={@uploads.image_list.ref}
            >
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                </svg>
                <div class="mt-4 flex text-sm leading-6 text-gray-600">
                  <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                    <form phx-change="validate" phx-submit="save">
                      <label class="cursor-pointer">
                        <.live_file_input upload={@uploads.image_list} class="hidden" />
                        Upload
                      </label>
                    </form>
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- File upload form -->
    <div class="mt-6 flex items-center justify-end gap-x-6">
      <button type="button" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
      <button
        type="submit"
        class={"rounded-md
              #{if are_files_uploadable?(@uploads.image_list) do "bg-indigo-600" else "bg-indigo-200" end}
              px-3 py-2 text-sm font-semibold text-white shadow-sm
              #{if are_files_uploadable?(@uploads.image_list) do "hover:bg-indigo-500" end}
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"}
        disabled={!are_files_uploadable?(@uploads.image_list)}
      >
        Upload
      </button>
    </div>

    <!-- Selected files preview section -->
    <div class="mt-12">
      <h2 class="text-base font-semibold leading-7 text-gray-900">Selected files</h2>
      <ul role="list" class="divide-y divide-gray-100">

        <%= for entry <- @uploads.image_list.entries do %>

          <!-- Entry information -->
          <li class="relative flex justify-between gap-x-6 py-5" id={"entry-#{entry.ref}"}>
            <div class="flex gap-x-4">
              <.live_img_preview entry={entry} class="h-auto w-12 flex-none bg-gray-50" />
              <div class="min-w-0 flex-auto">
                <p class="text-sm font-semibold leading-6 break-all text-gray-900">
                  <span class="absolute inset-x-0 -top-px bottom-0"></span>
                  <%= entry.client_name %>
                </p>
              </div>
            </div>
            <div
              class="flex items-center gap-x-4 cursor-pointer z-10"
              phx-click="remove-selected" phx-value-ref={entry.ref}
            >
              <svg fill="#cfcfcf" height="10" width="10" version="1.1" id={"close_pic-#{entry.ref}"} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 460.775 460.775" xml:space="preserve">
                <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
                  c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
                  c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
                  c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
                  l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
                  c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/>
              </svg>
            </div>
          </li>

          <!-- Entry errors -->
          <div>
            <%= for err <- upload_errors(@uploads.image_list, entry) do %>
              <div class="rounded-md bg-red-50 p-4 mb-2">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800"><%= error_to_string(err) %></h3>
                  </div>
                </div>
              </div>
            <% end %>
          </div>
        <% end %>
      </ul>
    </div>
  </div>
</div>
```

We've made two modifications:
- the "Upload" button now calls `are_files_uploadable/0`
to check if it should be disabled or not.
- for each file, 
we are rendering an error using `error_to_string/1`
if it's invalid.

If you run `mix phx.server` 
and try to upload invalid files,
you will see an error on the entry.


<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/f36d49c6-1744-4615-9380-72c657204ee0">
</p>


## 4. Uploading image to `AWS S3` bucket

Now that the person is loading the images to our app,
let's allow them to upload it to the cloud! ☁️

The first thing we need to do is to 
add an anonymous function that will generate the needed
metadata for each local file
for external client uploaders - 
which is the case of `AWS S3`. 
We can set the 2-arity function
in the 
[`:external`](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html#allow_upload/3)
parameter of `allow_upload/3`.

```elixir
  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:uploaded_files, [])
     |> allow_upload(:image_list, accept: ~w(image/*), max_entries: 6, chunk_size: 64_000, external: &presign_upload/2)}
  end


  defp presign_upload(entry, socket) do
    uploads = socket.assigns.uploads
    bucket = "dwyl-imgup"
    key = "public/#{entry.client_name}"

    config = %{
      region: "eu-west-3",
      access_key_id: System.fetch_env!("AWS_ACCESS_KEY_ID"),
      secret_access_key: System.fetch_env!("AWS_SECRET_ACCESS_KEY")
    }

    {:ok, fields} =
      SimpleS3Upload.sign_form_upload(config, bucket,
        key: key,
        content_type: entry.client_type,
        max_file_size: uploads[entry.upload_config].max_file_size,
        expires_in: :timer.hours(1)
      )

    meta = %{uploader: "S3", key: key, url: "http://#{bucket}.s3-#{config.region}.amazonaws.com", fields: fields}
    {:ok, meta, socket}
  end
```

This function will be called
everytime the person wants to
*upload the selected files to `AWS S3` bucket, 
i.e. presses the "Upload" button.

In the `presign_upload/2` function,
we are getting the `uploads` object from the socket assigns.
This field `uploads` refers to the list of selected images
prior to being uploaded.

In this function,
we are setting up the 
[multipart form data](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
for the POST request that will be posted
to `AWS S3`.
We *generate a pre-signed URL for the upload*,
and lastly we return the `:ok` result,
with a payload of metadata for the client.

If you've noticed,
the metadata **must** contain the `:uploader` key,
specifying the name of the `JavaScript` client-side uploader.
In our case, it's called `S3`.
(we'll be implementing this in the section after the next one).

All of this is needed to correctly upload the images to our `S3` bucket.


### 4.1 Adding multipart form data for images to be uploaded to the bucket

You might have noticed the previous function
is using a module called `SimpleS3Upload`
which signs the POST request multipart form data
with the correct metadata.

For this, we are using the zero-dependency module
in https://gist.github.com/chrismccord/37862f1f8b1f5148644b75d20d1cb073.
Therefore, inside `lib/app_web/`,
create a file called `s3_upload.ex`
and post the following snippet of code.

```elixir
defmodule SimpleS3Upload do
  @moduledoc """
  Dependency-free S3 Form Upload using HTTP POST sigv4

  https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-post-example.html
  """

  @doc """
  Signs a form upload.

  The configuration is a map which must contain the following keys:

    * `:region` - The AWS region, such as "us-east-1"
    * `:access_key_id` - The AWS access key id
    * `:secret_access_key` - The AWS secret access key


  Returns a map of form fields to be used on the client via the JavaScript `FormData` API.

  ## Options

    * `:key` - The required key of the object to be uploaded.
    * `:max_file_size` - The required maximum allowed file size in bytes.
    * `:content_type` - The required MIME type of the file to be uploaded.
    * `:expires_in` - The required expiration time in milliseconds from now
      before the signed upload expires.

  ## Examples

      config = %{
        region: "us-east-1",
        access_key_id: System.fetch_env!("AWS_ACCESS_KEY_ID"),
        secret_access_key: System.fetch_env!("AWS_SECRET_ACCESS_KEY")
      }

      {:ok, fields} =
        SimpleS3Upload.sign_form_upload(config, "my-bucket",
          key: "public/my-file-name",
          content_type: "image/png",
          max_file_size: 10_000,
          expires_in: :timer.hours(1)
        )

  """
  def sign_form_upload(config, bucket, opts) do
    key = Keyword.fetch!(opts, :key)
    max_file_size = Keyword.fetch!(opts, :max_file_size)
    content_type = Keyword.fetch!(opts, :content_type)
    expires_in = Keyword.fetch!(opts, :expires_in)

    expires_at = DateTime.add(DateTime.utc_now(), expires_in, :millisecond)
    amz_date = amz_date(expires_at)
    credential = credential(config, expires_at)

    encoded_policy =
      Base.encode64("""
      {
        "expiration": "#{DateTime.to_iso8601(expires_at)}",
        "conditions": [
          {"bucket":  "#{bucket}"},
          ["eq", "$key", "#{key}"],
          {"acl": "public-read"},
          ["eq", "$Content-Type", "#{content_type}"],
          ["content-length-range", 0, #{max_file_size}],
          {"x-amz-server-side-encryption": "AES256"},
          {"x-amz-credential": "#{credential}"},
          {"x-amz-algorithm": "AWS4-HMAC-SHA256"},
          {"x-amz-date": "#{amz_date}"}
        ]
      }
      """)

    fields = %{
      "key" => key,
      "acl" => "public-read",
      "content-type" => content_type,
      "x-amz-server-side-encryption" => "AES256",
      "x-amz-credential" => credential,
      "x-amz-algorithm" => "AWS4-HMAC-SHA256",
      "x-amz-date" => amz_date,
      "policy" => encoded_policy,
      "x-amz-signature" => signature(config, expires_at, encoded_policy)
    }

    {:ok, fields}
  end

  defp amz_date(time) do
    time
    |> NaiveDateTime.to_iso8601()
    |> String.split(".")
    |> List.first()
    |> String.replace("-", "")
    |> String.replace(":", "")
    |> Kernel.<>("Z")
  end

  defp credential(%{} = config, %DateTime{} = expires_at) do
    "#{config.access_key_id}/#{short_date(expires_at)}/#{config.region}/s3/aws4_request"
  end

  defp signature(config, %DateTime{} = expires_at, encoded_policy) do
    config
    |> signing_key(expires_at, "s3")
    |> sha256(encoded_policy)
    |> Base.encode16(case: :lower)
  end

  defp signing_key(%{} = config, %DateTime{} = expires_at, service) when service in ["s3"] do
    amz_date = short_date(expires_at)
    %{secret_access_key: secret, region: region} = config

    ("AWS4" <> secret)
    |> sha256(amz_date)
    |> sha256(region)
    |> sha256(service)
    |> sha256("aws4_request")
  end

  defp short_date(%DateTime{} = expires_at) do
    expires_at
    |> amz_date()
    |> String.slice(0..7)
  end

  defp sha256(secret, msg), do: :crypto.mac(:hmac, :sha256, secret, msg)
end
```

Awesome!

We now have the module correctly implemented within our app
and actively being used in our `presign_upload/2` function
within our LiveView.


### 4.2 Implementing the `S3` `JavaScript` client uploader

As previously mentioned,
we need to implement the `S3` uploader
in our `JavaScript` client.

So, let's complete the flow!
Open `assets/js/app.js`,
and change the `liveSocket` variable 
with these changes:

```js
let Uploaders = {}

Uploaders.S3 = function(entries, onViewError){
  entries.forEach(entry => {

    // Creating the form data and getting metadata
    let formData = new FormData()
    let {url, fields} = entry.meta

    // Getting each image entry and appenting it to the form data
    Object.entries(fields).forEach(([key, val]) => formData.append(key, val))
    formData.append("file", entry.file)

    // Creating an AJAX request for each entry
    // using progress functions to report the upload events back to the LiveView.
    let xhr = new XMLHttpRequest()
    onViewError(() => xhr.abort())
    xhr.onload = () => xhr.status === 204 ? entry.progress(100) : entry.error()
    xhr.onerror = () => entry.error()
    xhr.upload.addEventListener("progress", (event) => {
      if(event.lengthComputable){
        let percent = Math.round((event.loaded / event.total) * 100)
        if(percent < 100){ entry.progress(percent) }
      }
    })

    xhr.open("POST", url, true)
    xhr.send(formData)
  })
}


let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {
    uploaders: Uploaders,
    params: {_csrf_token: csrfToken}
})
```

We are creating our `S3` uploader,
which creates the form data and appends the image files
and necessary metadata.
Additionally, it attaches progress handlers
that communicates with the LiveView to get information
on the progress of the image upload to the `AWS S3` bucket.

We then use this uploader in the `:uploaders` field
in the `liveSocket` variable declaration.


### 4.3 Creating the `AWS S3` bucket 

You might have noticed that in the 
`presign_upload/2` we are using
configurations from a `S3` bucket.
We've set the `region`,
`access_key_id` and `secret_access_key`,

We don't have anything created in our `AWS`,
so it's time to create the bucket
so our images can have a place to sleep at night! 🛏️

> If you've never dealt with `AWS` before,
> we recommend you getting acquainted with `S3` buckets.
> Find more information about `AWS` 
> in https://github.com/dwyl/learn-amazon-web-services
> and about `S3` in 
> https://www.youtube.com/watch?v=77lMCiiMilo&ab_channel=AmazonWebServices.

Let's create an `S3` bucket!
Open https://s3.console.aws.amazon.com/s3/home
and click on `Create bucket`.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/326a6987-40ce-495e-a56d-a395cf2cb5c6">
</p>

You will be prompted with a wizard to create the bucket.
Name the bucket whatever you want.
In *our case*,
we've named it `dwyl-imgup`,
which is **the same name that must be declared in the `presign_upload/2` function**
in `lib/app_web/live/imgup_live.ex`.
In the same section,
choose a specific region.
Similarly,
**this region is also declared in the `presign_upload/2` function**,
so make sure they match. 

Next, in `Object Ownership`,
click on **`ACLs Enabled`**.
This will allow anyone to read the images
within our bucket.

After this,
in `Block Public Access settings for this bucket`,
**untoggle `Block all public access`**.
We need to do this because our app needs to be able to upload images to our file.

After this, 
click on `Create bucket`.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/0ca112ef-a1f1-4e93-a588-c1d7722e0c5a">
</p>


#### 4.3.1 Changing the bucket permissions

Now that you've created the bucket,
you'll see the page with all the buckets created.
Click on the one you've just created

In the page, click on the `Permissions` tab.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/42894e81-cd24-469f-9112-ff3ce707f175">
</p>

Scroll down to `Access control list (ACL)` 
and click on the `Edit` button.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/cf6a21f2-a4bc-49e3-abd5-6350581927bc">
</p>

In the `Everyone (public access)` section,
**toggle the `Read` checkbox**.
This will make our images accessible.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/ce8e7874-e7de-411a-8a6c-efdada442aa7">
</p>

And those are all the changes we need!
If you're lost with these,
please visit https://stackoverflow.com/questions/71080354/getting-the-bucket-does-not-allow-acls-error.
It details the steps you need to make to get your bucket ready!


### 4.4 Getting our credentials

Now that we have our fine bucket 🪣 properly created,
we need the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
for our `presign_upload/2` function to work properly
and correctly create the form metadata for our image files to be uploaded.

For this, visit https://us-east-1.console.aws.amazon.com/iamv2/home#/security_credentials?section=IAM_credentials.
Alternatively, on the right side of the screen,
click on your username and on `Security Credentials`.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/cab8ebd7-70a7-4094-9670-6f6351647c06">
</p>

Scroll down to `Access Keys` and,
if you don't have any created,
click on `Create access key`.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/e0333062-f537-4255-be45-0bb61114c156">
</p>

After this, click on the 
`Application running outside AWS` option.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/5ef10986-669d-4e8c-838f-0e7b2c0a85c3">
</p>

Click on `Next` and give the keys a descriptive tag.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/38193267-9070-47ee-9657-b9e968a45e66">
</p>

After this, click on `Create access key`.
You will be shown the credentials, like so.

> These keys are invalid. 
> **Don't ever share yours, they give access to your `AWS` resource.**

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/fb29a7ff-2610-44fa-bba9-9a8cb79a3187">
</p>

Both of these credentials will need to be
the env variables that `presign_upload/2` will use.
For this, simply create an `.env` file 
and add your credentials to it.

```
export AWS_ACCESS_KEY_ID='YOUR_KEY'
export AWS_SECRET_ACCESS_KEY='YOUR_KEY'
```

When running the app,
in your terminal window, 
you need to run `source .env` 
to *load* these env variables
so our app has access to them.
Remember: if you close the terminal window,
you'll have to run `source .env` again.

**Don't ever push this `.env` file to a repo**
**nor share it with anyone**.
They give people access to the `AWS` resource.
Keep this in your computer/server
and don't expose it to the world!
If it does, you can always deactivate 
and delete the keys in the same page you've created them.


### 4.5 Changing view to upload files

All that's left is to make our view
upload the files when the person clicks on the "Upload" button.
Go to `lib/app_web/live/imgup_live.html.heex`
and change it so it looks like so:

```html
<div class="px-4 py-10 flex justify-center sm:px-6 sm:py-28 lg:px-8 xl:px-28 xl:py-32">
  <div class="mx-auto max-w-xl w-[50vw] lg:mx-0">

    <div class="space-y-12">
      <div class="border-gray-900/10 pb-12">
        <h2 class="text-base font-semibold leading-7 text-gray-900">Image Upload</h2>
        <p class="mt-1 text-sm leading-6 text-gray-600">Drag your images and they'll be uploaded to the cloud! ☁️</p>
        <p class="mt-1 text-sm leading-6 text-gray-600">You may add up to <%= @uploads.image_list.max_entries %> exhibits at a time.</p>

        <!-- File upload section -->
        <form class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8" phx-change="validate" phx-submit="save">

          <div class="col-span-full">
            <div
              class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
              phx-drop-target={@uploads.image_list.ref}
            >
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                </svg>
                <div class="mt-4 flex text-sm leading-6 text-gray-600">
                  <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                    <div>
                      <label class="cursor-pointer">
                        <.live_file_input upload={@uploads.image_list} class="hidden" />
                        Upload
                      </label>
                    </div>
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-x-6">
            <button type="button" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
            <button
              type="submit"
              class={"rounded-md
                    #{if are_files_uploadable?(@uploads.image_list) do "bg-indigo-600" else "bg-indigo-200" end}
                    px-3 py-2 text-sm font-semibold text-white shadow-sm
                    #{if are_files_uploadable?(@uploads.image_list) do "hover:bg-indigo-500" end}
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"}
              disabled={!are_files_uploadable?(@uploads.image_list)}
            >
              Upload
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- Selected files preview section -->
    <div class="mt-12">
      <h2 class="text-base font-semibold leading-7 text-gray-900">Selected files</h2>
      <ul role="list" class="divide-y divide-gray-100">

        <%= for entry <- @uploads.image_list.entries do %>

          <!-- Entry information -->
          <li class="relative flex justify-between gap-x-6 py-5" id={"entry-#{entry.ref}"}>
            <div class="flex gap-x-4">
              <.live_img_preview entry={entry} class="h-auto w-12 flex-none bg-gray-50" />
              <div class="min-w-0 flex-auto">
                <p class="text-sm font-semibold leading-6 break-all text-gray-900">
                  <span class="absolute inset-x-0 -top-px bottom-0"></span>
                  <%= entry.client_name %>
                </p>
              </div>
            </div>
            <div
              class="flex items-center gap-x-4 cursor-pointer z-10"
              phx-click="remove-selected" phx-value-ref={entry.ref}
            >
              <svg fill="#cfcfcf" height="10" width="10" version="1.1" id={"close_pic-#{entry.ref}"} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 460.775 460.775" xml:space="preserve">
                <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
                  c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
                  c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
                  c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
                  l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
                  c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/>
              </svg>
            </div>
          </li>

          <!-- Entry errors -->
          <div>
            <%= for err <- upload_errors(@uploads.image_list, entry) do %>
              <div class="rounded-md bg-red-50 p-4 mb-2">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800"><%= error_to_string(err) %></h3>
                  </div>
                </div>
              </div>
            <% end %>
          </div>
        <% end %>
      </ul>
    </div>
  </div>
</div>
```

We've made an important change.

For `live_file_input` to work and upload the images
when clicking the `Upload` button,
the event created in `phx-submit` 
will **only work** 
if the `Upload` button
(of `type="submit"`)
is within the `<form>` element.

Therefore,
we've put the "Upload" button 
inside the form,
which has the `phx-submit="save"` annotation.
This means that, once the person wants to upload the images,
the `"save"` event handler in the LiveView is invoked.

```elixir
  def handle_event("save", _params, socket) do
    {:noreply, socket}
  end
```

It currently does nothing
but we will process the uploaded files in a later section.

Now that we're uploading the images,
we might have a scenario where the uploader client fails.
Let's add the handler in `lib/app_web/live/imgup_live.ex`:

```elixir
  def error_to_string(:external_client_failure), do: "Couldn't upload files to S3. Open an issue on Github and contact the repo owner."
```

The `:external_client_failure` is created 
when the uploader files.
This is our way to handle it in case something happens.

And we're done!

If you run `source .env` and `mix phx.server`,
select an image and click on "Upload",
it should show in your bucket on `AWS S3`!

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/91f72bf2-9efb-4037-9b9a-ea06a25a9414">
</p>

Awesome job! 🎉


## 5. Feedback on progress of upload

We've got ourselves a working app!
But, unfortunately, the person using it
doesn't have any feedback when they successfully upload the image files 😔.

Let's fix this!

First, we ought to change the view.
First, open `lib/app_web/components/layouts/app.html.heex`
and change it.

```html
<main class="px-4 sm:px-6 lg:px-8">
  <div class="mx-auto">
    <.flash_group flash={@flash} />
    <%= @inner_content %>
  </div>
</main>
```

We've basically made the app wrapper make use of the full width.
This is just so everything looks better on mobile devices 📱.

Next, head over to `lib/app_web/live/imgup_live.html.heex`
and change it to the following piece of code:

```html
<div class="px-4 py-10 sm:px-6 sm:py-28 lg:px-8 xl:px-28 xl:py-32">
  <div class="flex flex-col justify-around md:flex-row">
    <div class="flex flex-col flex-1 md:mr-4">

      <!-- Drag and drop -->
      <div class="space-y-12">
        <div class="border-gray-900/10 pb-12">
          <h2 class="text-base font-semibold leading-7 text-gray-900">Image Upload</h2>
          <p class="mt-1 text-sm leading-6 text-gray-600">Drag your images and they'll be uploaded to the cloud! ☁️</p>
          <p class="mt-1 text-sm leading-6 text-gray-600">You may add up to <%= @uploads.image_list.max_entries %> exhibits at a time.</p>

          <!-- File upload section -->
          <form class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8" phx-change="validate" phx-submit="save">

            <div class="col-span-full">
              <div
                class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
                phx-drop-target={@uploads.image_list.ref}
              >
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                  </svg>
                  <div class="mt-4 flex text-sm leading-6 text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                      <div>
                        <label class="cursor-pointer">
                          <.live_file_input upload={@uploads.image_list} class="hidden" />
                          Upload
                        </label>
                      </div>
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="submit"
                class={"rounded-md
                      #{if are_files_uploadable?(@uploads.image_list) do "bg-indigo-600" else "bg-indigo-200" end}
                      px-3 py-2 text-sm font-semibold text-white shadow-sm
                      #{if are_files_uploadable?(@uploads.image_list) do "hover:bg-indigo-500" end}
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"}
                disabled={!are_files_uploadable?(@uploads.image_list)}
              >
                Upload
              </button>
            </div>

          </form>
        </div>
      </div>

      <!-- Selected files preview section -->
      <div class="mt-12">
        <h2 class="text-base font-semibold leading-7 text-gray-900">Selected files</h2>
        <ul role="list" class="divide-y divide-gray-100">

          <%= for entry <- @uploads.image_list.entries do %>

            <progress value={entry.progress} max="100" class="w-full h-1"> <%= entry.progress %>% </progress>

            <!-- Entry information -->
            <li class="relative flex justify-between gap-x-6 py-5" id={"entry-#{entry.ref}"}>
              <div class="flex gap-x-4">
                <.live_img_preview entry={entry} class="h-auto w-12 flex-none bg-gray-50" />
                <div class="min-w-0 flex-auto">
                  <p class="text-sm font-semibold leading-6 break-all text-gray-900">
                    <span class="absolute inset-x-0 -top-px bottom-0"></span>
                    <%= entry.client_name %>
                  </p>
                </div>
              </div>
              <div
                class="flex items-center gap-x-4 cursor-pointer z-10"
                phx-click="remove-selected" phx-value-ref={entry.ref}
              >
                <svg fill="#cfcfcf" height="10" width="10" version="1.1" id={"close_pic-#{entry.ref}"} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 460.775 460.775" xml:space="preserve">
                  <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
                    c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
                    c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
                    c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
                    l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
                    c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/>
                </svg>
              </div>
            </li>

            <!-- Entry errors -->
            <div>
              <%= for err <- upload_errors(@uploads.image_list, entry) do %>
                <div class="rounded-md bg-red-50 p-4 mb-2">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800"><%= error_to_string(err) %></h3>
                    </div>
                  </div>
                </div>
              <% end %>
            </div>
          <% end %>
        </ul>
      </div>

    </div>

    <div class='flex flex-col flex-1 mt-10 md:mt-0 md:ml-4'>
        <h2 class="text-base font-semibold leading-7 text-gray-900">Uploaded files</h2>
        <p class="mt-1 text-sm leading-6 text-gray-600">Your uploaded images will appear here below!</p>
        <p class="mt-1 text-sm leading-6 text-gray-600">These images are located in the S3 bucket! 🪣</p>

        <ul role="list" class="divide-y divide-gray-100">
          <%= for file <- @uploaded_files do %>

            <!-- Entry information -->
            <li class="relative flex justify-between gap-x-6 py-5" id={"uploaded-#{file.key}"}>
              <div class="flex gap-x-4">
                <img class="block max-w-12 max-h-12 w-auto h-auto flex-none bg-gray-50" src={file.public_url}>
                <div class="min-w-0 flex-auto">
                  <a
                    class="text-sm font-semibold leading-6 break-all text-gray-900"
                    href={file.public_url}
                    target="_blank" rel="noopener noreferrer"
                  >
                    <%= file.public_url %>
                  </a>
                </div>
              </div>
            </li>

          <% end %>
        </ul>

    </div>
  </div>
</div>
```

Let's go over the changes we've made:

- the app now has two responsive columns:
one for **selected image files**
and another one for the **uploaded image files**.
The latter will have a list of the uploaded files,
with the image preview
and the public URL they're currently being stored - 
our `S3` instance.
The list of uploaded files pertain to the `:uploaded_files` socket assign
we've defined on the `mount/3` function in our LiveView
`lib/a--Web/live/imgup_live.ex` file.
- removed the "Cancel" button.
- added a `<progress>` HTML element
that uses the `entry.progress` value.
This value is updated in real-time 
because of the uploader hook we've implemented in 
`assets/js/app.js`.

If you run `mix phx.server`,
you should see the following screen.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/f5b6d280-bc33-4b74-bb63-76f751291010">
</p>

If we click the "Upload" button,
we can see the progress bar progress, 
indicating that the file is being uploaded.

> If your image is small in size, 
> this might not be discernable.
> Try to upload a `5 Mb` file 
> and you should see it more clearly.

However, nothing else changes.
We need to **consume** our file entries
to be displayed in the "Uploaded files" column we've just created!

For this, head over to `lib/app_web/live/imgup_live.ex`,
locate the `"save"` event handler
and change it to the following.

```elixir
  def handle_event("save", _params, socket) do

    uploaded_files = consume_uploaded_entries(socket, :image_list, fn %{uploader: _} = meta, _entry ->
      public_url = meta.url <> "/#{meta.key}"
      meta = Map.put(meta, :public_url, public_url)
      {:ok, meta}
    end)

    {:noreply, update(socket, :uploaded_files, &(&1 ++ uploaded_files))}
  end
```

We are using the
[`consume_uploaded_entries/3`](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html#consume_uploaded_entries/3)
for this goal.
This function **consumes the selected file entries**.
For form submissions (which is our case),
we are guaranteed that all entries have been "completed"
before the submit event is invoked, 
meaning they are *ready to be uploaded*.
Once file entries are consumed, 
they are **removed from the selected files list**.

In the third parameter,
we pass a function that iterates over the files.
We use this function to attach a `public_url` metadata 
to the file that is used in our view, 
more specifically the "Uploaded files" column.

Each list item of this "Uploaded files" column
prints this public URL and previews the image.

You can see this behaviour if you run `mix phx.server`.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/8f1a32d6-496f-407f-8642-097224c07202">
</p>

Awesome! 🥳

Now the person has proper feedback to what is going on!
Great job!

