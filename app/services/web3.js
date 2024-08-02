import Registry from 'frontend/mixins/registry';
import Modals from "frontend/mixins/modals";

export default Ember.Service.extend(Registry, Modals, {
  isServiceFactory: true, // should not be needed?
  store: Ember.inject.service(),
  routing: Ember.inject.service(),
  i18n: Ember.inject.service(),
  menu: Ember.inject.service(),
  analytics: Ember.inject.service(),
  init() {
    this._super(...arguments);
    this.updateMetamaskStatus();
  },
  publicAddress: null,
  inviteCode: null,
  hasTokenGates: Ember.computed.and('forceWeb3', 'registry.decision.web3Gates'),
  allowsWeb3: Ember.computed.not('noWeb3'),
  noWeb3: Ember.computed.equal('registry.decision.web3Mode', 'none'),
  forceWeb3: Ember.computed.equal('registry.decision.web3Mode', 'force'),
  allowsPasswordParticipation: Ember.computed.not('forceWeb3'),
  userMustAddWeb3: Ember.computed(
    'allowsPasswordParticipation', 'registry.user.web3Address',
    'authService.notLoggedIn', 'authService.notJoined', 'session.userWeb3',
    function() {
      if(this.get('allowsPasswordParticipation')) {
        return false;
      }

      if(this.get('authService.notJoined') && !this.get('session.userWeb3')) {
        return true;
      }

      // don't check if there isn't a user
      if(this.get('authService.notLoggedIn')) {
        return false;
      }

      return Em.isEmpty(this.get('registry.user.web3Address'));
    }),
  failedTokenGate: Ember.computed(
    'hasTokenGates',
    'decision.requiresInvite',
    'authService.notJoined',
    'registry.user.web3Address',
    'registry.decisionUser.failedGates',
    'session.userWeb3',
    function() {
      if(!this.get('hasTokenGates')) {
        return false;
      }

      if(this.get('decision.requiresInvite')) {
        return false;
      }

      // if we have a web3 Ethelo user and a token gate
      // and the user didn't get automatically joined,
      // they silently failed a token gate
      if(this.get('authService.notJoined') && this.get('session.userWeb3')) {
        return true;
      }

      // we have to add web3 before we can check
      if(Em.isEmpty(this.get('registry.user.web3Address'))) {
        return false;
      }

      if(this.get('registry.decisionUser.failedGates')) {
        return true;
      }

      return false;

    }),
  tokenGateError: Ember.computed('failedTokenGate', function() {
    if(this.get('failedTokenGate')) {
      return 'authentication.web3.token_gate.failure_error';
    }
    return false;
  }),
  web3Data: {signature: null, publicAddress: null, nonce: null, message: null, error: null},
  resetService() {
    this.updateMetamaskStatus();
    this.set('inviteCode', null);
    this.set('web3Data', {signature: null, publicAddress: null, nonce: null, message: null, error: null});
  },
  metamaskMissing: true,
  showMetamaskMissing: Ember.computed.and('metamaskMissing', 'allowsWeb3'),
  updateMetamaskStatus: function() {
    this.set('metamaskMissing', !(window.ethereum && window.ethereum.isMetaMask));
  },
  // opens metamask for approval
  requestAccountList: function(data, component) {
    component.set('processing', true);

    let that = this;
    let promise = window.ethereum
      .request({method: 'eth_requestAccounts'})
      .catch((err) => {
        that.metaMaskErrors(err, data, component);
      });
    return promise;
  },
  metaMaskErrors(error, data, component) {
    let errors = {};
    if(error.code === 4001 || error === 'METAMASK') {
      // EIP-1193 userRejectedRequest error
      // If this happens, the user rejected the connection request.
      errors = {web3: 'errors.auth.rejected'};
    } else {
      console.log(error);
    }
    component.set('errorList', errors);
    component.set('processing', false);
    data.errors = error;
    return data;
  },
  personalSign(data, component) {
    let that = this;
    component.set('processing', true);

    const signature = window.ethereum
      .request({method: 'personal_sign', params: [data.message, data.publicAddress]})
      .catch((err) => {
        that.metaMaskErrors(err, data, component);
      });
    return signature;
  },

  fetchNonce(data, component) {

    let post = {user: {public_address: data.publicAddress}};
    let request = this.ajaxRequest(component, 'user/web3/nonce', post);
    return request;
  },
  loginWithSignature(data, component) {
    component.set('processing', true);

    let post = {user: {public_address: data.publicAddress, signature: data.signature, message: data.message}};
    let request = this.ajaxRequest(component, 'user/web3/login', post);
    let authService = this.get('authService');
    request.done((result) => {
      authService.updateUser(result);
    });
    request.done(() => {
      authService.trackJoin();
      this.closeAuthModal();
      authService.sendToPreviousTransition();
    });
    return request;
  },

  metaMaskLogin(component) {
    let that = this;
    if(this.get('metamaskMissing')) {
      return;
    }
    let data = this.get('web3Data');
    let _getAccountList = this.requestAccountList(data, component);

    let _getNonce = _getAccountList.then(function(accounts) {
      if(accounts.length === 0) {
        data = that.metaMaskErrors('METAMASK', data, component);
        return data;
      } else {
        data.publicAddress = accounts[0];
        return that.fetchNonce(data, component);
      }
    });

    let _signMessage = _getNonce.then(function(result) {
      component.set('processing', true);
      const requestTime = new Date().getTime();
      data.message = 'Ethelo Login,' + requestTime + "," + result.nonce;
      return that.personalSign(data, component);
    });

    let _login = _signMessage.then(function(signature) {
      data.signature = signature;
      return that.loginWithSignature(data, component);
    });

    return _login;

  },
  metaMaskInviteJoin(component) {
    this.metaMaskJoin(component, 'user/web3/accept_invite');
  },

  metaMaskJoin(component, url = 'user/web3/join') {
    let that = this;
    if(this.get('metamaskMissing')) {
      return;
    }
    let data = this.get('web3Data');
    let _getAccountList = this.requestAccountList(data, component);

    let _getNonce = _getAccountList.then(function(accounts) {
      if(accounts.length === 0) {
        data = that.metaMaskErrors('METAMASK', data, component);
        return data;
      } else {
        data.publicAddress = accounts[0];
        return that.fetchNonce(data, component);
      }
    });

    let _signMessage = _getNonce.then(function(result) {
      component.set('processing', true);
      const requestTime = new Date().getTime();
      data.message = 'Ethelo Sign Up,' + requestTime + "," + result.nonce;
      return that.personalSign(data, component);
    });

    let signup = _signMessage.then(function(signature) {
      data.signature = signature;
      return that.joinWithSignature(data, component, url);
    });


    return signup;

  },
  joinWithSignature(data, component, url = 'user/web3/join') {
    let authService = this.get('authService');
    let post = {
      user: {
        email: authService.get('email'),
        name: authService.get('username'),
        terms: authService.get('agreeTerms'),
        ethelo_notifications: authService.get('etheloMail'),
        public_address: data.publicAddress,
        signature: data.signature,
        message: data.message
      },
    };
    if(!Em.isEmpty(this.get('inviteCode'))) { // not gettable
      post.user.code = this.get('inviteCode');
    }

    let request = this.ajaxRequest(component, url, post);
    request.done((result) => {
      authService.updateUser(result);
    });
    request.done(() => {
      authService.trackJoin();
      this.closeAuthModal();
      authService.sendToPreviousTransition();
    });
    return request;
  },

  upgradeWithSignature(data, component) {
    let authService = this.get('authService');
    let post = {
      user: {
        email: authService.get('email'),
        name: authService.get('username'),
        terms: authService.get('agreeTerms'),
        ethelo_notifications: authService.get('etheloMail'),
        public_address: data.publicAddress,
        signature: data.signature,
        message: data.message
      },
    };

    let request = this.ajaxRequest(component, 'user/web3/add', post);
    request.done((result) => {
      authService.updateUser(result);
    });
    request.done(() => {
      authService.trackJoin();
      this.closeAuthModal();
      authService.sendToPreviousTransition();
    });
    return request;
  },
  metaMaskUpgrade(component) {
    let that = this;
    let mode = this.get('authService.notLoggedIn') ? 'Sign Up' : 'Add Web3';
    if(this.get('metamaskMissing')) {
      return;
    }
    let data = this.get('web3Data');
    let _getAccountList = this.requestAccountList(data, component);

    let _getNonce = _getAccountList.then(function(accounts) {
      if(accounts.length === 0) {
        data = that.metaMaskErrors('METAMASK', data, component);
        return data;
      } else {
        data.publicAddress = accounts[0];
        return that.fetchNonce(data, component);
      }
    });

    let _signMessage = _getNonce.then(function(result) {
      component.set('processing', true);
      const requestTime = new Date().getTime();
      data.message = 'Ethelo ' + mode + "," + requestTime + "," + result.nonce;
      return that.personalSign(data, component);
    });

    let signup = _signMessage.then(function(signature) {
      data.signature = signature;
      return that.upgradeWithSignature(data, component);
    });

    return signup;
  },
  metaMaskSignData(signingData, component) {
    let that = this;
    if(this.get('metamaskMissing')) {
      return;
    }
    let data = this.get('web3Data');
    let _getAccountList = this.requestAccountList(data, component);

    let _getNonce = _getAccountList.then(function(accounts) {
      if(accounts.length === 0) {
        data = that.metaMaskErrors('METAMASK', data, component);
        return data;
      } else {
        data.publicAddress = accounts[0];
        return that.fetchNonce(data, component);
      }
    });

    let _signMessage = _getNonce.then(function(result) {
      component.set('processing', true);
      const requestTime = new Date().getTime();
      data.message = 'Ethelo Signing Package,' + signingData + ',' + requestTime + "," + result.nonce;
      data.signingData = signingData;
      return that.personalSign(data, component);
    });

    let _signData = _signMessage.then(function(signature) {
      data.signature = signature;
      return that.signDataWithSignature(data, component);
    });

    return _signData;

  },

  signDataWithSignature(data, component) {
    let authService = this.get('authService');
    let menu = this.get('menu');
    let post = {
      user: {
        public_address: data.publicAddress,
        signature: data.signature,
        message: data.message,
        signing_package: data.signingData,
      },
    };
    let request = this.ajaxRequest(component, 'user/web3/sign_package', post);
    request.done(() => {
      this.get('registry').loadSigningPackage();
    });
    return request;
  },

  apiUrl(path) {
    return this.get('session.EtheloServer') + '/api/v2/' + path + '.json';
  },
  ajaxRequest(component, path, data) {
    let url = this.apiUrl(path);
    component.set('processing', true);
    component.set('errorList', {});
    data['decision_id'] = this.get('session.decisionId');
    data['f'] = this.get('session.f');
    data['error_locale'] = 'ember';

    if(data.user) {
      data.user.remember_me = this.get('rememberMe') ? 1 : 0;
    }
    let request = $.ajax({
      url: url,
      context: this,
      type: 'POST',
      dataType: 'json',
      data: data,
      crossDomain: true,
      xhrFields: {withCredentials: true}
    });

    request.fail((xhr, textStatus, error) => {
      //jshint unused:false
      let errors = {};
      if(xhr.status === 401) { // unauthorized
        errors = {auth: 'errors.auth.invalid_metamask'};
      } else {

        let response = xhr.responseJSON;
        if(Ember.isNone(response)) {
          errors = {auth: 'errors.auth.unexpected_error'};
        } else {
          errors = this.handleJsonApiErrors(xhr.responseJSON);
        }
      }
      component.set('errorList', errors);
      console.log(component.get('errorList'));

    });

    request.always(function() {
      component.set('processing', false);
    });

    return request;
  },
  handleJsonApiErrors(error) {
    let errors = error.errors;
    let fields = errors.reduce(function(memo, error) {
      let paths = error.source.pointer.split('/');
      let attr = paths[paths.length - 1];
      memo[attr] = error.detail;
      return memo;
    }, {});
    return fields;
  },
  sendToWalletInvite() {
    this.get('routing').transitionTo('login.wallet');
  },

});
