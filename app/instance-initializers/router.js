export default {
  name: "router",

  initialize: function( instance ) {

    var router = instance.container.lookup('router:main');
    var options = instance.container.lookup('session:env');
    router.rootURL = options['root'];

  }
};
