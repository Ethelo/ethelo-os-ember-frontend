import Registry from 'frontend/mixins/registry';

export default Ember.Mixin.create(Registry, {

  analytics: Ember.inject.service(),
  web3Service: Em.inject.service('web3'),
  errorList: {},
  processing: false,
  allowsSignup: Ember.computed.alias('authService.allowsSignup'),

  tokenGateError: Ember.computed(
    'processing',
    'errorList.token-gate', 'errorList.auth',
    'web3Service.tokenGateError',
    'user.web3Address',
    function() {
      if(this.get('processing')) {
        return false;
      }

      let errorKey = "";

      if(!Em.isEmpty(this.get('errorList.token-gate'))) {
        errorKey = this.get('errorList.token-gate');
      } else if(Em.isEmpty(this.get('errorList.auth'))) {
        errorKey = this.get('web3Service.tokenGateError');
      }

      if(Em.isEmpty(errorKey) || errorKey === false) {
        return false;
      }

      const i18n = this.get("i18n");
      let errorString = i18n.t(errorKey);

      if(this.get('user.web3Address') || this.get('session.userWeb3')) {
        return errorString + i18n.t('authentication.web3.token_gate.change_account');
      } else {
        return errorString;
      }

    }),
  failedInvite: Ember.computed(
    'processing',
    'authService.failedInvite',
    function() {
      if(this.get('processing')) {
        return false;
      }

      return this.get('authService.failedInvite');
    }),
  updateMaterial() {
    $.material.init();
  },
  addValidationResets() {
    this.$('input[name="email"]').on('keyup', () => {
      this._resetEmailValidation();
    });
    this.$('input[name="name"]').on('keyup', () => {
      this._resetNameValidation();
    });
    this.$('input[name="terms"]').on('change', () => {
      this._resetTermsValidation();
    });
    this.$('input[name="code"]').on('change', () => {
      this.set('invite', false);
    });
    this.$('input[name="password"]').on('keyup', () => {
      this._resetPasswordValidation();
    });

  },
  _resetEmailValidation() {
    this.set('errorList.email', null);
  },
  _resetNameValidation() {
    this.set('errorList.username', null);
  },
  _resetTermsValidation() {
    this.set('errorList.terms', null);
  },
  _resetPasswordValidation() {
    this.set('errorList.password', null);
  },
  _resetAuthValidation() {
    this.set('errorList.auth', null);
  },
  _resetValidation() {
    this._resetEmailValidation();
    this._resetNameValidation();
    this._resetTermsValidation();
    this._resetAuthValidation();
    this._resetPasswordValidation();
  },


});
