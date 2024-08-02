import FilteredBreakdown from 'frontend/mixins/filtered-breakdown';

export default Ember.Component.extend(FilteredBreakdown, {
  hasCriteriaSubsection: true,
  parentCount: null
});
