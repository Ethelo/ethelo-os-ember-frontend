import Registry from 'frontend/mixins/registry';
import optionCategoryWeightInfluent from 'frontend/mixins/option-category-weight-influent';
import Modals from "frontend/mixins/modals";

export default Ember.Component.extend(optionCategoryWeightInfluent, Modals, Registry, {
  theme: Ember.computed.alias('registry.decision.theme'),
  sliderScope: Ember.computed('typeKey', function() {
    return 'voting.weighting.sliders.option_category';
  }),
  chartOptions: Ember.computed('registry.decision.theme.chartColors.[]', function() {
    let series = this.get('chartData');
    let seriesCount = series.length;
    return {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 255
      },
      width: '100%',
      colors: this.get('theme').chartColorList(seriesCount),
      credits: { enabled: false },
      title: { text: null },
      tooltip: { valueSuffix: '%' },
      legend: {
        enabled: seriesCount > 1,
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        width: '40%',
        fontSize: '14',
        itemMarginBottom: 6,
      },
      plotOptions: {
        pie: {
          size: '110%',
          startAngle: -30,
          dataLabels: {
            enabled: true,
            format: '{point.y}%',
            distance: -30,
          }
        },
        series: {
          animation: false,
          dataLabels: { enabled: false },
        }
      },
      series: [{ name: 'Total', data: series, id: 'ocw' }],
    };
  }),
  allOptionCategories: Ember.computed(function() {
    return this.get('store').peekAll('option-category');
  }),
  optionCategories: Ember.computed('allOptionCategories.[]', 'excludedItems.[]', 'panelId', function() {
    this.get('panelId'); // watchin case array watches don't trigger
    let excluded = this.get('excludedItems');
    return this.get('allOptionCategories').filter(function(optionCategory) {
      return optionCategory.get('options.length') > 0 &&
        optionCategory.get('weightingEnabled') &&
        ! excluded.contains(optionCategory.get('id').toString());
    });
  }),
  sortedOptionCategories: Ember.computed('optionCategories.@each.id', 'finalItemOrder.[]', 'panelId', function() {
    this.get('panelId'); // watchin case array watches don't trigger
    let optionCategories = this.get('optionCategories').toArray();
    let order = this.get('finalItemOrder');

    let orderIndex = function(item){
      return order.indexOf(parseInt(item.get('id')));
    };

    return optionCategories.sort(function(a, b) {
      return orderIndex(a) > orderIndex(b) ? 1 : -1;
    });
  }),
  chartId: Ember.computed('panelId', function() {
    return `ocwsl-${this.get('panelId')}`;
  }),
  chartData: Ember.computed('sortedOptionCategories.@each.id', 'currentUserOptionCategoryWeights.@each.weighting', 'panelId', function() {
    this.get('panelId'); // watchin case array watches don't trigger
    let optionCategories = this.get('sortedOptionCategories');

    let currentWeightHash = this.get('currentUserOptionCategoryWeights').reduce(function(acc, ocw) {
      acc[ocw.get('optionCategory.id')] = ocw.get('weighting');
      return acc;
    }, {});

    let total = 0;

    let list = optionCategories.map(function(optionCategory) {
      let weighting = currentWeightHash.hasOwnProperty(optionCategory.id) ? currentWeightHash[optionCategory.id] : optionCategory.get('weighting');
      total = total + weighting;
      return [optionCategory.get('title'), weighting];
    });

    let weightedList = list.map(function(slice) {
      let adjusted = Math.round(slice[1] / total * 100);
      return {name: slice[0], y: adjusted};
    });

    return weightedList;
  }),
  participantVotedOnAllOptionCategories: Ember.computed('currentUserOptionCategoryWeights', 'optionCategories', function() {
    return this.get('currentUserOptionCategoryWeights').length < this.get('optionCategories').length ? false : true;
  }),
});
