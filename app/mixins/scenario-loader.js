import Registry from 'frontend/mixins/registry';

export default Ember.Mixin.create(Registry, {
  withUser: false,
  withRanked: false,
  withGlobal: true,
  scenarioIdForRank(rank){
    let suffix = '';
    if (this.get('withUser')) {
      let decisionUserId = this.get('registry.decisionUser.id');
      if (!Ember.isEmpty(decisionUserId)) {
        suffix = `-${decisionUserId}`;
      }
    }
    return `${rank}${suffix}`;
  },
  rankedScenarioId: Ember.computed('rank', 'withUser', 'registry.decisionUser.id', function() {
    this.get('withUser');
    this.get('registry.decisionUser.id'); //observe
    let rank = this.get('rank');
    return this.scenarioIdForRank(rank);
  }),
  pendingRankedScenarioId: Ember.computed('rankedScenarioId', function() {
    return `${this.get('rankedScenarioId')}-pending`;
  }),
  globalScenarioId: Ember.computed('withUser', 'registry.decisionUser.id', function() {
    this.get('withUser');
    this.get('registry.decisionUser.id'); // observe
    return this.scenarioIdForRank(0);
  }),
  rankedScenario: Ember.computed('withRanked', 'maxScenarioDate', 'scenarios.[]', 'rankedScenarioId', function() {
    this.get('maxScenarioDate');// observe
    this.get('scenarios');// observe
    let rankedId = this.get('rankedScenarioId');
    if (!this.get('withRanked') || this.get('rank') === "0") {
      return null;
    } else {
      return this.get('store').peekRecord('scenario', rankedId);
    }
  }),
  pendingRankedScenario: Ember.computed('withRanked', 'maxScenarioDate', 'scenarios.[]', 'pendingRankedScenarioId', function() {
    this.get('maxScenarioDate');// observe
    this.get('scenarios');// observe
    let pendingRankedId = this.get('pendingRankedScenarioId');

    if (!this.get('withRanked') || this.get('rank') === "0") {
      return null;
    } else {
      return this.get('store').peekRecord('scenario', pendingRankedId);
    }
  }),
  globalScenario: Ember.computed('maxScenarioDate', 'scenarios.[]', 'globalScenarioId', function() {
    this.get('maxScenarioDate');// observe
    this.get('scenarios');// observe

    return this.get('store').peekRecord('scenario', this.get('globalScenarioId'));
  }),
  scenarios: Ember.computed(function() {
    return this.get('store').peekAll('scenario');
  }),
  scenarioDates: Ember.computed.mapBy('scenarios', 'updatedAt'),
  maxScenarioDate: Ember.computed.max('scenarioDates'),

  isLoading: Ember.computed('maxScenarioDate', 'scenarios.[]', 'rank', 'userScenarioWaiting', 'rankedScenario.updatedAt', 'globalScenario.updatedAt', function() {
    if (this.get('withUser') && Em.isEmpty(this.get('registry.decisionUser'))) {
      return false;
    }

    this.get('maxScenarioDate');
    this.get('scenarios');
    this.get('rank');
    this.get('rankedScenario.updatedAt');
    this.get('globalScenario.updatedAt');  // observe

    let ranked = this.get('rankedScenario');
    let global = this.get('globalScenario');

    if (this.get('withRanked')) {
      return Ember.isNone(ranked) || (this.get('withUser') && this.get('registry.userScenarioWaiting'));
    }
    return Ember.isNone(global);
  }),
  shouldReloadRanked: Ember.computed('rank', 'withRanked', 'rankedScenario.updatedAt', 'rankedScenario.successful', function() {
    // observe
    this.get('rankedScenario.updatedAt');
    this.get('rankedScenario.successful');
    this.get('rank');

    if (!this.get('withRanked')) {
      return false;
    }
    return this._shouldReloadScenario(this.get('rankedScenario'));
  }),
  shouldReloadGlobal: Ember.computed('withGlobal', 'globalScenario.updatedAt', 'globalScenario.successful', function() {
    // observe
    this.get('globalScenario.updatedAt');
    this.get('globalScenario.successful');

    if (!this.get('globalScenario')) {
      return true;
    }

    if (!this.get('withGlobal')) {
      return false;
    }
    return this._shouldReloadScenario(this.get('globalScenario'));
  }),
  scenarioConfigChanged: function() {
    this.get('rank'); //observe
    this.get('withUser');
    if (this.get('shouldReloadRanked') || this.get('shouldReloadGlobal')) {
      this.loadScenario();
    }
  }.observes('rank', 'withUser', 'shouldReloadRanked', 'shouldReloadGlobal'),
  loadScenario(){
    if (this.get('withUser') && Em.isEmpty(this.get('registry.decisionUser'))) {
      return;
    }

    let loadGlobal = this.get('shouldReloadGlobal');
    this.get('registry').loadScenarios(this.get('rank'), loadGlobal, this.get('withUser'));
  },
  _shouldReloadScenario(scenario){
    if (Ember.isNone(scenario)) {
      return true;
    }

    let lastUpdate = scenario.get('updatedAt');
    if (Ember.isNone(lastUpdate)) {
      return true;
    }

    if (lastUpdate < moment().add(-1, 'days').toDate()) {
      return false; // TODO replace with decision closed check
    }
    return lastUpdate < moment().add(-3, 'minutes').toDate(); //refresh every three minutes
  }
});
