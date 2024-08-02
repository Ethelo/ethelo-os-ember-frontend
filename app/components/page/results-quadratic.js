import BasePage from 'frontend/mixins/base-page';
import ResultBreakdown from 'frontend/mixins/result-breakdown';
import StatsDisplay from 'frontend/utils/stats-display';
import DetailTools from 'frontend/mixins/detail-tools';
import FilteredBreakdown from 'frontend/mixins/filtered-breakdown';

export default Ember.Component.extend(BasePage, ResultBreakdown, DetailTools, FilteredBreakdown, {
  willInsertElement() {
    this._super(...arguments);
    this.get('registry').loadScenarios(1, true, false);
  },
  rank: 1,
  rankClass: Ember.computed('rank', function () {
    return 'rank' + this.get('rank');
  }),
  withUser: false,
  primaryStat: Ember.computed.alias("page.settings.primary-stat"),
  statsDisplay: Ember.computed(
    'page.settings.primary-stat',
    'page.settings.option-category-sort-method',
    function () {
      let values = {
        primaryStat: this.get('primaryStat'),
        optionCategorySortMethod: this.get('page.settings.option-category-sort-method'),
      };
      return StatsDisplay.create(values);
    }),

  groupResult: Ember.computed('scenario.id', 'scenarioResults.@each.updatedAt', function() {
    let scenarioId = this.get('scenario.id');

    let filtered = this.get('scenarioResults')
      .filter(function(result) {
        return result.get('isScenarioResult') && result.get('scenario.id') === scenarioId;
      });
    return filtered.get('firstObject');
  }),
  actions: {
    changePrimaryStat(value) {
      if(value === this.get('primaryStat')){
        this.set('reverseSort', !this.get('reverseSort'));
      } else {
        this.set('reverseSort', false);
      }
      this.set("primaryStat", value);
    }
  }
});
