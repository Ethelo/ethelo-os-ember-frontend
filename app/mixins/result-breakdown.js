import ContentBlocks from 'frontend/mixins/content-blocks';
import Registry from 'frontend/mixins/registry';
import ScenarioLoader from 'frontend/mixins/scenario-loader';

export default Ember.Mixin.create(Registry, ScenarioLoader, ContentBlocks, {
  allCriteria: Ember.computed(function () {
    return this.get('store').peekAll('criterion');
  }),
  scenarioCount: Ember.computed('withUser', 'registry.scenarioCount', 'registry.userScenarioCount', function () {
    if (this.get('withUser')) {
      return this.get('registry.userScenarioCount');
    } else {
      return this.get('registry.scenarioCount');
    }
  }),
  solveStatus: Ember.computed('withUser', 'registry.scenarioSolveStatus', 'registry.userScenarioSolveStatus', function () {
    if (this.get('withUser')) {
      return this.get('registry.userScenarioSolveStatus');
    } else {
      return this.get('registry.scenarioSolveStatus');
    }
  }),
  firstOnly: false,
  withGlobal: Ember.computed('rank', function () {
    return this.get('rank') < 2; // don't auto reload global if after rank 1
  }),
  zeroOptions: Ember.computed('scenario.options.@each.id', 'scenario.global', 'scenario.successful', function () {
    let options = this.get('scenario.options');
    let global = this.get('scenario.global');
    let successful = this.get('scenario.successful');
    if (global || !successful || Em.isEmpty(options)) {
      return false;
    }
    return options.length < 1;
  }),
  rank: Ember.computed('withRanked', 'firstOnly', 'pageIndex', function () {
    let index = this.get('pageIndex');

    if (this.get('withRanked')) {
      return index || 1;
    } else {
      return 0;
    }
  }),
  withUser: false,
  personalResultsMode: Ember.computed.alias('registry.decision.sidebars.participant-results.result-mode'),

  withRanked: Ember.computed('registry.decision.loadRankedScenarios', 'withUser', 'personalResultsMode', function(){
    if( this.get('withUser') ){
      return this.get('personalResultsMode') === 'combination';
    }else {
      return this.get('registry.decision.loadRankedScenarios');
    }
  } ),
  scenario: Ember.computed('withRanked', 'globalScenario.updatedAt', 'rankedScenario.updatedAt', function () {
    this.get('globalScenario.updatedAt'); // observe.
    this.get('rankedScenario.updatedAt'); // observe.
    if (this.get('withRanked')) {
      return this.get('rankedScenario');
    } else {
      return this.get('globalScenario');
    }
  }),
  combinedScenarioResults: Ember.computed(
    'globalScenario.results.@each.updatedAt', 'globalScenario.id', 'rankedScenario.results.@each.updatedAt', 'rankedScenario.id',
    function () {
      let globalId = this.get('globalScenario.id');
      let rankedId = this.get('rankedScenario.id');
      let groupResults = this.get('globalScenario.results');
      let rankedResults = this.get('rankedScenario.results');
      let combinedResults = [];

      if (Ember.isNone(groupResults)) {
        combinedResults = [];
      } else {
        combinedResults = groupResults.toArray().copy();
      }

      if (!Ember.isNone(rankedResults) && globalId !== rankedId) {
        combinedResults = combinedResults.concat(rankedResults.toArray());
      }

      return combinedResults;
    }),
  scenarioResults: Ember.computed('combinedScenarioResults.[]', 'resultsToFilter.[]', function () {
    let resultsToFilter = this.get('resultsToFilter'); // observe
    let combinedScenarioResults = this.get('combinedScenarioResults');
    let scenario = this.get('scenario');
    if (Em.isEmpty(scenario) || Em.isEmpty(combinedScenarioResults) || (Em.isEmpty(resultsToFilter) && Em.isArray(resultsToFilter))) {
      return [];
    }

    let scenarioResults = combinedScenarioResults.copy();

    if (resultsToFilter) {
      scenarioResults = scenarioResults.filter(function (result) {
        return result.includedInBreakdown(resultsToFilter);
      });
    }
    return scenarioResults;
  }),
  pendingIsNewer: Ember.computed('scenario.updatedAt', 'pendingRankedScenario.updatedAt', function () {
    let pendingUpdated = this.get('pendingRankedScenario.updatedAt');
    let scenarioUpdated = this.get('scenario.updatedAt');

    if (Em.isEmpty(pendingUpdated)) {
      return false;
    }

    if (this.get('pendingRankedScenario.scenarioSetId') === this.get('scenario.scenarioSetId')) {
      return false;
    }

    return pendingUpdated > scenarioUpdated;

  }),
  noResultsMessage: Ember.computed('scenarioResults.[]', 'rank', 'zeroOptions', 'solveStatus', 'pendingIsNewer', 'scenarioCount', function () {
    let scenarioResults = this.get('scenarioResults');
    let scenarioCount = this.get('scenarioCount');
    let solveStatus = this.get('solveStatus');
    let rank = this.get('rank');
    let zeroOptions = this.get('zeroOptions');
    let pendingIsNewer = this.get('pendingIsNewer');

    if (!Em.isEmpty(scenarioResults)) {
      return null;
    }

    if (!this.get('registry.user')) {
      return 'results.not_available_html';
    }

    if (rank > scenarioCount) {
      return 'results.does_not_exist_html';
    }

    if (pendingIsNewer) {
      return 'results.solving_html';
    }

    if (solveStatus === 'error') {
      return 'results.not_available_html';
    }

    if (zeroOptions) {
      return 'results.zero_options_html';
    }

    return 'results.not_available_html';
  }),
  scenarioKeys: Ember.computed('scenario.optionIds.[]', function(){
    let optionIds = this.get('scenario.optionIds');
    let criteria = this.get('allCriteria');
    let keys = criteria.reduce(function (memo, criterion) {
      var set;
      set = optionIds.reduce((set2, optionId) => {
        set2.push(optionId, `${optionId}-${criterion.get('id')}`);
        return set2;
      }, []);
      return memo.concat(set);
    }, []);

    return keys;
  }),
  resultsToFilter: Ember.computed('scenario.optionIds', 'scenario.successful', 'scenario.global', function () {
    let optionIds = this.get('scenario.optionIds'); // watch
    let successful = this.get('scenario.successful');

    if (this.get('scenario.global')) {
      return false;
    } else if (!successful) {
      return [];
    } else {
     return this.get('scenarioKeys');
    }
  }),
  translationScope: Ember.computed.alias('page.translationScope'),
  willInsertElement() {
    this._super(...arguments);
    this.loadScenario();
  },
});
