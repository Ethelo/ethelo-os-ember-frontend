import FilteredBreakdown from 'frontend/mixins/filtered-breakdown';

export default Ember.Component.extend(FilteredBreakdown, {
  hasCriteriaSubsection: false,
  didRender() {
    $('[data-toggle="tooltip"]').tooltip('destroy');

    setTimeout(function(){
      $('[data-toggle="tooltip"]').tooltip();
    },500);
  }
});
