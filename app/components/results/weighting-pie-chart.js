import HistogramBarChart from './histogram-bar-chart';

export default HistogramBarChart.extend( {
  classNames: ['weighting-pie-chart'],
  theme: Ember.computed.alias('registry.decision.theme'),

  title: '',
  result: null,

  weighting: Ember.computed.alias('result.averageWeight'),

  showChart: Ember.computed('weighting', function() {
    return !Ember.isEmpty(this.get('histogram'));
  }),

  chartData: Ember.computed('weighting', function() {
    let weighting = this.get('weighting');
    return [
      ['Title', 'Average Weight'],
      [this.get('title'), weighting],
      [null, 1 - weighting]
    ];
  }),

  chartOptions: Ember.computed('registry.decision.theme.chartColors.[]', function() {
    let series = this.get('chartData');
    return {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 300,
      },
      width: '100%',
      colors: this.get('theme').chartColorList(series.length),
      credits: { enabled: false },
      title: { text: null },
      tooltip: { valueSuffix: '%' },
      legend: {
        enabled: true,
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        width: '25%',
        itemMarginBottom: 6,
      },
      plotOptions: {
        pie: {
          size: '100%',
          startAngle: -30,
          dataLabels: {
            format: '{point.y}%',
            distance: -30,
          }
        },
      },
      series: [{ name: 'Average Weight', data: series }]
    };
  }),
});
