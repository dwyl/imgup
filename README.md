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




