export default Ember.Component.extend({
  actions: {
    showCardBody() {
      this.toggleProperty("isShowingCardBody");
    }
  },
  showDetails:true
});
