import config from './config/environment';

let Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('loading', {});

  this.route('login', {}, function() {
    this.route('index', { path: '/' });
    this.route('wallet', { path: '/wallet' });
    this.route('password', {}, function() {
      this.route('reset', {});
      this.route('edit', {});
    });
    this.route('invite', { path: '/:code' });
  });

  this.route('unsubscribe_success', {});

  this.route('profile', function() {
    this.route('edit');
  });

  this.route('page', {path: 'page/:slug'});
  this.route('first');
  this.route('not-available');

  this.route('not-found', {path: '*:'});
});

export default Router;
