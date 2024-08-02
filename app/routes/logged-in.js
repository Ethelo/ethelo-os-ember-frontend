import Registry from 'frontend/mixins/registry';

export default Ember.Route.extend(Registry, {
  analytics: Ember.inject.service(),
  web3Service: Em.inject.service('web3'),
  sendToAuthentication: Ember.computed(
    'authService.notJoined',
    'session.userId',
    'session.decisionUserId',
    'registry.decision.allowsGuests',
    'web3Service.userMustAddWeb3',
    function() {
      if(this.get('registry.decision.allowsGuests')) {
        return false;
      }

      if(this.get('authService.notLoggedIn')) {
        return true;
      }

      // captures for any reason including token gate failure
      if(this.get('authService.notJoined')) {
        return true;
      }

      if(this.get('web3Service.userMustAddWeb3')) {
        return true;
      }

      return false;
    }),
  beforeModel(transition) {
    this.saveTransition(transition);

    if(this.get('registry.decisionWithUserRSVP.isPending')) {
      return this.get('registry.decisionWithUserRSVP');
    } else {
      if(this.get('sendToAuthentication')) {
        this.transitionTo('login');
      }
    }
  },
  saveTransition(transition) {
    let authService = this.get('authService');
    authService.set('previousTransition', transition);

    if(transition.queryParams.prc) {
      authService.set('prc', transition.queryParams.prc);
    }

    if(transition.queryParams.rc) {
      authService.set('rc', transition.queryParams.rc);
    }
  },
  activate: function() {
    this._super();
    window.scrollTo(0, 0);
  }

});
