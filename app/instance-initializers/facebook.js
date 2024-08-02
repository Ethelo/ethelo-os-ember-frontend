
export function initialize(instance) {

  // Wait for Facebook to load before allowing the application
  // to fully boot. This prevents `ReferenceError: FB is not defined`
  var options = instance.container.lookup('session:env');

  var fbAsyncInit = function() {
    initFacebook(window.FB,options['FacebookAppId']);
  };

  Ember.run.scheduleOnce('actions',loadFacebookSDK);

  window.fbAsyncInit = fbAsyncInit;
}

function loadFacebookSDK() {
  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}

function initFacebook(FB,appId) {
  FB.init({
    appId: appId,
    status: true,
    cookie: true,
    xfbml: true,
    version: 'v2.12'
  });
}

export default {
  name: 'facebook',
   initialize: initialize
};


