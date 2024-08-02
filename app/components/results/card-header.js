import InfluentTools from 'frontend/mixins/influent-tools';

export default Ember.Component.extend(InfluentTools, {
  singleParent: Ember.computed('parentCount', function () {
    return this.get('parentCount') === 1;
  }),
  doubleParent: Ember.computed('parentCount', function () {
    return this.get('parentCount') === 2;
  }),
  voterPercentClass: Ember.computed('result.voterPercent', function () {
    let binName = this.percentToBinName(this.get('result.voterPercent'), this.get('binCount'));
    return this.backgroundClassFor(binName);
  }),
  etheloClass: Ember.computed('result.ethelo', function () {
    let percent = this.rescaleEtheloToPercent(this.get('result.ethelo'));
    let binName = this.percentToBinName(percent, this.get('binCount'));
    return this.backgroundClassFor(binName);
  }),
  supportClass: Ember.computed('result.support', function () {
    let percent = this.rescaleSupportToPercent(this.get('result.support'));
    let binName = this.percentToBinName(percent, this.get('binCount'));
    return this.backgroundClassFor(binName);
  }),
  approvalClass: Ember.computed('result.approval', function () {
    let percent = this.rescaleApprovalToPercent(this.get('result.approval'));
    let binName = this.percentToBinName(percent, this.get('binCount'));
    return this.backgroundClassFor(binName);
  }),
  dissonanceClass: Ember.computed('result.dissonance', function () {
    let percent = this.rescaleApprovalToPercent(this.get('result.dissonance'));
    let binName = this.percentToBinName(percent, this.get('binCount'));
    return this.backgroundClassFor(binName);
  }),
  metricTitle: Ember.computed('result.metrics', 'statsDisplay', function () {
    const metricsList = this.get('result.metrics') || [];
    let primaryDisplay = this.get("statsDisplay.primaryStat");
    if (primaryDisplay === "voter_percent") {
      primaryDisplay = "voterPercent";
    }
    let currentMetric = metricsList.toArray().find(x => x.id.toString().includes(primaryDisplay)) || null;
    if (currentMetric) {
      return currentMetric.label.toString();
    }
    return "";
  }),
  actions: {
    toggleCardBody() {
      this.sendAction('toggleCardBody');
    }
  }
});
