import WeightingPieChart from 'frontend/components/results/weighting-pie-chart';
import FilteredBreakdown from 'frontend/mixins/filtered-breakdown';

export default WeightingPieChart.extend(FilteredBreakdown, {
  classNames: ['weighting-pie-chart'],

  title: '',
  result: null,
  chartData: Ember.computed('optionCategoryBreakdown.@each.id', function () {
    let total = 0;
    let sortedCategoryList = this.get('optionCategoryBreakdown').filter(result => {
      let optionCategory = result.get('optionCategory');
      return optionCategory.get('weightingEnabled');
    });
    sortedCategoryList = sortedCategoryList
      .map(result => {
        let weighting = result.get('averageWeight') * 100;
        total = total + weighting;
        return [result.get('optionCategory.resultsLabel'), weighting];
      });

    let weightedList = sortedCategoryList
      .map(function (slice) {
        let adjusted = Math.round(slice[1] / total * 100);
        return {
          name: slice[0],
          y: adjusted
        };
      });
    return weightedList;
  }),
  showChart: Ember.computed(
    'page.settings.option-categories-chart-enabled',
    'optionCategoryBreakdown.length',
    function () {
      return this.get('page.settings.option-categories-chart-enabled') !== false &&
        this.get('registry.decision.optionCategories.length') > 1 &&
        this.get('optionCategoryBreakdown.length') > 0;
    }),
});
