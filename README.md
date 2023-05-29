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
  - [2. File upload and preview](#2-file-upload-and-preview)


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
     |> allow_upload(:exhibit, accept: ~w(video/* image/*), max_entries: 6, chunk_size: 64_000)}
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


## 2. File upload and preview






