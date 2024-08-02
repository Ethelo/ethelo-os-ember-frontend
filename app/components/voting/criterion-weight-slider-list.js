import Registry from 'frontend/mixins/registry';
import criterionWeightInfluent from 'frontend/mixins/criterion-weight-influent';
import Modals from "frontend/mixins/modals";

export default Ember.Component.extend(criterionWeightInfluent,Modals, Registry, {
  sliderScope: Ember.computed('typeKey', function() {
    return 'voting.weighting.sliders.criterion';
  }),
  theme: Ember.computed.alias('registry.decision.theme'),
  chartOptions: Ember.computed('registry.decision.theme.chartColors.[]', function() {
    let series = this.get('chartData');
    let seriesCount = series.length;
    return {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 255,
      },
      width: '100%',
      colors: this.get('theme').chartColorList(series.length),
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
            format: '{point.y}%',
            distance: -30,
          }
        },
        series: {
          animation: false,
        }
      },
      series: [{ name: 'Total', data: series , id: 'cw'}],
    };
  }),
  allCriteria: Ember.computed(function() {
    return this.get('store').peekAll('criterion');
  }),
  filteredCriteria: Ember.computed('allCriteria.[]', 'excludedItems', 'panelId', function(){
    this.get('panelId'); // watchin case array watches don't trigger
    let excluded = this.get('excludedItems');
    return this.get('allCriteria').filter(function(criterion) {
      return criterion.get('weightingEnabled') &&
        !excluded.contains(criterion.get('id').toString());
    });
  }),
  sortedCriteria: Ember.computed('filteredCriteria.@each.id', 'finalItemOrder.[]', 'panelId', function() {
    this.get('panelId'); // watch in case array watches fail
    let criteria = this.get('filteredCriteria').toArray();
    let order = this.get('finalItemOrder');


    let orderIndex = function(item) {
      return order.indexOf(parseInt(item.get('id')));
    };

    return criteria.sort(function(a, b) {
      return orderIndex(a) > orderIndex(b) ? 1 : -1;
    });
  }),
  chartId: Ember.computed('panelId', function() {
    return `cwsl-${this.get('panelId')}`;
  }),
  chartData: Ember.computed('sortedCriteria.[]', 'currentUserCriterionWeights.@each.weighting', function() {
    let criteria = this.get('sortedCriteria');

    let currentWeightHash = this.get('currentUserCriterionWeights').reduce(function(acc, ocw) {
      acc[ocw.get('criterion.id')] = ocw.get('weighting');
      return acc;
    }, {});

    let total = 0;

    let list = criteria.map(function(criterion) {
      let weighting = currentWeightHash.hasOwnProperty(criterion.id) ? currentWeightHash[criterion.id] : criterion.get('weighting');
      total = total + weighting;
      return [criterion.get('title'), weighting];
    });

    let weightedList = list.map(function(slice) {
      let adjusted = Math.round(slice[1] / total * 100);
      return { name: slice[0], y: adjusted };
    });
    return weightedList;
  }),

});
