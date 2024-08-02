import FilteredBreakdown from 'frontend/mixins/filtered-breakdown';
import Ember from "ember";

export default Ember.Component.extend(FilteredBreakdown, {
  totalVotesOnTopic: Ember.computed('optionCategory',
    'scenarioResults.@each.updatedAt',
    'optionCategoryBreakdown.@each.[]', function () {
    let optionCategoryId = this.get('optionCategory.optionCategory.id');
    let sortedOptions = this._sortResults(function (result) {
      return result.get('isOptionResult') && result.get('option.optionCategory.id') === optionCategoryId;
    }, this.get('primaryStat'), false, true);

    let total = sortedOptions.reduce((a, b) => a + parseInt(b.get('totalVotes')), 0);
    return total;
  }),
});
