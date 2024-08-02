export default Ember.Component.extend({
  authService: Em.inject.service('authentication'),
  errorList: {},
  userName: "",
  password: '',
  confirmation: '',
  currentPassword: '',
  processing: false,

  hasError: Ember.computed('errorList.username', 'errorList.email', 'errorList.password', 'errorList.confirmation', 'errorList.currentPassword', function() {
    return this.get('errorList.username') ||
      this.get('errorList.email') ||
      this.get('errorList.password')  ||
      this.get('errorList.confirmation') ||
      this.get('errorList.currentPassword');
  }),

  willInsertElement() {
    this.set("userName", this.get("user.name"));
  },

  didInsertElement() {
    this._super(...arguments);
    const that=this;
    this.$("#userName").on('input',(e)=>{
      that.set("userName", e.target.value);
    })
    this.$(".editProfile").on("keyup", (e) => {
      that.set("errorList", {});
      that.set("message", "");
    });
  },

  completed(){
    this.set('message', 'authentication.update_profile.complete');
    this.set('password', '');
    this.set('confirmation', '');
    this.set('currentPassword', '');
    this.set('errorList', {});
  },

  actions: {
    updateUserInfo() {
      let authService = this.get('authService');
      let password  = this.get('password');
      let confirmation = this.get('confirmation');
      let currentPassword = this.get('currentPassword');

      authService.verifyUsername(this.get('userName'), this);
      authService.verifyEmail(this.get('user.email'), this);
      authService.verifyConfirmedPassword(password, confirmation, this, false);


      if (!this.get('hasError')) {
        authService.updateProfile(currentPassword, password, confirmation, this, this.completed.bind(this));
      }
    },
    deleteUserAccount() {
      let authService = this.get('authService');
      authService.deleteUserAccount();
    }
  }
});
