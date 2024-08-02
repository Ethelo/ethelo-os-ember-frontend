export default Ember.Component.extend({
  menu: Ember.inject.service(),
  authService: Ember.inject.service('authentication'),
  email: '',
  errorList: {},
  didInsertElement() {
    this._super(...arguments);
    this.$('input[name="email"]').on('keyup', () => {
      this._resetEmailValidation();
    });
  },
  fieldsValid() {
    let errorList = this.get('errorList');
    return errorList.email == null;
  },
  _resetEmailValidation() {
    this.set('errorList.email', null);
  },
  _resetAuthValidation() {
    this.set('errorList.auth', null);
  },
  actions: {
    requestPassword() {
      let authService = this.get('authService');
      this._resetAuthValidation();
      authService.verifyEmail(this.get('email'), this);
      if (this.fieldsValid()) {
        authService.requestPasswordReset(this.get('email').toLowerCase(), this);
      }
    },
  }
});
