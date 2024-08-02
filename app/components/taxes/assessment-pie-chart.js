import Registry from 'frontend/mixins/registry';
import TaxTools from 'frontend/mixins/tax-tools';
import Formatter from 'frontend/utils/formatters';

export default Ember.Component.extend(Registry, TaxTools, {
  theme: Ember.computed.alias('registry.decision.theme'),

  classNames: ['tax-pie-chart'],
  taxAssessment: Ember.computed.alias('registry.decision.taxAssessment'),
  includeOptionCategories: false,
  title: null,
  assessmentItems: [],
  dynamicCharts: false,
  legendPosition: 'left',
  reverseColors: false,

  preparedAssessmentItems: Ember.computed('assessmentItems.[]', 'currentPropertyType', function() {
    let assessmentItems = this.get('assessmentItems').copy();
    let type = this.get('currentPropertyType');
     let percentValues;
    let flatFeeValues;

    const filterFunc = function(value){
      return Em.isPresent(value) && !isNaN(value);
    };

    let filtered = assessmentItems.map(function(item) {

      flatFeeValues = [item['residentialFlatFee'], item['flatFee'], 0];
      percentValues = [item['residentialPercent'], item['value'], 100];

      if (type === 'commercial') {
        flatFeeValues.unshift(item['commercialFlatFee']);
        percentValues.unshift(item['commercialPercent']);
      }

      return {
        caption: item['caption'],
        assessmentPercent: percentValues.filter(filterFunc).get('firstObject'),
        flatFee: flatFeeValues.filter(filterFunc).get('firstObject'),
      };

    });

    return filtered;

  }),

  chartColors: function(length){
    let colors = this.get('theme').chartColorList(length).copy();
    if (this.get('reverseColors') ){
      return colors.reverse();
    } else {
      return colors;
    }
  },

  chartData: Ember.computed('assessmentItems.[]', 'currentTaxState', 'dynamicCharts', 'includeOptionCategories', function() {
      this.get('currentTaxState'); // observe
      let assessmentItems = this.get('preparedAssessmentItems');

      if (this.get('includeOptionCategories')) {
        assessmentItems = assessmentItems.concat(this.get('categoriesTaxData'));
      }
      let assessmentValue = this.get('currentDefaultAssessment');
      if (this.get('taxAssessment.dynamicCharts')) {
        assessmentValue = this.get('customAssessmentValue');
      }
      let i18n = this.get('i18n');
      let data = assessmentItems.map(item => {
        let value = (item['assessmentPercent'] * assessmentValue) + (item['flatFee'] || 0);
        let formatted = Formatter['dollars'](value, i18n);
        return {name: item['caption'], y: value, formatted: formatted};
      });

      return data;
    }),

  chartOptions: Ember.computed('registry.decision.theme.chartColors.[]', 'title', function() {
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
      colors: this.chartColors('series.length'),
      credits: {enabled: false},
      title: {
        text: this.get('title').toString(),
        align: 'left',
        style: {fontWeight: 'bold'}
      },
      tooltip: {
        pointFormat: '<b>{point.formatted} ({point.percentage:.1f}%)</b>',
      },
      legend: {
        enabled: true,
        layout: 'vertical',
        align: this.get('legendPosition'),
        verticalAlign: 'middle',
        width: '50%',
        itemMarginTop: 5, //min possible topMargin, prevents title and legend overlap
        itemMarginBottom: 6,
      },
      plotOptions: {
        // colorByPoint: true,  // If set to true, it will generate random color for each point on graph.
        pie: {
          size: '110%',
          dataLabels: {
            formatter: function() {
              return (this.percentage > 5) ? this.point.formatted : '';
            },
            distance: -30
          }
        },
        series: {animation: false}
      },
      series: [{data: series}]
    };
  }),
});
