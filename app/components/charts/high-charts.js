import Ember from 'ember';
import HighchartsThemeMixin from './highcharts-theme-mixin';

export default Ember.Component.extend(HighchartsThemeMixin, {
  classNames: ['highcharts'],
  chart: null,
  chartId: 'chart',
  content: undefined,
  lastId: null,
  didRender: function() {
    this.drawLater();
    this.buildTheme();
  },

  drawLater: function() {
    Ember.run.scheduleOnce('afterRender', this, 'draw');
  },
  chartIdChanged: Ember.observer('chartId', function() {
    let oldId = this.get('lastId');
    let newId = this.get('chartId');
    this.set('lastId', newId);
    if (Em.isEmpty(oldId)){
      return;
    }
    $(Highcharts.charts).each(function(i,chart){
      if(!chart){
        return;
      }
      if(chart.renderTo.id === oldId){
       chart.destroy();
      }
    });
  }),
  draw: function() {
    let that = this;
    let selector = $('#' + this.get('chartId'));
    let chart = selector.highcharts();

    if(Em.isEmpty(chart)) {
      chart = Highcharts.chart(this.get('chartId'), this.get('chartOptions'));
    }

    let content = this.get('content');
    if(Em.isEmpty(content[0].data)) {
      // some charts ony get one series passed
      this.updateSeries(0, content, chart);
    } else {
      // bar charts get multiple series
      content.forEach(function(series, index) {
        that.updateSeries(index, series.data, chart);
      });
    }
  },

  updateSeries(index, data, chart) {
    data = data.map((function(point) {
      // prevent weird ember set error
      return Object.assign({}, point);
    }));
     chart.series[index].setData(data, true);
     chart.legend.update({}, true);
  },


  willDestroyElement: function() {
    let chart = $('#' + this.get('chartId')).highcharts();

    if(chart) {
      chart.destroy();
    }
  }
});
