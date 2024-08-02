import BasePage from 'frontend/mixins/base-page';
import ResultBreakdown from 'frontend/mixins/result-breakdown';
import StatsDisplay from 'frontend/utils/stats-display';
import TaxTools from 'frontend/mixins/tax-tools';
import DetailTools from 'frontend/mixins/detail-tools';

export default Ember.Component.extend(BasePage, TaxTools, ResultBreakdown, DetailTools, {
  willInsertElement() {
    this._super(...arguments);
    this.get('registry').loadScenarios(1, true, false);
  },
  rank: 1,
  rankClass: Ember.computed('rank', function () {
    return 'rank' + this.get('rank');
  }),
  withUser: false,
  showCalculations: Ember.computed('scenario.calculations', function () {
    let calculations = this.get('scenario.calculations');
    return !Ember.isEmpty(calculations);
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

  showOptionCategoryTitles: Ember.computed(
    'registry.decision.optionCategories.length', 'page.settings.option-categories-enabled',
    function () {
      return this.get('page.settings.option-categories-enabled') && this.get('registry.decision.optionCategories.length') > 1;
    }),

  selectedDetailID: Ember.computed.alias("page.settings.primary-detail-id"),
  allOptionDetails: Ember.computed(function () {
    return this.get('store').peekAll('option-detail');
  }),

  totalListValues: Ember.computed('scenario.calculations.[]', 'page.settings.total-calculations', function () {
    const optionDetailsList = this.get('allOptionDetails'),
      calculationList = this.get("calculationsData").toArray() || [],
      totalCalculationsListFromSettings = this.get('page.settings.total-calculations').toArray() || [];
    let detailCalculationValues = [];

    totalCalculationsListFromSettings.forEach(element => {
      const foundDetail = optionDetailsList.find(x => x.get("slug") === element["detail-slug"]);
      const foundCalculation = calculationList.find(x => x.slug === element["calculation-slug"]);
      if (foundDetail && foundCalculation) {
        const obj = {
          detailId: foundDetail.get("id"),
          detailName: foundCalculation.title,
          calculationValue: this.formatValue(foundCalculation)
        };
        detailCalculationValues.push(obj);
      }
    });
    return detailCalculationValues;
  }),

  defaultDetailAndCalculation: Ember.computed('selectedDetailID', 'totalListValues', function () {
    let primaryDetailID = this.get('selectedDetailID');
    let foundDetail = this.get("totalListValues").find(x => x.detailId === primaryDetailID);
    if (Em.isEmpty(foundDetail)) {
      foundDetail = this.get("totalListValues").find(x => !Em.isEmpty(x.detailId)); // ensure we always have a value
    }
    return foundDetail;
  }),

  statsDisplay: Ember.computed(
    'page.settings.scenario-stats-enabled',
    'page.settings.criterion-stats-enabled',
    'page.settings.option-stats-enabled',
    'page.settings.option-category-stats-enabled',
    'showOptionCategoryTitles',
    'page.settings.scenario-distribution-chart-enabled',
    'page.settings.scenario-histogram-chart-enabled',
    'page.settings.scenario-metrics-enabled',
    'page.settings.primary-stat',
    'page.settings.sort-method',
    'registry.decision.loadRankedScenarios',
    'page.settings.scenario-voter-count-enabled',
    function() {
      let values = {
        primaryStat: this.get('page.settings.primary-stat'),
        resultSort: this.get('page.settings.sort-method'),
        showScenarioStats: this.get('page.settings.scenario-stats-enabled') && this.get('registry.decision.loadRankedScenarios'),
        showPeopleChart: this.get('page.settings.scenario-distribution-chart-enabled'),
        showHistogramChart: this.get('page.settings.scenario-histogram-chart-enabled'),
        showMetricsChart: this.get('page.settings.scenario-metrics-enabled'),
        showOptionCategoryTitles: this.get('showOptionCategoryTitles'),
        showOptionCategoryStats: this.get('page.settings.option-category-stats-enabled'),
        showOptionStats: true,
        showCriterionStats: this.get('page.settings.criterion-stats-enabled'),
        showEtheloStat: this.get('page.settings.primary-stat') === 'ethelo',
        showVoterPercentStat: this.get('page.settings.primary-stat') === 'voter_percent',
        showSupportStat: this.get('page.settings.primary-stat') === 'support',
        showApprovalStat: this.get('page.settings.primary-stat') === 'approval',
        showDissonanceStat: this.get('page.settings.primary-stat') === 'dissonance',
        showTotalVotesStat: this.get('page.settings.scenario-voter-count-enabled'),
      };
      return StatsDisplay.create(values);
    }),
  actions: {
    selectedDetailIdChanged(value) {
      this.set("selectedDetailID", value);
    }
  }
});
