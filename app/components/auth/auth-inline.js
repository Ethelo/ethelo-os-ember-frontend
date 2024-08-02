import Ember from 'ember';
import Modals from "frontend/mixins/modals";

export default Ember.Component.extend(Modals, {
  authService: Em.inject.service('authentication'),
  web3Service: Em.inject.service('web3'),
  queryTab: 'register',
  activeTab: Ember.computed(
    'web3Service.userMustAddWeb3',
    'allowsSignup',
    'queryTab',
    function() {
      // insert decision closed here later

      if(this.get('web3Service.userMustAddWeb3')) {
        return 'add-web3';
      }

      if(this.get('queryTab') === 'login') {
        return 'login';
      }

      if(this.get('allowsSignup')) {
        return 'register';
      }

      return 'login';
    }),

  allowsSignup: Ember.computed.alias('authService.allowsSignup'),
  setAuthTab: function(tab) {
    this.set('queryTab', tab);
    this.adjustAuthModal();
  },
  actions: {
    setAuthTab(tab) {
      this.setAuthTab(tab);
    }
  }
});
