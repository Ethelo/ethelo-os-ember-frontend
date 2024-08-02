import FilteredBreakdown from 'frontend/mixins/filtered-breakdown';

export default Ember.Component.extend(FilteredBreakdown, {
  hasCriteriaSubsection: false,
  showDetails: true,
  actions: {
    showCardBody() {
      this.toggleProperty("isShowingCardBody");
    }
  },
});
