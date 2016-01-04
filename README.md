# 365 Photos

An experiment in photography, to capture one photo each day for a year.

This SPA (Single Page App) gives you a responsive, mobile-friendly, website to display photos. The intent is that it be used to post one photo a day for a year, but it does not enforce that, so use it how you like.

See it in action at http://365photos.matthewross.me/
![Demo Image](http://matthewross.me/images/365.png)

## Requirements

A server with PHP running (tested on PHP 5.6.6). If building, you will need to have [`nodejs`](https://nodejs.org/), [`bower`](http://bower.io/), and [`sass`](http://sass-lang.com/install) installed.

## Install

### Build from Source

 1. Clone the repository via `git clone https://github.com/kiswa/365Photos`
   1. Modify the file `src/partials/about.html` to show your information
   2. Add a file at `src/images/headshot.jpg` with your headshot if you want one
   3. If your site is not at the root of your server, adjust the `<base href="/">` tag in `src/index.html` as needed and make the `RewriteBase` match in `src/.htaccess`
   4. If you want to change the default colors, edit `src/scss/_variables.scss`
 2. In the `365Photos` directory run `bower install && npm install` to install dependencies
 3. Run `gulp` to build the site
 4. Copy the files in the `dist` folder to your deployment location

### Copy and Modify

 1. Clone the repository via `git clone https://github.com/kiswa/365Photos`
   1. Modify the file `dist/partials/about.html` to show your information
   2. Add a file at `dist/images/headshot.jpg` with your headshot if you want one
   3. If your site is not at the root of your server, adjust the `<base href="/">` tag in `dist/index.html` as needed and make the `RewriteBase` match in `dist/.htaccess`
   4. If you want to change colors, edit the file `dist/css/styles.css`
 2. Copy the files in the `dist` folder to your deployment location

## Usage

Go to your site and add `/admin` to the end to login to the admin area. Use the username and password `admin` the first time.

Make sure you change your password first thing, so no one else can upload pictures to your site.

To upload a new image, log into the admin area and fill in the form. The Short Title is what is displayed beneath thumbnails and the Description is shown when images are zoomed. Add your image by dragging and dropping onto the form. Once this is done, the "Upload New Image" button is enabled.
