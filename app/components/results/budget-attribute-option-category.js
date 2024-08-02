import FilteredBreakdown from 'frontend/mixins/filtered-breakdown';

export default Ember.Component.extend(FilteredBreakdown, {
  routing: Ember.inject.service('-routing'),
  classNames: ['panel', 'panel-default'],
});
