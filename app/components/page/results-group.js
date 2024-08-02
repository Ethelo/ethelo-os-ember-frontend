import BasePage from 'frontend/mixins/base-page';
import ResultBreakdown from 'frontend/mixins/result-breakdown';
import StatsDisplay from 'frontend/utils/stats-display';
import TaxTools from 'frontend/mixins/tax-tools';

export default Ember.Component.extend(BasePage,TaxTools, ResultBreakdown, {
  willInsertElement() {
    this._super(...arguments);
    this.get('registry').loadScenarios(this.get('rank'), true, false);
  },
  rank: Ember.computed.alias('pageIndex'),
  rankClass: Ember.computed('rank', function(){
    return 'rank' + this.get('rank');
  }),
  withUser: false,
  showCalculations: Ember.computed('scenario.calculations', 'scenario.global', function(){
    let calculations = this.get('scenario.calculations');
    return !this.get('scenario.global') && !Ember.isEmpty(calculations);
  }),
  calculationsData: Ember.computed('showCalculations', 'scenario.calculations.@each.value', 'currentTaxState', function() {
    this.get('currentTaxState'); // watch
    if (this.get('scenario.calculations')) {
      this.get('scenario.calculations').map((c) => c.get('value')); // watch?
      return this.adjustedCalculationsData(this.get('scenario.calculations'));
    } else {
      return [];
    }
  }),
  showOptionCategoryTitles: Ember.computed(
    'page.settings.option-category-stats-enabled',
    'registry.decision.optionCategories.length', function(){
      return this.get('page.settings.option-category-stats-enabled') &&
        this.get('registry.decision.optionCategories.length') > 1;
    }),
  statsDisplay: Ember.computed(
    'page.settings.scenario-stats-enabled',
    'page.settings.criterion-stats-enabled',
    'page.settings.option-stats-enabled',
    'page.settings.option-category-stats-enabled',
    'page.settings.support-distribution-enabled',
    'page.settings.support-histogram-enabled',
    'page.settings.primary-stat',
    'page.settings.sort-method',
    'registry.decision.loadRankedScenarios',
    function(){
    let values = {
      primaryStat: this.get('page.settings.primary-stat'),
      resultSort: this.get('page.settings.sort-method'),
      showScenarioStats: this.get('page.settings.scenario-stats-enabled') && this.get('registry.decision.loadRankedScenarios'),
      showPeopleChart: this.get('page.settings.support-distribution-enabled'),
      showHistogramChart: this.get('page.settings.support-histogram-enabled'),
      showOptionCategoryTitles: this.get('showOptionCategoryTitles'),
      showOptionCategoryStats: this.get('page.settings.option-category-stats-enabled'),
      showOptionStats: this.get('page.settings.option-stats-enabled'),
      showCriterionStats: this.get('page.settings.criterion-stats-enabled'),
      showEtheloStat: this.get('page.settings.primary-stat') === 'ethelo',
      showVoterPercentStat: this.get('page.settings.primary-stat') === 'voter_percent',
      showSupportStat: this.get('page.settings.primary-stat') === 'support',
      showApprovalStat: this.get('page.settings.primary-stat') === 'approval',
      showDissonanceStat: this.get('page.settings.primary-stat') === 'dissonance',
      showTotalVotesStat: false,
    };

    return StatsDisplay.create(values);
  }),


});
