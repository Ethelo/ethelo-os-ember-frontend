/* jshint node: true */

module.exports = function(environment) {

  var ENV = {
    modulePrefix: 'frontend',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created

    },
    optionsConfig: {},
    exportApplicationGlobal: true,
  };

  ENV.contentSecurityPolicy = {
    'default-src': "* ",
    'script-src': "*",
    'frame-src': "* ",
    'font-src': "*",
    'connect-src': "*",
    'img-src': "*",
    'style-src': "'self connect.facebook.net ",
    'media-src': "*"
  };


    ENV.i18n = {
    defaultLocale: 'en'
  };

  if (environment === 'development') {
    ENV.APP.LOG_RESOLVER = false;
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_TRANSITIONS = false;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.RAISE_ON_DEPRECATION = false;
    ENV.APP.LOG_STACKTRACE_ON_DEPRECATION = false;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  return ENV;
};
