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

Let's block the user to upload invalid files.
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

With this, we can block the user to upload the files if:
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
