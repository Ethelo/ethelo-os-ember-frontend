import Registry from 'frontend/mixins/registry';
import Formatter from 'frontend/utils/formatters';
import Ember from 'ember';

export default Ember.Component.extend(Registry, {
  classNames: ['question-totals-bar-chart'],
  theme: Ember.computed.alias('registry.decision.theme'),

  chartId: Ember.computed("question.componentId", function () {
    return `qtb-${this.get('question.componentId')}`;
  }),

  popularTitle: Ember.computed('question.mostPopularTotal.total', 'question.numUsersAnswered', function() {
    let popular = this.get('question.mostPopularTotal');
    let popularUsers = popular.get('value');
    let totalUsers = this.get('question.numUsersAnswered');

    let i18n = this.get('i18n');
    let percentage = Formatter['percent'](popularUsers / totalUsers, i18n);

    if (popularUsers === 0) {
      return i18n.t('survey.no_responses').toString();
    } else {
      return i18n.t('survey.top_response_html', {
        title: `"${popular.get('answerTitle')}"`,
        count: popularUsers,
        percentage: percentage,
      }).toHTML();
    }

  }),

  maxValue: Ember.computed('question.mostPopularTotal', function() {
    let total = this.get('question.mostPopularTotal');
    if (Em.isEmpty(total)) {
      return 1;
    } else {
      return total.get('value') + 1;
    }
  }),

  chartData: Ember.computed('question.answerTotals', function() {
    let answerTotals = this.get('question.answerTotals');
    let i18n = this.get('i18n');
    let data = answerTotals
      .map(function(total) {
        let title = total.get('answer.caption') || total.get('caption');
        let value = total.get('value');

        return [title, value];
      })
      .filter(function(item) {
        return !Ember.isEmpty(item[0]);
      });

    // format data for highcharts series

    let formattedData = [{
      name: i18n.t('survey.value').string,
      data: data.map(item => {
        return {
          name: item[0],
          y: item[1]
        };
      }),
      dataLabels: {
        enabled: true,
        crop: false,
        overflow: 'none'
      },
    }];

    return formattedData;
  }),

  chartOptions: Ember.computed(function() {
    let height = (this.get('chartData.length') * 25);
    let series = this.get('chartData');

    return {
      chart: { type: "bar", marginRight: 40 },
      height: height,
      title: { text: this.get("popularTitle") },
      credits: {enabled: false},
      legend: {enabled: false},
      plotOptions: {
        bar: {
          dataLabels: {enabled: true}
        }
      },
      exporting: {
        buttons: {
          contextButton: {enabled: false}
        }
      },
      displayErrors: true,
      xAxis: {
        type: "category",
        lineWidth: 0,
        tickWidth: 0
      },
      yAxis: {title: {text: 'Number of responses'}, max: this.get('maxValue') , allowDecimals: false },
      series: series,
      colors: this.get('theme').chartColorList(series.length)
    };
  }),
});
