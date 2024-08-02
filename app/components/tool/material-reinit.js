// place this component at the end of an HBS where material design needs to be reinitialized as the section becomes visible
export default Ember.Component.extend({
  classNames: ['material-reinit'],
  didInsertElement() {
    $.material.init();
  }
});
