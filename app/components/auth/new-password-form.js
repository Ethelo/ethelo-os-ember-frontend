export default Ember.Component.extend({
  menu: Ember.inject.service(),
  authService: Ember.inject.service('authentication'),
  errorList: {},
  password: '',
  confirmation: '',
  token: '',
  didInsertElement() {
    this._super(...arguments);
    this.$('input[name="confirmation"]').on('keyup', () => {
      this._resetConfirmationValidation();
    });
    this.$('input[name="password"]').on('keyup', () => {
      this._resetPasswordValidation();
    });
  },
  fieldsValid() {
    let errorList = this.get('errorList');
    return !(errorList.confirmation != null || errorList.password != null);
  },
  _resetConfirmationValidation() {
    this.set('errorList.confirmation', null);
  },
  _resetPasswordValidation() {
    this.set('errorList.password', null);
  },
  _resetAuthValidation() {
    this.set('errorList.auth', null);
  },

  actions: {
    resetPassword() {
      let authService = this.get('authService');
      this._resetAuthValidation();
      authService.verifyConfirmedPassword(this.get('password'), this.get('confirmation'), this);
      if (this.fieldsValid()) {
        authService.resetPassword(this.get('token'), this.get('password'), this.get('confirmation'), this);
      }
    },
  }
});
