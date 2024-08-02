import BasePage from 'frontend/mixins/base-page';
import ResultBreakdown from 'frontend/mixins/result-breakdown';
import StatsDisplay from 'frontend/utils/stats-display';
import TaxTools from 'frontend/mixins/tax-tools';
import FilteredBreakdown from 'frontend/mixins/filtered-breakdown';

export default Ember.Component.extend(BasePage, TaxTools, ResultBreakdown, FilteredBreakdown, {
  willInsertElement() {
    this._super(...arguments);
    this.get('registry').loadScenarios(this.get('rank'), true, false);
  },
  scenarioResult: Ember.computed('scenario.id', 'scenarioResults.@each.updatedAt', function () {
    let scenarioId = this.get('scenario.id');

    let filtered = this.get('scenarioResults')
      .filter(function (result) {
        return result.get('isScenarioResult') && result.get('scenario.id') === scenarioId;
      });
    return filtered.get('firstObject');
  }),

  rank: Ember.computed.alias('pageIndex'),
  rankClass: Ember.computed('rank', function () {
    return 'rank' + this.get('rank');
  }),
  withUser: false,
  showCalculations: Ember.computed('scenario.calculations', 'scenario.global', function () {
    let calculations = this.get('scenario.calculations');
    return !this.get('scenario.global') && !Ember.isEmpty(calculations);
  }),
  calculationsData: Ember.computed('showCalculations', 'scenario.calculations.@each.value', 'currentTaxState', function () {
    this.get('currentTaxState'); // watch
    if (this.get('scenario.calculations')) {
      this.get('scenario.calculations').map((c) => c.get('value')); // watch?
      return this.adjustedCalculationsData(this.get('scenario.calculations'));
    } else {
      return [];
    }
  }),
  hasCriteriaSubsection: true,
  parentCount: null,
  statsDisplay: Ember.computed(
    'page.settings.option-distribution-chart-enabled',
    'page.settings.option-histogram-chart-enabled',
    'page.settings.option-metrics-enabled',
    'page.settings.option-details-enabled',
    'page.settings.option-comments-enabled',
    'page.settings.option-voter-count-enabled',
    'page.settings.primary-stat',
    'page.settings.option-category-sort-method',
    'page.settings.option-sort-method',
    'page.settings.option-categories-enabled',
    'page.settings.option-category-weighting-enabled',
    'page.settings.option-category-quadratic-enabled',
    'page.settings.option-categories-chart-enabled',
    'page.settings.criteria-chart-enabled',
    'page.settings.option-criteria-stats-enabled',
    'page.settings.criterion-stats-enabled',
    function () {
      let values = {
        showPeopleChart: this.get('page.settings.option-distribution-chart-enabled'),
        showHistogramChart: this.get('page.settings.option-histogram-chart-enabled'),
        showMetricChart: this.get('page.settings.option-metrics-enabled'),
        showOptionDetails: this.get('page.settings.option-details-enabled'),
        showOptionComments: this.get('page.settings.option-comments-enabled'),
        showOptionVoterCount: this.get('page.settings.option-voter-count-enabled'),
        primaryStat: this.get('page.settings.primary-stat'),
        optionCategorySortMethod: this.get('page.settings.option-category-sort-method'),
        optionSortMethod: this.get('page.settings.option-sort-method'),
        showOptionCategories: this.get('page.settings.option-categories-enabled'),
        showOptionCategoryWeighting: this.get('page.settings.option-category-weighting-enabled'),
        showOptionCategoryQuadratic: this.get('page.settings.option-category-quadratic-enabled'),
        showOptionCategoryChart: this.get('page.settings.option-categories-chart-enabled'),
        showCriteriaPieChart: this.get('page.settings.criteria-chart-enabled'),
        showOptionCriteriaStats: this.get('page.settings.option-criteria-stats-enabled'),
        showEtheloStat: this.get('page.settings.primary-stat') === 'ethelo',
        showVoterPercentStat: this.get('page.settings.primary-stat') === 'voter_percent',
        showSupportStat: this.get('page.settings.primary-stat') === 'support',
        showApprovalStat: this.get('page.settings.primary-stat') === 'approval',
        showDissonanceStat: this.get('page.settings.primary-stat') === 'dissonance',
        showOptionStats: true,
      };
      return StatsDisplay.create(values);
    }),


});
