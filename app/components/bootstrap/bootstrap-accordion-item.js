import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  // classNames: ['panel', 'panel-default', 'bootstrap-collapse', 'bootstrap-accordion'],

  actions: {
    toggleOpen(e) {
      $('.bootstrap-accordion').not($(e.target).parents('.bootstrap-accordion')).removeClass('open');
      setTimeout(() => {
        $(e.target).parents('.bootstrap-accordion').toggleClass('open');
        const panelCollapse = $(e.target).parents('.bootstrap-accordion').children('.panel-collapse');
        panelCollapse.removeAttr('style');
      }, 10);
    }
  }
});
