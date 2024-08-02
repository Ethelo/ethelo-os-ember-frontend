import FullByOption from 'frontend/components/results/full-by-option';

export default FullByOption.extend({
  option: Ember.computed.alias('result.option'),
  displayCriteria: Ember.computed('criteriaEnabled', 'userCriterionBreakdown.length', function () {
    return this.get('criteriaEnabled') && this.get('statsDisplay.showCriterionStats') !== 'off' && this.get('userCriterionBreakdown.length') > 0;
  }),
  emptyFilter: []
});
