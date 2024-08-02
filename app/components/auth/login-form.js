import Ember from 'ember';
import AuthForm from './auth-form';

export default Ember.Component.extend(AuthForm, {
  showPasswordForm: true,
  reInitializeMaterialLibrary: false,

  didInsertElement() {
    this._super(...arguments);
    this.updateMaterial();
    this.addValidationResets();

    /**
     * By default the 'showPasswordForm' will be always true.
     * We explicitly set it to false when we have metamask login enabled
     * to change the login form behaviour
     */
    if(this.get('web3Service.allowsWeb3') && !this.get('web3Service.metamaskMissing')) {
      this.set('showPasswordForm', false);
    }
  },
  didRender() {
    /**
     * This check is needed as the material checkbox is not loading
     * when the signin form is being displayed
     * Also 'reInitializeMaterialLibrary' needs to be set false,
     * to prevent the library from initializing multiple times
     * as didRender() hooks will be called always when a state changes
     */
    if(this.get('showPasswordForm') && this.get('reInitializeMaterialLibrary')) {
      this.updateMaterial();
      this.set('reInitializeMaterialLibrary', false);
    }
  },
  fieldsValid() {
    var errorList = this.get('errorList');
    return !(errorList.email != null || errorList.password != null);
  },

  actions: {
    setAuthTab(tab) {
      this.sendAction('setAuthTab', tab);
    },

    togglePasswordForm() {
      this.set('showPasswordForm', true);
      this.set('reInitializeMaterialLibrary', true);
    },

    signIn() {
      var authService = this.get('authService');
      this._resetValidation();
      authService.verifyPassword(this.get('password'), this);
      authService.verifyEmail(this.get('email'), this);
      if(this.fieldsValid()) {
        authService.loginWithPassword(this);
      }
    },
    web3Login() {
      var web3Service = this.get('web3Service');
      this._resetValidation();
      if(this.fieldsValid()) {
        web3Service.metaMaskLogin(this);
      }
    },

  }
});
