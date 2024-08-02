import config from '../config/environment';

export function initialize (container, application) {
  application.deferReadiness();

  function registerSession (data) {
    data['root'] = config.options['root'];

    application.register('session:env', data, {instantiate: false, singleton: true});
    application.inject('adapter', 'session', 'session:env');
    application.inject('route', 'session', 'session:env');
    application.inject('controller', 'session', 'session:env');
    application.inject('service', 'session', 'session:env');
    application.advanceReadiness();
  }

  Ember.$.ajaxSetup({
    headers: {
      'X-CSRF-Token': Ember.$('meta[name="csrf-token"]').attr('content')
    }
  });

  var a = $('<a>', {href: config.options['url']})[0];
  var decisionId = config.options['decision'];
  var etheloServer = a.protocol + '//' + a.host;
  var adminUrl = config.options['admin'];

  if (!decisionId) {
    var data = {};
    data['EtheloServer'] = etheloServer;
    data['adminUrl'] = adminUrl;
    data['preview'] = config.options['preview'] === "1";
    registerSession(data);
    return;
  }

  var rc = urlQuery('rc') || '';

  var settings = [];
  settings.crossDomain = true;
  settings.xhrFields = {withCredentials: true};
  settings.dataType = 'json';
  settings.url = etheloServer + '/api/v2/environment.json?subdomain=' + decisionId + "&rc=" + rc;

  new Fingerprint2().get(function(result, components) {
    settings.url += '&f=' + encodeURI(result);
    return Ember.$.ajax(settings).then(function(data) {
      // TODO: possibly pull csrf token for standalone mode
      data['EtheloServer'] = etheloServer;
      data['adminUrl'] = adminUrl;
      data['f'] = result;
      data['preview'] = config.options['preview'] === "1";
      registerSession(data);
    });
  });
}

function urlQuery (query) {
  query = query.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var expr = "[\\?&]" + query + "=([^&#]*)";
  var regex = new RegExp(expr);
  var results = regex.exec(window.location.href);
  if (results !== null) {
    return results[1];
  } else {
    return false;
  }
}

export default {
  after: 'options',
  name: 'session',
  initialize: initialize,
  before: 'ember-data'

};
