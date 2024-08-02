import WeightingPieChart from 'frontend/components/results/weighting-pie-chart';
import FilteredBreakdown from 'frontend/mixins/filtered-breakdown';

export default WeightingPieChart.extend(FilteredBreakdown, {
  classNames: ['weighting-pie-chart'],
  title: '',
  result: null,
  criteriaResults: Ember.computed('scenarioResults.@each.updatedAt', function () {
    let results = this.get('scenarioResults');
    if (Ember.isEmpty(results)) {
      return [];
    } else {
      let criteriaResults = results.filter(function (result) {
        return result.get('isCriterionResult');
      });
      let optionId = criteriaResults.get('firstObject.option.id');
      return criteriaResults.filter(function (result) {
        return result.get('isCriterionResult') && result.get('option.id') === optionId;
      });
    }
  }),

  showChart: Ember.computed(
    'page.settings.criteria-chart-enabled',
    'criteriaResults.length',
    function () {
      return this.get('page.settings.criteria-chart-enabled') !== false && this.get('criteriaResults.length') > 1;
    }),

  chartData: Ember.computed('criteriaResults.@each.id', function () {
    let total = 0;
    let criteriaResults = this.get('criteriaResults').map(result => {
      return Ember.Object.create(result.get('criterion').toJSON(),{ averageWeight:result.get('averageWeight')});
    });
    let sortedCriteria=this.sortPageItems(criteriaResults, this);
    let list = sortedCriteria.map(result => {
      let weighting = result.get('averageWeight') * 100;
      total = total + weighting;
      return [result.get('title'), weighting];
    });

    let weightedList = list
      .map(function (slice) {
        let adjusted = Math.round(slice[1] / total * 100);
        return {
          name: slice[0],
          y: adjusted
        };
      });
    return weightedList;
  }),

});
