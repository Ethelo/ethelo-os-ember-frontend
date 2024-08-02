import InfluentTools from 'frontend/mixins/influent-tools';
import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, InfluentTools, {
  classNames: ['histogram-bar-chart'],
  histogram: Ember.computed.alias('result.histogram'),
  hasMultipleCriteria: Ember.computed('registry.decision.criteria.length', 'result.isOptionResult', function(){
    return this.get('result.isOptionResult') && this.get('registry.decision.criteria.length') > 1;
  }),
  maxValue: Ember.computed('showChart', 'histogram', function () {
    if (this.get('showChart')) {
      let hist = this.get('histogram');
      return Math.max(...hist) + 1;
    } else {
      return 1;
    }
  }),

  showChart: Ember.computed('histogram', function () {
    return !Ember.isEmpty(this.get('histogram'));
  }),

  chartId: Ember.computed("result.id", function () {
    return `hbc-${this.get('result.id')}`;
  }),

  chartData: Ember.computed('histogram', function () {
    let histogram = this.get('histogram');
    let i18n = this.get('i18n');
    let self = this;
    let data = histogram
      .map(function (number, index) {
        let bin = index + 1;
        let binName = self.binNameFor(bin);
        if (Ember.isEmpty(binName)) {
          return null;
        }
        let binCaption = i18n.t(self.captionKeyForBin(bin, 'support')).toHTML();
        return [binCaption, number, `color: #516BA6`];
      })
      .filter(function (item) {
        return !Ember.isEmpty(item);
      });

    let formattedData = [{
      name: i18n.t('results.participant.number').toHTML(),
      data: data.map(item => {
        return {
          name: item[0],
          y: item[1]
        };
      })
    }];
    return formattedData;
  }),
  chartOptions: Ember.computed(function () {
    let series = this.get('chartData');
    return {
      chart: {
        type: 'bar',
        height: 200
      },
      title: {
        text: null
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      displayErrors: true,
      xAxis: {
        type: "category"
      },
      yAxis: {
        title: {
          text: null
        },
        max: this.get('maxValue'),
        allowDecimals: false
      },
      series: series,
      colors: ['#516BA6']
    };
  }),
});
