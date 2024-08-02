import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  currentRank: 0,
  scenarioCount: Ember.computed.alias('registry.scenarioCount'), // global count
  hasPrevScenario: Ember.computed('currentRank', function() {
    return this.get('currentRank') > 1;
  }),
  hasNextScenario: Ember.computed('currentRank', 'scenarioCount', function() {
    return parseInt(this.get('currentRank')) < this.get('scenarioCount') - 1;
  }),
  nextRank: Ember.computed('currentRank', function() {
    return parseInt(this.get('currentRank')) + 1;
  }),
  prevRank: Ember.computed('currentRank', function() {
    return parseInt(this.get('currentRank')) - 1;
  }),
  // property passed to scenario-nav.hbs
  totalScenarioCount: Ember.computed('registry.scenarioCount', function() {
    return this.get('registry.scenarioCount') - 1;
  })
});
