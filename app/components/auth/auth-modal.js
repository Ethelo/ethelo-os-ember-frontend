import AuthInline from './auth-inline';
export default AuthInline.extend({
  actions: {
    closeModal: function() {
      this.destroy();
    },
  },

  willDestroyElement() {
    this.closeAuthModal();
  }
});
