<div align="center">

# `image uploads`

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/dwyl/imgup/ci.yml?label=build&style=flat-square&branch=main)
[![codecov.io](https://img.shields.io/codecov/c/github/dwyl/imgup/main.svg?style=flat-square)](http://codecov.io/github/dwyl/imgup?branch=main)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)](https://github.com/dwyl/imgup/issues)
[![HitCount](https://hits.dwyl.com/dwyl/imgup.svg?style=flat-square&show=unique)](https://hits.dwyl.com/dwyl/imgup)

Effortlessly **upload `images`** 
to **`AWS S3`**
using `Phoenix + LiveView`. 

</div>

<br />

- [`image uploads`](#image-uploads)
- [Why? 🤷](#why-)
- [What? 💭](#what-)
- [Who? 👤](#who-)
- [How? 💻](#how-)
  - [Prerequisites](#prerequisites)
  - [Run the App!](#run-the-app)
    - [1. Clone the Repo](#1-clone-the-repo)
    - [2. Get your `AWS` Keys and Export as Environment Variables](#2-get-your-aws-keys-and-export-as-environment-variables)
    - [3. Download the Dependencies and Run the App!](#3-download-the-dependencies-and-run-the-app)
- [Build It! 👩‍💻](#build-it-)
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
  - [6. Unique file names](#6-unique-file-names)
  - [7. Resizing/compressing files](#7-resizingcompressing-files)
    - [7.1 Installing `AWS CLI` and `AWS SAM CLI`](#71-installing-aws-cli-and-aws-sam-cli)
    - [7.2 Creating a new `AWS SAM` project](#72-creating-a-new-aws-sam-project)
    - [7.3 Changing the `AWS SAM` project files](#73-changing-the-aws-sam-project-files)
      - [7.3.1 Implementing the `src/index.js` handler](#731-implementing-the-srcindexjs-handler)
    - [7.4 Deploying our `AWS SAM` project](#74-deploying-our-aws-sam-project)
    - [7.5 Testing the deployed `SAM` project in `AWS Console`](#75-testing-the-deployed-sam-project-in-aws-console)
      - [7.5.1 What if I want to make changes to the function?](#751-what-if-i-want-to-make-changes-to-the-function)
    - [7.6 Refactoring the `Phoenix` app to use image compression](#76-refactoring-the-phoenix-app-to-use-image-compression)
    - [7.7 Run it!](#77-run-it)
  - [8. A note when deploying online](#8-a-note-when-deploying-online)
  - [9. Uploading files without `Javascript`](#9-uploading-files-without-javascript)
    - [9.1 Creating a new LiveView](#91-creating-a-new-liveview)
    - [9.2 Adding our view](#92-adding-our-view)
- [_Please_ Star the repo! ⭐️](#please-star-the-repo-️)


<br />

# Why? 🤷

Building our 
[app](https://github.com/dwyl/app),
we consider `images` an _essential_ 
medium of communication.

> "_An Image is Worth 16x16 Words ..._" 😉

By adding support for interactive file uploads,
we can leverage this feature and easily apply it 
any client app that wishes to upload their `images`
to a reliable & secure place.

# What? 💭

This run-through will create a simple
`Phoenix LiveView` web application
that will allow you to choose/drag an image
and upload it to your own 
[`AWS S3`](https://aws.amazon.com/s3/) 
bucket.


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
e.g: 
[github.com/dwyl/**phoenix-chat-example**](https://github.com/dwyl/phoenix-chat-example)

In addition to this,
**_some_ knowledge of `AWS`** - 
what it is, what an `S3` bucket is/does -
**is assumed**. 

> **Note**: if you have questions or get stuck,
> please open an issue! 
> [/dwyl/imgup/issues](https://github.com/dwyl/imgup/issues)


## Run the App!

You can easily see the App in action on Fly.io: 
[imgup.fly.dev](https://imgup.fly.dev/)

But if you want to _run_ it on your `localhost`, 
follow these 3 easy steps:

### 1. Clone the Repo

Clone the latest code:
```sh
git clone git@github.com:dwyl/imgup.git && cd imgup
```

### 2. Get your `AWS` Keys and Export as Environment Variables

Create an `.env` file e.g:

```sh
vi .env
```

and add your credentials to it:

```sh
export AWS_ACCESS_KEY_ID='YOUR_KEY'
export AWS_SECRET_ACCESS_KEY='YOUR_KEY'
export AWS_REGION='eu-west-3'
export AWS_S3_BUCKET_ORIGINAL=imgup-original
export AWS_S3_BUCKET_COMPRESSED=imgup-compressed
```

In your terminal, run `source .env` to export the keys.
We are assuming all of the resources created in your application
will be on the same reason.
This env variable will be used on two different occasions:
- on our LiveView.
- on our API (check [`api.md`](api.md)) with a package called `ex_aws`.


### 3. Download the Dependencies and Run the App!

Run the commands:

```sh
mix setup && mix s
```

Then open your web browser to: 
[localhost:4000](http://localhost:4000)
and start uploading! 

# Build It! 👩‍💻

## 0. Creating a fresh `Phoenix` project

Let's create a fresh `Phoenix` project.
Run the following command in a given folder:

```sh
mix phx.new . --app app --no-dashboard --no-mailer
```

We're running [`mix phx.new`](https://hexdocs.pm/phoenix/Mix.Tasks.Phx.New.html)
to generate a new project without a dashboard
and mailer (email) service,
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
which is needed to allow file uploads in `LiveView`.

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

This is a simple HTML form that uses 
[`Tailwind CSS`](https://github.com/dwyl/learn-tailwind)
to enhance the presentation of the upload form. 
We'll also remove the unused header of the page layout,
while we're at it.

Locate the file `lib/app_web/components/layouts/app.html.heex`
and remove the `<header>` class.
The file should only have the following code:

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
you should see the following screen:

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
in our `LiveView` app and preview them 
*before* uploading to `AWS S3`.

Change `lib/app_web/live/imgup_live.html.heex` 
to the following piece of code:

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
      region: System.get_env("AWS_REGION"),
      access_key_id: System.get_env("AWS_ACCESS_KEY_ID"),
      secret_access_key: System.get_env("AWS_SECRET_ACCESS_KEY")
    }

    {:ok, fields} =
      SimpleS3Upload.sign_form_upload(config, bucket,
        key: key,
        content_type: entry.client_type,
        max_file_size: uploads[entry.upload_config].max_file_size,
        expires_in: :timer.hours(1)
      )

    meta = %{uploader: "S3", key: key, url: "https://#{bucket}.s3-#{config.region}.amazonaws.com", fields: fields}
    {:ok, meta, socket}
  end
```

This function will be called
every time the person wants to
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

    // Getting each image entry and appending it to the form data
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
**un-toggle `Block all public access`**.
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

At last, 
we need to change the `CORS` settings
at the bottom of the page.
We are going to open the bucket to the public, 
so anyone can check it.
**However**, once deployed,
you should change the `AllowedOrigins` 
to restrict what domains can view the bucket contents.

Paste the following and save.

```
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "POST",
            "GET",
            "PUT",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

> **Warning**
>
> Again, don't forget to change the `AllowedOrigins`
> to the domain of your site.
> If you don't, all the contents of the bucket 
> is **publicly accessible to *anyone***.
> Unless you want anyone to see them,
> you should change this setting.

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
          <form class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8" phx-change="validate" phx-submit="save" id="upload-form">

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
                id="submit_button"
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
            <li class="pending-upload-item relative flex justify-between gap-x-6 py-5" id={"entry-#{entry.ref}"}>
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
                id={"close_pic-#{entry.ref}"}
              >
                <svg fill="#cfcfcf" height="10" width="10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
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
            <li class="uploaded-item relative flex justify-between gap-x-6 py-5" id={"uploaded-#{file.key}"}>
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


## 6. Unique file names

Currently, we are uploading the file images 
to the `S3` bucket with the original file name.
To have more control over our resources
and avoid overriding images 
(when we upload images with the same name to our bucket, 
it gets overridden),
we are going to assign a 
**unique `content ID` to each file**.

Luckily for us, this is fairly simple!

We first need to install the 
[`cid`](https://github.com/dwyl/cid) package.
Open `mix.exs`
and add the following line to the `deps` section.

```elixir
 {:excid, "~> 0.1.0"}
```

And then run `mix deps.get` to install this new dependency.

To change the name of the file,
open `lib/app_web/live/imgup_live.ex`
and locate the `presign_upload/2`.
Change the `key` variable to the following:

```elixir
    key = Cid.cid("#{DateTime.utc_now() |> DateTime.to_iso8601()}_#{entry.client_name}")
```

We are creating a 
[`CID`](https://docs.ipfs.tech/concepts/content-addressing/)
from a string with the format 
`currentdate_filename`.
This is the new filename. 

If you run `mix phx.server`
and upload a file,
you will see that this new `CID`
is present in the `URL` 
and in the uploaded file in the `S3` bucket.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/f0ee7a56-c297-400e-a7d0-2195f7d77fbb">
</p>

And here's the bucket!

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/2511cfe2-610f-4726-8a01-d1397c03bdab">
</p>

Now we don't have conflicts between the files each person uploads!


## 7. Resizing/compressing files

We've set a hard limit on the image file size
one person can upload.
Because we're using cloud storage and doing so at a reduced scale,
it's easy to dismiss any concerns about hosting data and their size.
But if we think at scale,
we ought to be careful when estimating our cloud storage budget.
Those megabytes can stack up easily *and quite fast*.

So, it's good practice to implement 
**image resizing/compression**.
Every time a person uploads an image,
we want to save the *original image in a bucket*,
compress it and 
*save the compressed version in another bucket*.
The latter is what what will serve the client.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/bd61d716-8a4e-445f-a643-8f5d13a00510">
</p>


You may be wondering:
why do we need two buckets?
Besides decoupling resources,
we want to mitigate the possibility of recursive event loops.
For example,
if we had everything in the same bucket,
when a person uploads an *original image*,
the lambda function *would compress it and send it to the bucket*.
This new upload *would trigger another compression*,
and so on.

This, of course,
is not desirable and can become **quite costly**!
This is why we'll create *two buckets*.

Now let's
**build our image compression pipeline**
following the architecture we've just detailed.


### 7.1 Installing `AWS CLI` and `AWS SAM CLI` 

To make the setup and tear down of our pipeline easier,
we'll be using 
[`AWS SAM`](https://aws.amazon.com/serverless/sam/).
This will allow us to create serverless applications,
combining multiple resources.
Our `SAM` project will create the needed resources 
([`S3`](https://aws.amazon.com/s3/) buckets
and [`Lambda Function`](https://aws.amazon.com/lambda/))
and `IAM` roles necessary to execute image compression
and read/write files to our `S3` buckets.

With `SAM`, we can define and deploy
our `AWS` resources with a easy-to-read `YAML` template.

To create a `SAM` project,
you need to install the **`SAM CLI`**.
But, before this,
you need to fulfil the prerequisites named in 
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html.
Essentially, you need:
- a **`IAM` user account**.
- an **access key ID** and **secret access key**.
- **`AWS CLI`**.

Because you've already created your credentials
to upload files to the buckets earlier,
you probably only need to install the `AWS CLI`.

Therefore, follow https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html 
to install `AWS CLI`
**and then**
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html#prerequisites-configure-credentials
to *configure it with your `AWS` credentials*.

After this,
simply follow https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
to install the `AWS SAM CLI`.

After following these guides,
you should be all set to create a new project!


### 7.2 Creating a new `AWS SAM` project

Now we're ready to create our `AWS SAM` project!

> If you're lazy,
> you can just use the `an_aws_sam_imgup-compressor`
> folder and run the commands needed to deploy there.
> We'll deploy the pipeline in the next section,
> so feel free to skip this one 
> if you want to skip creating the project folder,
> and go to [7.4 Deploying our `AWS SAM` project](#74-deploying-our-aws-sam-project).

Open a terminal window 
and navigate to your project's directory.
This process will create a folder within it.
Type:

```sh
sam init
```

Step through the init options like so:

```sh
Which template source would you like to use?
	1 - AWS Quick Start Templates

Choose an AWS Quick Start application template
	1 - Hello World Example

Use the most popular runtime and package type? (Python and zip) [y/N]: N

Which runtime would you like to use?
	13 - nodejs14.x

What package type would you like to use?
	1 - Zip

Select your starter template
	1 - Hello World Example

Would you like to enable X-Ray tracing on the function(s) in your application?  [y/N]: N

Would you like to enable monitoring using CloudWatch Application Insights?
For more info, please view https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html [y/N]: N

Project name: your_project_name
```

Give your project name whatever you like.
We gave ours `imgup-compressor`.


### 7.3 Changing the `AWS SAM` project files

Now it's time to define
our `SAM` template!
Navigate to the project directory
that was just created
and locate the `template.yaml` file.
Change it to the following:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: DWYL-Imgup image compression pipeline

Parameters:
  UncompressedBucketName:
    Type: String
    Description: "Bucket for storing full resolution images"

  CompressedBucketName:
    Type: String
    Description: "Bucket for storing compressed images"

Resources:
  UncompressedBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref UncompressedBucketName

  CompressedBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref CompressedBucketName

  ImageCompressorLambda:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/index.handler
      Runtime: nodejs14.x
      MemorySize: 1536
      Timeout: 60
      Environment:
        Variables:
          UNCOMPRESSED_BUCKET: !Ref UncompressedBucketName
          COMPRESSED_BUCKET: !Ref CompressedBucketName
      Policies:
        - S3ReadPolicy:
           BucketName: !Ref UncompressedBucketName
        - S3WritePolicy:
            BucketName: !Ref CompressedBucketName
      Events:
        CompressImageEvent:
          Type: S3
          Properties:
            Bucket: !Ref UncompressedBucket
            Events: s3:ObjectCreated:*
```

Let's walk through the template:
- the `Parameters` block will allow us to pass in some names for our `S3` buckets
when deploying our `SAM` template.
- the `Resources` block has all the resources needed.
In our case, we have the `UncompressedBucket` and
`CompressedBucket`, which are both self-explanatory.
Both buckets then have their respective bucket names set from the parameters
we previously defined.
The `ImageCompressorLambda` is the Lambda Function,
which uses the `Node.js` runtime 
and points to `src/index.handler` location.
Under the `Policies` section,
we give the Lambda function the appropriate permissions
to read data from the `UncompressedBucket`
and write to `CompressedBucket`.
And lastly, we configure the event trigger for the Lambda function.
The event is fired any time an object is created in the
`UncompressedBucket`.


#### 7.3.1 Implementing the `src/index.js` handler

We are going to be using 
[`sharp`](https://github.com/lovell/sharp)
to do the image compression and manipulation. 
Although we'll only shrink our images,
you can do much more with this library,
so we encourage you to peruse through the documentation.

To setup our Lambda function,
we'll add `sharp` as as a dependency.
According to https://sharp.pixelplumbing.com/install#aws-lambda,
we need to run extra commands to make sure the binaries
present within the `node_modules` are targeted for a Linux x64 platform.
So, run the following commands in the project directory:

```sh
# windows users
rmdir /s /q node_modules/sharp
npm install --arch=x64 --platform=linux sharp

# mac users
rm -rf node_modules/sharp
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --arch=x64 --platform=linux sharp
```

This will remove `sharp` from the `node_modules`
and install the dedicated Linux x64 dependency,
which is best suited for Lambda Functions.

Now, we're ready to setup the Lambda Function logic!
So, clear the `src` directory (you may delete the `__tests__` directory as well),
and add `index.js` within it.
Then add the following code 
to `src/index.js`.

```js
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const sharp = require('sharp');

exports.handler = async (event) => {

    // Collect the object key from the S3 event record
    const { key } = event.Records[0].s3.object;

    console.log({ triggerObject: key });

    // Collect the full resolution image from s3 using the object key
    const uncompressedImage = await S3.getObject({
        Bucket: process.env.UNCOMPRESSED_BUCKET,
        Key: key,
    }).promise();

    // Compress the image to a 200x200 avatar square as a buffer, without stretching
    const compressedImageBuffer = await sharp(uncompressedImage.Body)
    .resize({ 
        height: 200, 
        fit: 'contain'
    })
    .png()
    .toBuffer();

    // Upload the compressed image buffer to the Compressed Images bucket
    await S3.putObject({
        Bucket: process.env.COMPRESSED_BUCKET,
        Key: key,
        Body: compressedImageBuffer,
        ContentType: "image/png",
        ACL: 'public-read'
    }).promise();

    console.log(`Compressing ${key} complete!`)

}
```

In this code, we are:
- **extracting the image object key from the event that triggered**
the Lambda Function's execution.
- using the `aws sdk` to **download the image to our lambda function**.
Because we've defined the env variables in `template.yaml`,
we can use them in our function.
(e.g. `process.env.UNCOMPRESSED_BUCKET`).
- with the downloaded image,
**we use `sharp` to resize it**.
We're resizing it to `200x200` 
and containing it so the aspect ratio remains intact.
You can add more steps here if you want bigger compression,
or just want to compress the image and not resize it.
- with the response from the `sharp` object,
we **save it in the `CompressedBucket`**
with the same key as the original.


### 7.4 Deploying our `AWS SAM` project

Now we are ready to deploy the project!
Let's run the following command first,
to validate our `template.yaml` file looks good!

```sh
sam validate
```

You should see `.../template.yaml is a valid SAM Template`.

Now run:

```sh
sam build --use-container
```

> You will need `Docker` for this step.
> Install it and make sure you are running it
> in your computer.
> This is necessary for this step to work,
> or else it will err.

Once that's complete,
we can push our build 
(located in `.aws-sam` folder that was generated with the previous command)
by running this command:

```sh
sam deploy --guided
```

Stepping through the guided deployment options,
you will be given some options
to specify the application stack name, region, 
the parameters we've defined 
and other questions.
Here's how it might look like.

**Make sure the name of the buckets are new**.
The deploy won't work if you are referencing
pre-existing buckets.

```sh
Configuring SAM deploy
======================

	Looking for config file [samconfig.toml] :  Found
	Reading default arguments  :  Success

	Setting default arguments for 'sam deploy'
	=========================================
	Stack Name: imgup-compressor
	AWS Region: eu-west-3
	Parameter UncompressedBucketName: imgup-original
	Parameter CompressedBucketName: imgup-compressed
	#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
	Confirm changes before deploy [Y/n]: y
	#SAM needs permission to be able to create roles to connect to the resources in your template
	Allow SAM CLI IAM role creation [Y/n]: y
	#Preserves the state of previously provisioned resources when an operation fails
	Disable rollback [Y/n]:y
	Save arguments to configuration file [Y/n]:y
	SAM configuration file [samconfig.toml]:
	SAM configuration environment [default]:

	Looking for resources needed for deployment:

	Managed S3 bucket: YOUR_ARN
	A different default S3 bucket can be set in samconfig.toml and auto resolution of buckets turned off by setting resolve_s3=False

        Parameter "stack_name=imgup-compressor" in [default.deploy.parameters] is defined as a global parameter [default.global.parameters].
        This parameter will be only saved under [default.global.parameters] in SAMCONFIG.TOML_DIRECTORY

	Saved arguments to config file
	Running 'sam deploy' for future deployments will use the parameters saved above.
	The above parameters can be changed by modifying samconfig.toml
	Learn more about samconfig.toml syntax at
	https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-config.html

	Uploading to imgup-compressor/d8c6387871515182264b3216514aa5ee  19584628 / 19584628  (100.00%)

	Deploying with following values
	===============================
	Stack name                   : imgup-compressor
	Region                       : eu-west-3
	Confirm changeset            : False
	Disable rollback             : True
	Deployment s3 bucket         : YOUR_S3_BUCKET_DEPLOYMENT_HERE
	Capabilities                 : ["CAPABILITY_IAM"]
	Parameter overrides          : {"UncompressedBucketName": "imgup-original", "CompressedBucketName": "imgup-compressed"}
	Signing Profiles             : {}

Initiating deployment
=====================

	Uploading to imgup-compressor/4c6644481fa7648c72204db9979bf585.template  1590 / 1590  (100.00%)


Waiting for changeset to be created..

CloudFormation stack changeset
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Operation                                                   LogicalResourceId                                           ResourceType                                                Replacement
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
+ Add                                                       CompressedBucket                                            AWS::S3::Bucket                                             N/A
+ Add                                                       ImageCompressorLambdaCompressImageEventPermission           AWS::Lambda::Permission                                     N/A
+ Add                                                       ImageCompressorLambdaRole                                   AWS::IAM::Role                                              N/A
+ Add                                                       ImageCompressorLambda                                       AWS::Lambda::Function                                       N/A
+ Add                                                       UncompressedBucket                                          AWS::S3::Bucket                                             N/A
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


Changeset created successfully on YOUR_ARN


2023-06-01 18:05:03 - Waiting for stack create/update to complete

CloudFormation events from stack operations (refresh every 5.0 seconds)
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
ResourceStatus                                              ResourceType                                                LogicalResourceId                                           ResourceStatusReason
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE_IN_PROGRESS                                          AWS::IAM::Role                                              ImageCompressorLambdaRole                                   -
CREATE_IN_PROGRESS                                          AWS::S3::Bucket                                             CompressedBucket                                            -
CREATE_IN_PROGRESS                                          AWS::IAM::Role                                              ImageCompressorLambdaRole                                   Resource creation Initiated
CREATE_IN_PROGRESS                                          AWS::S3::Bucket                                             CompressedBucket                                            Resource creation Initiated
CREATE_COMPLETE                                             AWS::S3::Bucket                                             CompressedBucket                                            -
CREATE_COMPLETE                                             AWS::IAM::Role                                              ImageCompressorLambdaRole                                   -
CREATE_IN_PROGRESS                                          AWS::Lambda::Function                                       ImageCompressorLambda                                       -
CREATE_IN_PROGRESS                                          AWS::Lambda::Function                                       ImageCompressorLambda                                       Resource creation Initiated
CREATE_COMPLETE                                             AWS::Lambda::Function                                       ImageCompressorLambda                                       -
CREATE_IN_PROGRESS                                          AWS::Lambda::Permission                                     ImageCompressorLambdaCompressImageEventPermission           -
CREATE_IN_PROGRESS                                          AWS::Lambda::Permission                                     ImageCompressorLambdaCompressImageEventPermission           Resource creation Initiated
CREATE_COMPLETE                                             AWS::Lambda::Permission                                     ImageCompressorLambdaCompressImageEventPermission           -
CREATE_IN_PROGRESS                                          AWS::S3::Bucket                                             UncompressedBucket                                          -
CREATE_IN_PROGRESS                                          AWS::S3::Bucket                                             UncompressedBucket                                          Resource creation Initiated
CREATE_COMPLETE                                             AWS::S3::Bucket                                             UncompressedBucket                                          -
CREATE_COMPLETE                                             AWS::CloudFormation::Stack                                  imgup-compressor                                            -
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


Successfully created/updated stack - imgup-compressor in eu-west-3
```

If everything has gone according to plan,
you should be able to see this new deployment
in your `AWS` console!


### 7.5 Testing the deployed `SAM` project in `AWS Console`

If you visit https://console.aws.amazon.com/cloudformation/home,
you will see a `CloudFormation Stack` has been created.

> From https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html:
>
> A stack is a collection of AWS resources that you can manage as a single unit. 
> In other words, you can create, update, or delete a collection of resources by creating, updating, or deleting stacks. 
> All the resources in a stack are defined by the stack's AWS CloudFormation template. 
> A stack, for instance, can include all the resources required to run a web application, such as a web server, a database, and networking rules. 
> If you no longer require that web application, 
> you can simply delete the stack, and all of its related resources are deleted.


<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/58c7789b-b463-4804-9854-6330ddff59d2">
</p>

If you check your `S3` buckets,
you will see that the two buckets have been created as well.
**It is important that you follow the steps in**
[4.3.1 Changing the bucket permissions](#431-changing-the-bucket-permissions).
We need the buckets to be public so they are accessible.
***Again***, make sure the `CORS` definition points
to the domain of the deployed web app. 
Or else anyone can read your bucket directly.

Additionally, 
a Lamdda Function should also have been created.
Check https://console.aws.amazon.com/lambda/home
and you should see it!


#### 7.5.1 What if I want to make changes to the function?

If you want to make changes to the Lambda Function,
you will have to **rollback the deployment of the resources**
and **re-build and re-deploy**.

You can rollback by going to the `CloudFormation Stack` 
in https://console.aws.amazon.com/cloudformation/home
with the name of the project we've created.
Click on it and click on "Delete".
This will initiate a rollback process
that will delete the created resources.

> **Warning**
>
> Make sure the `S3` buckets **are empty** 
> before trying to rollback.
> If they aren't empty, the rollback process *will fail*. 


<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/b7f5ec06-ba6a-4387-8453-1eb95c637586">
</p>


### 7.6 Refactoring the `Phoenix` app to use image compression

Now that we've deployed our awesome image compression pipeline,
we need to make changes to our `LiveView` application
to make use of this newly deployed pipeline.

Open `lib/app_web/live/imgup_live.ex`
and locate the `presign_upload/2` function.
Change it like so:

```elixir
  defp presign_upload(entry, socket) do
    uploads = socket.assigns.uploads
    bucket_original = "imgup-original-test2"
    bucket_compressed = "imgup-compressed-test2"
    key = Cid.cid("#{DateTime.utc_now() |> DateTime.to_iso8601()}_#{entry.client_name}")

    config = %{
      region: "eu-west-3",
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
      fields: fields}
    {:ok, meta, socket}
  end
```

We are now detailing `bucket_original` and `bucket_compressed`,
pertaining to the bucket where original files are stored
and compressed ones are stored, respectively. 
These buckets are used to *create the public URLs*,
one for the original bucket and another one for the compressed one.
This will be used to show to the person both URLs.

In the same file,
we also need to change the `"save"` handler 
to contain the `compressed_url` as well.

```elixir
  def handle_event("save", _params, socket) do

    uploaded_files = consume_uploaded_entries(socket, :image_list, fn %{uploader: _} = meta, _entry ->
      public_url = meta.url <> "/#{meta.key}"
      compressed_url = meta.compressed_url <> "/#{meta.key}"

      meta = Map.put(meta, :public_url, public_url)
      meta = Map.put(meta, :compressed_url, compressed_url)

      {:ok, meta}
    end)

    {:noreply, update(socket, :uploaded_files, &(&1 ++ uploaded_files))}
  end
```

Now let's change our view to show both URLs.
The uploaded files thumbnail will also be changed
to be sourced from the bucket with compressed images.
Open `lib/app_web/live/imgup_live.html.heex`
and change it to the following:

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
          <form class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8" phx-change="validate" phx-submit="save" id="upload-form">

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
                id="submit_button"
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
            <li class="pending-upload-item relative flex justify-between gap-x-6 py-5" id={"entry-#{entry.ref}"}>
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
                id={"close_pic-#{entry.ref}"}
              >
                <svg fill="#cfcfcf" height="10" width="10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
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
            <li class="uploaded-item relative flex justify-between gap-x-6 py-5" id={"uploaded-#{file.key}"}>
              <div class="flex gap-x-4">
                <!--
                Try to load the compressed image from S3. This is because the compression might take some time, so we retry until it's available
                See https://stackoverflow.com/questions/19673254/js-jquery-retry-img-load-after-1-second.
                -->
                <img class="block max-w-12 max-h-12 w-auto h-auto flex-none bg-gray-50" src={file.compressed_url} onerror="imgError(this);" >
                <div class="min-w-0 flex-auto">
                  <p>
                    <span class="text-sm font-semibold leading-6 break-all text-gray-900">Original URL:</span>
                    <a
                      class="text-sm leading-6 break-all underline text-indigo-600"
                      href={file.public_url}
                      target="_blank" rel="noopener noreferrer"
                    >
                      <%= file.public_url %>
                    </a>
                  </p>
                  <p>
                    <span class="text-sm font-semibold leading-6 break-all text-gray-900">Compressed URL:</span>
                    <a
                      class="text-sm leading-6 break-all underline text-indigo-600"
                      href={file.compressed_url}
                      target="_blank" rel="noopener noreferrer"
                    >
                      <%= file.compressed_url %>
                    </a>
                  </p>
                </div>
              </div>
            </li>

          <% end %>
        </ul>
    </div>

  </div>
</div>
```

Now the uploaded image's item shows both URLs.
Additionally, 
we have defined an `onerror` callback
on the thumbnail.
This is mainly because the compressed image might not be available
right off the bat (it's still being compressed),
so we define `imgError` function to
retry loading the image every second.

To define `imgError`, open `lib/app_web/components/layouts/root.html.heex`
and add the function to the script.

```html
<!DOCTYPE html>
<html lang="en" style="scrollbar-gutter: stable;">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content={get_csrf_token()} />
    <.live_title suffix=" · Phoenix Framework">
      <%= assigns[:page_title] || "App" %>
    </.live_title>
    <link phx-track-static rel="stylesheet" href={~p"/assets/app.css"} />
    <script defer phx-track-static type="text/javascript" src={~p"/assets/app.js"}>
    </script>
  </head>
  <body class="bg-white antialiased">
    <%= @inner_content %>

    <script>
      function imgError(image) {
        image.onerror = null;
        setTimeout(function (){
            image.src += '?' + +new Date;
        }, 1000);
      }
    </script>
  </body>
</html>
```

### 7.7 Run it! 

Now let's run it!
If you run `mix phx.server`
and upload a file,
you'll see the following screen.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/74f27733-402d-4597-bd33-f6f6663eb802">
</p>

Both buckets now have the file with the same key 
and are publicly accessible!

Awesome job! 
You've just added image compression to your web app! 🎉


## 8. A note when deploying online

If you want people
to access your bucket publicly,
it is wise to not let it be abused
(it can be quite costly for you!).

We recommend *deleting files after X days*
so you don't pay high amounts of storage.

For this, 
please follow 
https://repost.aws/knowledge-center/s3-empty-bucket-lifecycle-rule
to **set lifecycle rules on both of your buckets**.
This will *delete all the files of the bucket every X days*.


## 9. Uploading files without `Javascript`

> **Note**:
> 
> This section assumes you've implemented
> the `API`, as described in [`api.md`](./api.md).
> We are going to be using an `upload/1` function
> to directly upload a given file to an `S3` bucket 
> in our `LiveView` server.
>
> Give the document a read first so you're up to par! 😄

As you might have noticed,
we are using `Javascript` 
(in `assets/js/app.js`) to upload the file 
to a given `Uploader` (in our case, an `S3` bucket).
Although doing this in the client code is handy,
it's useful to show a completely **server-sided option**,
in which the file is uploaded in our `LiveView` Elixir server.

For this,
we are going to be a **clientless file upload page** (to demonstrate this other scenario).
This page will be similar to the previously developed `LiveView` page,
albeit with some differences.

Here is the flow of what the person using the page
will expect to upload a file.

- choose a file to input.
- upon successful selection, the image will be automatically uploaded
**locally in the server**.
- to upload the file to the `S3` bucket, 
the person will have to manually click the `Upload` button to upload
the locally-saved file in the server to the bucket.
- after a successful upload,
the person will be shown both the original and compressed URLs,
just like before!

This is our flow.
So let's add our tests to represent this!

In `test/app_web/live`,
create a file called `imgup_clientless_live_test.exs`.

```elixir
defmodule AppWeb.ImgupClientlessLiveTest do
  use AppWeb.ConnCase
  import Phoenix.LiveViewTest
  import Mock

  test "connected mount", %{conn: conn} do
    conn = get(conn, "/liveview_clientless")
    assert html_response(conn, 200) =~ "(without file upload from client-side code)"

    {:ok, _view, _html} = live(conn)
  end

  import AppWeb.UploadSupport

  test "uploading a file", %{conn: conn} do
    {:ok, lv, html} = live(conn, ~p"/liveview_clientless")
    assert html =~ "Image Upload"

    # Get file and add it to the form
    file =
      [:code.priv_dir(:app), "static", "images", "phoenix.png"]
      |> Path.join()
      |> build_upload("image/png")

    image = file_input(lv, "#upload-form", :image_list, [file])

    # Should show an uploaded local file
    assert render_upload(image, file.name)
           |> Floki.parse_document!()
           |> Floki.find(".uploaded-local-item")
           |> length() == 1

    # Click on the upload button
    lv |> element(".submit_button") |> render_click()

    # Should show an uploaded S3 file
    assert lv
           |> render()
           |> Floki.parse_document!()
           |> Floki.find(".uploaded-s3-item")
           |> length() == 1
  end

  test "uploading a file fails and should show error", %{conn: conn} do
    {:ok, lv, html} = live(conn, ~p"/liveview_clientless")
    assert html =~ "Image Upload"

    with_mock App.Upload, upload: fn _input -> {:error, :failure} end do
      # Get file and add it to the form
      file =
        [:code.priv_dir(:app), "static", "images", "phoenix.png"]
        |> Path.join()
        |> build_upload("image/png")

      image = file_input(lv, "#upload-form", :image_list, [file])

      # Upload locally
      assert render_upload(image, file.name)

      # Click on the upload button
      lv |> element(".submit_button") |> render_click()

      # Should show an error
      assert lv |> render() =~ "failure"
    end
  end

  test "validate function should reply `no_reply`", %{conn: conn} do
    assert AppWeb.ImgupNoClientLive.handle_event("validate", %{}, conn) == {:noreply, conn}
  end
end
```

As you can see,
we're simply testing a success scenario 
(when a file is uploaded successfully to `S3`)
and another if the upload
(for whatever reason)
*fails* when uploading a file.
In the latter, an error should be shown.

Now that we've our tests,
let's start implementing!


### 9.1 Creating a new LiveView

Let's create a new file called `imgup_no_client_live.ex`
inside `lib/app_web/controllers/live`.
Use the following code:

```elixir
defmodule AppWeb.ImgupNoClientLive do
  use AppWeb, :live_view

  @upload_dir Application.app_dir(:app, ["priv", "static", "image_uploads"])

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:uploaded_files_locally, [])
     |> assign(:uploaded_files_to_S3, [])
     |> allow_upload(:image_list,
       accept: ~w(image/*),
       max_entries: 6,
       chunk_size: 64_000,
       auto_upload: true,
       max_file_size: 5_000_000,
       progress: &handle_progress/3
       # Do not define presign_upload. This will create a local photo in /vars
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
        updated_local_array = List.replace_at(socket.assigns.uploaded_files_locally, index, updated_file_element)

        {:noreply, assign(socket, :uploaded_files_locally, updated_local_array)}
    end
  end
end
```

Let's break down what we've just implemented.

- in `mount/3`, 
we've used [`allow_upload/3`](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html#allow_upload/3)
with the `auto_upload` setting turned on.
This instructs the client to upload the file automatically 
on file selection instead of waiting for form submits.
So, whenever the person uploads a file,
it will be uploaded locally automatically.
**Do note we are *not using `presign_upload`**.
This is because we don't want to upload the files externally *yet*.
So this option needs to not be defined in order to upload the files locally.
- in `mount/3`, 
we are also defining two arrays.
`uploaded_files_locally` tracks the files uploaded locally by the person.
`uploaded_files_to_S3` tracks the files uploaded to the `S3` bucket.

- `handle_progress/3` is automatically invoked
after a file is selected by the person - 
this is because `auto_upload` is set to `true`.
We [`consume_uploaded_entry`](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html#consume_uploaded_entry/3)
to get the file locally and so `LiveView` knows it's been uploaded.
Inside the callback of this function,
we create the file locally
and create the object
to be added to the `uploaded_files_locally` array in the socket assigns.
Each object follows the structure `%{image_url: url, url_path: path, errors: []}`.
The files are being saved inside `priv/static/image_uploads`.

- `handle_event("upload_to_s3, params, socket)` will be invoked
when the person clicks on the `Upload` button to upload
a given locally uploaded file.
It will call the `App.Upload.upload/1` function
implemented in [`api.md`](./api.md).
If the file is correctly uploaded,
it is added to the `uploaded_files_to_s3` socket assigns.
If not, an error is added to the file object inside the 
`uploaded_files_locally` socket assigns
so it can be shown to the person.

Now that we have our `LiveView`, 
we ought to add a view.
Let's do that!


### 9.2 Adding our view

Inside `lib/app_web/controllers/live`, 
create a file called `imgup_no_client_live.html.heex`.

```html
<div class="px-4 py-10 sm:px-6 sm:py-28 lg:px-8 xl:px-28 xl:py-32">
  <div class="flex flex-col justify-around md:flex-row">
    <div class="flex flex-col flex-1 md:mr-4">
      <!-- Drag and drop -->
      <div class="space-y-12">
        <div class="border-gray-900/10 pb-12">
          <h2 class="text-base font-semibold leading-7 text-gray-900">
            Image Upload <b>(without file upload from client-side code)</b>
          </h2>
          <p class="mt-1 text-sm leading-6 text-gray-400">
            The files uploaded in this page are not routed from the client. Meaning all file uploads are made in the LiveView code.
          </p>
          <p class="mt-1 text-sm leading-6 text-gray-600">
            Drag your images and they'll be uploaded to the cloud! ☁️
          </p>
          <p class="mt-1 text-sm leading-6 text-gray-600">
            You may add up to <%= @uploads.image_list.max_entries %> exhibits at a time.
          </p>
          <!-- File upload section -->
          <form
            class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8"
            phx-change="validate"
            phx-submit="save"
            id="upload-form"
          >
            <div class="col-span-full">
              <div
                class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
                phx-drop-target={@uploads.image_list.ref}
              >
                <div class="text-center">
                  <svg
                    class="mx-auto h-12 w-12 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <div class="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      for="file-upload"
                      class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <div>
                        <label class="cursor-pointer">
                          <.live_file_input upload={@uploads.image_list} class="hidden" /> Upload
                        </label>
                      </div>
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="flex flex-col flex-1 mt-10 md:mt-0 md:ml-4">
      <div>
        <h2 class="text-base font-semibold leading-7 text-gray-900">Uploaded files locally</h2>
        <p class="mt-1 text-sm leading-6 text-gray-600">
          Before uploading the images to S3, the files will be available locally.
        </p>
        <p class="mt-1 text-sm leading-6 text-gray-600">
          So these are the images that can be found locally!
        </p>

        <p class={"
            #{if length(@uploaded_files_locally) == 0 do "block" else "hidden" end}
            text-xs leading-7 text-gray-400 text-center my-10"}>
          No files uploaded.
        </p>

        <ul role="list" class="divide-y divide-gray-100">
          <%= for file <- @uploaded_files_locally do %>
            <!-- Entry information -->
            <li
              class="uploaded-local-item relative flex justify-between gap-x-6 py-5"
              id={"uploaded-locally-#{file.uuid}"}
            >
              <div class="flex gap-x-4">
                <!--
                    Try to load the compressed image from S3. This is because the compression might take some time, so we retry until it's available
                    See https://stackoverflow.com/questions/19673254/js-jquery-retry-img-load-after-1-second.
                    -->
                <img
                  class="block max-w-12 max-h-12 w-auto h-auto flex-none bg-gray-50"
                  src={file.image_url}
                />
                <div class="min-w-0 flex-auto">
                  <p>
                    <span class="text-sm font-semibold leading-6 break-all text-gray-900">
                      URL path:
                    </span>
                    <a
                      class="text-sm leading-6 break-all underline text-indigo-600"
                      href={file.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <%= file.url_path %>
                    </a>
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-end gap-x-6">
                <button
                  id={"#submit_button-#{file.uuid}"}
                  phx-click={JS.push("upload_to_s3", value: %{uuid: file.uuid})}
                  class="
                            submit_button
                            rounded-md
                            bg-indigo-600
                            px-3 py-2 text-sm font-semibold text-white shadow-sm
                            hover:bg-indigo-500
                            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Upload
                </button>
              </div>
            </li>
            <!-- Entry errors -->
            <div>
              <%= for err <- file.errors do %>
                <div class="rounded-md bg-red-50 p-4 mb-2">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg
                        class="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">
                        <%= err %>
                      </h3>
                    </div>
                  </div>
                </div>
              <% end %>
            </div>
          <% end %>
        </ul>
      </div>

      <div class="flex flex-col flex-1 mt-10">
        <h2 class="text-base font-semibold leading-7 text-gray-900">Uploaded files to S3</h2>
        <p class="mt-1 text-sm leading-6 text-gray-600">
          Here is the list of uploaded files in S3. 🪣
        </p>

        <p class={"
          #{if length(@uploaded_files_to_S3) == 0 do "block" else "hidden" end}
          text-xs leading-7 text-gray-400 text-center my-10"}>
          No files uploaded.
        </p>

        <ul role="list" class="divide-y divide-gray-100">
          <%= for file <- @uploaded_files_to_S3 do %>
            <!-- Entry information -->
            <li
              class="uploaded-s3-item relative flex justify-between gap-x-6 py-5"
              id={"uploaded-s3-#{file.uuid}"}
            >
              <div class="flex gap-x-4">
                <!--
                    Try to load the compressed image from S3. This is because the compression might take some time, so we retry until it's available
                    See https://stackoverflow.com/questions/19673254/js-jquery-retry-img-load-after-1-second.
                    -->
                <img
                  class="block max-w-12 max-h-12 w-auto h-auto flex-none bg-gray-50"
                  src={file.compressed_url}
                  onerror="imgError(this);"
                />
                <div class="min-w-0 flex-auto">
                  <p>
                    <span class="text-sm font-semibold leading-6 break-all text-gray-900">
                      Original URL:
                    </span>
                    <a
                      class="text-sm leading-6 break-all underline text-indigo-600"
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <%= file.url %>
                    </a>
                  </p>
                  <p>
                    <span class="text-sm font-semibold leading-6 break-all text-gray-900">
                      Compressed URL:
                    </span>
                    <a
                      class="text-sm leading-6 break-all underline text-indigo-600"
                      href={file.compressed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <%= file.compressed_url %>
                    </a>
                  </p>
                </div>
              </div>
            </li>
          <% end %>
        </ul>
      </div>
    </div>
  </div>
</div>
```

As you can see,
the layout is fairly similar to the client version of the LiveView
we've created earlier,
albeit with a few differences.

Let's add a new route in the
`lib/app_web/controllers/router.ex` file.

```elixir
scope "/", AppWeb do
    pipe_through :browser

    get "/", PageController, :home
    live "/liveview", ImgupLive
    live "/liveview_clientless", ImgupNoClientLive # add this line
  end
```

Now, if we run `mix phx.server`
and navigate to `http://localhost:4000/liveview_clientless`,
you'll be prompted with the following screen.

<p align="center">
  <img src="https://github.com/dwyl/imgup/assets/17494745/fdf7a8cd-c981-47a6-b1d6-f262daac072e">
</p>

Before being able to do anything,
we have to make a small change.
Go to `config/dev.exs` 
and change the `live_reload` parameter
to this:

```elixir
live_reload: [
  patterns: [
    ~r"priv/static/assets/.*(js|css|png|jpeg|jpg|gif|svg)$",
    ~r"priv/static/images/.*(js|css|png|jpeg|jpg|gif|svg)$",
    ~r"lib/app_web/(controllers|live|components)/.*(ex|heex)$"
  ]
]
```

When we run things locally,
Phoenix uses a package called `LiveReload`.
In this config we've just changed,
`LiveReload` forces the app to refresh 
whenever there's a change detected in them.
(check https://shankardevy.com/code/phoenix-live-reload/ for more information).
Because we don't want our app to refresh every time
a file is created locally,
we've changed these paths accordingly.

And we're done!
We have ourselves a fancy `LiveView` app
that uploads files to `S3` without any code on the client!

Awesome job! 🎉


# _Please_ Star the repo! ⭐️

If you find this package/repo useful, 
please star on GitHub, so that we know! ⭐

Thank you! 🙏