Upped
=====

Front end powered by [React](http://facebook.github.io/react/) & [Ratchet](http://goratchet.com/).

Dependencies
------------

[Node](http://nodejs.org/) must be installed.

`npm update` will install all npm dependencies (defined in `package.json`) into `/node_modules/`.

Building
--------

Build libraries include [gulp](http://gulpjs.com/), [browserify](http://browserify.org/) & [reactify](https://github.com/andreypopp/reactify). See `package.json` for more.

Build scaffolding based on [fforw/gulp-react](https://github.com/fforw/gulp-react).

Use `gulp` to just build, and `gulp watch` to enable streaming build.

See `gulpfile.js` for details.

PhoneGap
--------

Create new PhoneGap project:

```
cd ~/Sites/tradeya
mkdir cordova
cd cordova
git clone https://github.com/phonegap/phonegap-facebook-plugin.git
cordova create barchat com.tradeya.upped "Upped"
cd upped
cordova platform add ios
cordova -d plugin add ../phonegap-facebook-plugin --variable APP_ID="[...]" --variable APP_NAME="[...]"
cordova plugins add org.apache.cordova.inappbrowser
cordova plugin add org.apache.cordova.camera
cordova plugin add org.apache.cordova.statusbar
```

Add the following lines to `config.xml`:

```
<preference name="webviewbounce" value="false" />
<preference name="DisallowOverscroll" value="true" />
```

Use the following commands to "refresh" the PhoneGap project from your local copy of this repo:

```
rm -rf ~/Sites/tradeya/cordova/upped/www/*
cp -a ~/Sites/tradeya/upped/build/* ~/Sites/tradeya/cordova/upped/www
cd ~/Sites/tradeya/cordova/upped
cordova prepare
```

Open `platforms/ios/BarChat.xcodeproj` in Xcode, click the play button to "build and run".

Issues
-----

We track and estimate our work using GitHub issues, according to the following points system:

* 1 - XS (1-2 hours)
* 2 - S (2-4 hours)
* 3 - M (4-8 hours)
* 5 - L (2-3 days)
* 8 - XL (5 days)

Anything larger than XL should be broken down into smaller tasks.