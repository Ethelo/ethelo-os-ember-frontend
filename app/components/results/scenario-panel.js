import Registry from 'frontend/mixins/registry';
import InfluentTools from 'frontend/mixins/influent-tools';

export default Ember.Component.extend(Registry, InfluentTools, {
  routing: Ember.inject.service('-routing'),
  classNames: ['panel', 'panel-default'],
  i18n: Ember.inject.service(),
  isShowDefaultView: Ember.computed.not('isCollapsed'),
  classNameBindings: ['isShowDefaultView:show-default-view:hide-default-view'],
  scenarioCount: Ember.computed.alias('registry.scenarioCount'), // group count
  currentView: 'people',
  currentViewTitle: Ember.computed('currentView', function(){
    return ({
      metrics: this.get('i18n').t('results.metrics.title'),
      histogram: this.get('i18n').t('results.metrics.histogram'),
      people: this.get('i18n').t('results.metrics.distribution')
    })[this.get('currentView')];
  }),
  showPanel: Ember.computed.or('showHeader', 'showChart'),
  showHeader: Ember.computed.notEmpty('result'),
  showMetrics: Ember.computed('currentView', function () {
    return this.get('currentView') === 'metrics';
  }),
  showHistogramChart: Ember.computed('result.totalVotes', 'statsDisplay.showHistogramChart', 'currentView', function () {
    return this.get('statsDisplay.showHistogramChart') &&
      this.get('result.totalVotes') > 0 &&
      this.get('currentView') === "histogram";
  }),
  showPeopleChart: Ember.computed('result.totalVotes', 'statsDisplay.showPeopleChart', 'currentView', function () {
    return this.get('statsDisplay.showPeopleChart') &&
      this.get('result.totalVotes') > 0 &&
      this.get('currentView') === "people";
  }),
  showNavigation: Ember.computed('registry.scenarioCount', 'scenario.global', function () {
    let count = this.get('registry.scenarioCount');
    let global = this.get('scenario.global');
    return !global && count > 1;
  }),
  result: Ember.computed('scenario.id', 'scenarioResults.@each.updatedAt', function () {
    let scenarioId = this.get('scenario.id');

    let filtered = this.get('scenarioResults')
      .filter(function (result) {
        return result.get('isScenarioResult') && result.get('scenario.id') === scenarioId;
      });
    return filtered.get('firstObject');
  }),
  voterPercentClass: Ember.computed('result.voterPercent', function() {
    let binName = this.percentToBinName(this.get('result.voterPercent'), this.get('binCount'));
    return this.backgroundClassFor(binName);
  }),
  etheloClass: Ember.computed('result.ethelo', function () {
    let percent = this.rescaleEtheloToPercent(this.get('result.ethelo'));
    let binName = this.percentToBinName(percent, this.get('binCount'));
    return this.textClassFor(binName);
  }),
  supportClass: Ember.computed('result.support', function () {
    let percent = this.rescaleSupportToPercent(this.get('result.support'));
    let binName = this.percentToBinName(percent, this.get('binCount'));
    return this.textClassFor(binName);
  }),

  approvalClass: Ember.computed('result.approval', function () {
    let percent = this.rescaleApprovalToPercent(this.get('result.approval'));
    let binName = this.percentToBinName(percent, this.get('binCount'));
    return this.backgroundClassFor(binName);
  }),

  totalVotes: Ember.computed.alias('result.totalVotes'),


  panelHeight: Ember.computed('isCollapsed', function() {
    if (this.get('isCollapsed')) {
      return new Ember.Handlebars.SafeString('');
    } else {
      return new Ember.Handlebars.SafeString('height: 0px');
    }
  }),

  actions: {
    setCurrentView(view) {
      this.set('currentView', view);
    },
    isDefaultViewActive() {
      this.toggleProperty('isShowDefaultView');
    }
  },
  didRender() {
    $('[data-toggle="tooltip"]').tooltip('destroy');

   
    setTimeout(function(){
      $('[data-toggle="tooltip"]').tooltip();
    },500);
  }

});