BarChat
=======

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

To do
-----

Use browserify "directly" rather than using gulp-browserify. See http://viget.com/extend/gulp-browserify-starter-faq

Assigning Points to Issues
-----

We track and estimate our work using GitHub issues, according to the following points system:

* 1 - XS (1-2 hours)
* 2 - S (2-4 hours)
* 3 - M (4-8 hours)
* 5 - L (2-3 days)
* 8 - XL (5 days)

Anything larger than XL should be broken down into smaller tasks.