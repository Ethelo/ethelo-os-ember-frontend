import ResultBreakdown from 'frontend/mixins/result-breakdown';
import StatsDisplay from 'frontend/utils/stats-display';
import OptionCategoryRangeVoteInfluent from 'frontend/mixins/option-category-range-vote-influent';
import TaxTools from 'frontend/mixins/tax-tools';
import BalanceTools from 'frontend/mixins/balance-tools';

export default Ember.Component.extend(ResultBreakdown, TaxTools, BalanceTools, OptionCategoryRangeVoteInfluent, {
  allCriteria: Ember.computed(function () {
    return this.get('store').peekAll('criterion');
  }),
  tagName: '',
  settings: Ember.computed.alias('registry.decision.sidebars.participant-results'),
  showOptionCategoryTitles: Ember.computed(
    'settings.option-category-titles-enabled',
    'registry.decision.optionCategories.length', function () {
      return this.get('settings.option-category-titles-enabled') &&
        this.get('registry.decision.optionCategories.length') > 1;
    }),
  optionCategoryStatsEnabled: false,// TODO sidebar settings
  calculationsEnabled: Ember.computed.bool('settings.calculations-enabled'),
  enabledLikerts: Ember.computed.bool('settings.enable-likerts'),
  criteriaEnabled: Ember.computed.alias('settings.criterion-stat'),
  resultSort: Ember.computed.alias('settings.sort-method'),
  showOnlyVoted: Ember.computed.bool('settings.show-only-voted'),
  firstOnly: true,
  withUser: true,
  panelId: Ember.computed('page.componentId', function () {
    return 'participant-result-sidebar' + this.get('page.componentId');
  }),
  showCalculations: Ember.computed('adjustedCalculations', 'calculationsEnabled', 'scenario.global', function () {
    let calculations = this.get('adjustedCalculations');
    let enabled = this.get('calculationsEnabled');
    return enabled && !this.get('scenario.global') && !Ember.isEmpty(calculations);
  }),

  adjustedCalculations: Ember.computed('showCalculations', 'scenario.calculations.@each.value', 'currentTaxState', function () {
    this.get('currentTaxState'); // watch
    if (this.get('scenario.calculations')) {
      const calculations = this.get('scenario.calculations')
        .filter(function (calculation) {
          return calculation.get('public');
        });
      calculations.map((c) => c.get('value')); // watch?
      return this.adjustedCalculationsData(calculations);

    } else {
      return [];
    }
  }),
  statsDisplay: Ember.computed(function () {
    let values = {
      showOnlyVoted: this.get('showOnlyVoted'),
      showCalculations: this.get('calculationsEnabled'),
      showOptionCategoryTitles: this.get('showOptionCategoryTitles'),
      showOptionCategoryStats: this.get('optionCategoryStatsEnabled'),
      showOptionStats: true,
      showCriterionStats: this.get('criteriaEnabled'),
      showSupportStat: true,
      resultSort: this.get('resultSort'),
      primaryStat: 'support',
    };

    return StatsDisplay.create(values);
  }),

  noResultsMessage: Ember.computed(
    'scenarioResults.@each.updateAt', 'registry.userScenarioWaiting', 'zeroOptions', 'hasVoted', 'solveStatus', 'pendingIsNewer',
    function () {
      let scenarioResults = this.get('scenarioResults');
      let zeroOptions = this.get('zeroOptions');
      let solveStatus = this.get('solveStatus');
      let pendingIsNewer = this.get('pendingIsNewer');
      if (!Em.isEmpty(scenarioResults)) {
        return null;
      }

      if (!this.get('hasVoted')) {
        return 'sidebars.participant_results.no_votes_html';
      }

      if (pendingIsNewer || this.get('registry.userScenarioWaiting')) {
        return 'sidebars.participant_results.solving_html';
      }

      if (solveStatus === 'error') {
        return 'sidebars.participant_results.not_available_html';
      }

      if (zeroOptions) {
        return 'sidebars.participant_results.zero_options_html';
      }

      return 'sidebars.participant_results.not_available_html';
    }),
  hasVoted: Ember.computed.gt('currentUserVotedOptions.length', 0),
  currentUserVotedKeys: Ember.computed(
    'currentUserBinVotes.@each.bin', 'currentUserBinVotes.@each.updatedAt',
    'currentUserOptionCategoryRangeVotes.@each.updatedAt',
    'scenario.optionIds', 'showOnlyVoted',
    function () {
      let optionIds = this.get('scenario.optionIds');
      if (Em.isEmpty(optionIds)) {
        return [];
      }

      if (!this.get('showOnlyVoted')) {
        return this.get('scenarioKeys');
      }

      let resultKeys = this.get('currentUserBinVotes')
        .filter((binVote) => {
          return !binVote.get('invalidVote') && optionIds.contains(binVote.get('option.id'));
        })
        .reduce(function (memo, binVote) {
          memo.push(binVote.get('option.id'), `${binVote.get('option.id')}-${binVote.get('criterion.id')}`);
          return memo;
        }, []);

      let ocOptions = this.get('currentUserOptionCategoryRangeVotes')
        .reduce(function (acc, ocRangeVote) {
          return acc.concat(ocRangeVote.get('optionCategory.optionIds'));
        }, [])
        .filter((optionId) => {
          return optionIds.contains(optionId);
        });

      return resultKeys.concat(ocOptions);
    }),
  resultsToFilter: Ember.computed(
    'scenario.optionIds', 'scenario.global', 'scenario.successful', 'showOnlyVoted', 'currentUserVotedOptions',
    function () {
      let optionIds = this.get('scenario.optionIds');
      let success = this.get('scenario.successful');
      let votedKeys = this.get('currentUserVotedKeys');
      let showOnlyVoted = this.get('showOnlyVoted');

      if (!success || Ember.isEmpty(optionIds)) {
        return [];
      }

      let filterList;

      if (showOnlyVoted) {
        filterList = votedKeys;
      } else {
        filterList = optionIds;
      }

      return filterList;

    }),
  showBalanceSidebar: Ember.computed('page.hasBalanceSidebar', 'balanceEnabled', 'balance2Enabled', function () {
    return this.get('page.hasBalanceSidebar') &&
      (this.get('balanceEnabled') || this.get('balance2Enabled'));
  }),

});
