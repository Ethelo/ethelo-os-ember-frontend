/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var Funnel = require('broccoli-funnel');
var Concat = require('broccoli-concat');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    fingerprint: {
      enabled: false
    },
    outputPaths: {
      app: {
        css: {
          'app': '/frontend.css'
        },
        js: '/frontend.js'
      },
      vendor: {
        css: '/vendor.css',
        js: '/vendor.js'
      }
    },
    lessOptions: {
      paths: [
        'bower_components/bootstrap/less',
        'bower_components/bootstrap-material-design/less',
        'app/styles/less'
      ],
    },
    storeConfigInMeta: false
    // Add options here
  });



// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

  app.import('vendor/js/highcharts.js');
  app.import('vendor/js/highcharts-more.js');
  app.import('vendor/js/highcharts-no-data.js');
  app.import('vendor/css/highcharts.css');
  app.import('vendor/css/highcharts-popup.css');

  app.import('vendor/js/fontfaceobserver.standalone.js');
  app.import('vendor/js/fingerprint2.js');
  app.import('vendor/js/inflection.js');
  app.import('vendor/js/respond.js');
  app.import('vendor/js/es2015-polyfill.js', {prepend: true});

  app.import('bower_components/bootstrap/dist/js/bootstrap.min.js');

  app.import('bower_components/autosize/dist/autosize.js');

  app.import('bower_components/moment/min/moment.min.js');
  app.import('bower_components/numeral/min/numeral.min.js');
  app.import('bower_components/seedrandom/seedrandom.js');

  app.import('bower_components/bootstrap-switch/dist/js/bootstrap-switch.js');
  app.import('bower_components/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css');

  app.import('bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.js');
  app.import('bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css');

  app.import('bower_components/bootstrap-material-design/dist/js/material.min.js');
  app.import('bower_components/bootstrap-material-design/dist/js/ripples.min.js');
  app.import('bower_components/bootstrap-material-design/dist/css/ripples.min.css')

  app.import('bower_components/material-design-icons/iconfont/material-icons.css');

  var bootstrapFonts = new Funnel('bower_components/bootstrap/dist/fonts', {
    include: ['*'],
    destDir: '/fonts',
  });

  var materialIconFonts = new Funnel('bower_components/material-design-icons/iconfont', {
    include: ['*.eot', '*.woff', '*.ttf', '*.woff2', '*.svg'],
  });

  return app.toTree([bootstrapFonts, materialIconFonts]);
};
