import DS from 'ember-data';
import {formatHtmlId} from 'frontend/helpers/format-html-id';

export default DS.Model.extend({
  linkedMenuPage: null,
  anchorValue: Ember.computed('linkedMenuPage.anchorValue', function() {
    let anchorValue = this.get('linkedMenuPage.anchorValue');
    if(Em.isEmpty(anchorValue)) {
      return null;
    }
    if(anchorValue === 'optionCategory.slug' && Em.isEmpty(this.get('optionCategory'))) {
      anchorValue = 'option.optionCategory.slug';
    }

    return formatHtmlId(['a', this.get(anchorValue)]);
  }),
  i18n: Ember.inject.service(),
  updatedAt: DS.attr('date'),
  ethelo: DS.attr('number'),
  support: DS.attr('number'),
  dissonance: DS.attr('number'),
  histogram: DS.attr('array'),
  totalVotes: DS.attr('number'),
  abstainVotes: DS.attr('number'),
  negativeVotes: DS.attr('number'),
  neutralVotes: DS.attr('number'),
  positiveVotes: DS.attr('number'),
  averageWeight: DS.attr('number'),
  approval: DS.attr('number'),
  voterPercent: Ember.computed('totalVotes', 'abstainVotes', function(){
    let totalVotes = this.get('totalVotes') || 0;
    let abstainVotes = this.get('abstainVotes') || 0;

    return totalVotes / (totalVotes + abstainVotes) * 100;
  }),
  seedsAssigned: DS.attr('number'),
  positiveSeedVotesSq: DS.attr('number'),
  positiveSeedVotesSum: DS.attr('number'),
  seedAllocation: DS.attr('number'),
  voteAllocation: DS.attr('number'),
  combinedAllocation: DS.attr('number'),
  finalAllocation: DS.attr('number'),
  _buildStatMetricRow(stat, format = null){
    let i18n = this.get('i18n');
    let displayFormat = format || stat;
    let rawValue = this.get(stat);

    return {
      id: `${this.get('id')}-${stat}`,
      label: i18n.t(`results.metrics.labels.${stat.decamelize()}`),
      format: displayFormat,
      value: rawValue,
      rawValue: rawValue,
      visible: true,
      showBlank: true,
      blankValue: '-%',
      hint: i18n.t(`results.metrics.hints.${stat.decamelize()}_html`)
    };
  },
  metrics: Ember.computed('updatedAt', 'totalVotes', function() {
    this.get('updatedAt'); // observe
    this.get('totalVotes'); // observe

    let metrics = [];
    metrics.push(this._buildStatMetricRow('ethelo'));
    metrics.push(this._buildStatMetricRow('support'));
    metrics.push(this._buildStatMetricRow('approval'));
    metrics.push(this._buildStatMetricRow('dissonance'));
    metrics.push(this._buildStatMetricRow('voterPercent'));
    return metrics;
  }),
  quadratic: Ember.computed('updatedAt', function() {
    this.get('updatedAt'); // observe
    this.get('totalVotes'); // observe

    let metrics = [];
    metrics.push(this._buildStatMetricRow('seedsAssigned', 'number'));

    metrics.push(this._buildStatMetricRow('positiveSeedVotesSum', 'number'));
    metrics.push(this._buildStatMetricRow('finalAllocation', 'big_dollars'));
    return metrics;
  }),
  scenario: DS.belongsTo('scenario', {
    async: false
  }),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  decisionUser: DS.belongsTo('decision-user', {
    async: false,
  }),
  criterion: DS.belongsTo('criterion', {
    async: false
  }),
  option: DS.belongsTo('option', {
    async: false
  }),
  optionCategory: DS.belongsTo('option-category', {
    async: false
  }),

  normalizedAverageWeight: Ember.computed(
    'scenario.optionCategoryWeightingTotal',
    'scenario.criterionWeightingTotal',
    'isCriterionResult',
    'isOptionCategoryResult',
    'averageWeight',
    function() {
      let averageWeight = this.get('averageWeight');
      if (this.get('isCriterionResult')) {
        return averageWeight / this.get('scenario.criterionWeightingTotal');
      }

      if (this.get('isOptionCategoryResult')) {
        return averageWeight / this.get('scenario.optionCategoryWeightingTotal');
      }

      return null;
    }),
  //---properties for slider-voting chart---
  advancedTotal: DS.attr('number'),
  advancedVotes: DS.attr('number'),

  // helpers for all valid combinations
  isOptionCategoryQuad: Ember.computed.and('isOptionCategoryResult', 'optionCategory.topicVoting','optionCategory.quadratic', 'scenario.quadratic' ),
  isScenarioQuad: Ember.computed('isScenarioResult', 'scenario.quadratic' ),
  isScenarioResult: Ember.computed('criterion.id', 'option.id', 'optionCategory.id', 'scenario.id', function() {
    return this.get('scenario.id') &&
      Ember.isNone(this.get('criterion.id')) &&
      Ember.isNone(this.get('option.id')) &&
      Ember.isNone(this.get('optionCategory.id'));
  }),
  isOptionCategoryResult: Ember.computed('scenario.id', 'criterion.id', 'option.id', 'optionCategory.id', function() {
    return this.get('scenario.id') &&
      Ember.isNone(this.get('criterion.id')) &&
      Ember.isNone(this.get('option.id')) && !Ember.isNone(this.get('optionCategory.id'));
  }),
  isOptionResult: Ember.computed('scenario.id', 'criterion.id', 'option.id', 'optionCategory.id', function() {
    return this.get('scenario.id') &&
      Ember.isNone(this.get('criterion.id')) && !Ember.isNone(this.get('option.id')) &&
      Ember.isNone(this.get('optionCategory.id'));
  }),
  isCriterionResult: Ember.computed('scenario.id', 'criterion.id', 'option.id', 'optionCategory.id', function() {
    return this.get('scenario.id') && !Ember.isNone(this.get('criterion.id')) && !Ember.isNone(this.get('option.id')) &&
      Ember.isNone(this.get('optionCategory.id'));
  }),
  resultType: Ember.computed(
    'isScenarioResult', 'isOptionCategoryResult', 'isOptionResult', 'isCriterionResult',
    function() {
      if (this.get('isScenarioResult')) {
        return 'scenario';
      }
      if (this.get('isOptionCategoryResult')) {
        return 'option-category';
      }
      if (this.get('isOptionResult')) {
        return 'option';
      }
      if (this.get('isCriterionResult')) {
        return 'criterion';
      }
      return false;
    }),

  sortFieldString: Ember.computed(
    'isScenarioResult', 'isOptionCategoryResult', 'isOptionResult', 'isCriterionResult',
    function() {
      let oc = !Ember.isNone(this.get('optionCategory.sort')) ? this.get('optionCategory.sort') : this.get('option.optionCategory.sort');

      let ocSort = String(oc).padStart(3, '0');
      let oSort = String(this.get('option.sort')).padStart(3, '0');
      let cSort = String(this.get('criterion.sort')).padStart(2, '0');

      return `${ocSort}-${oSort}-${cSort}`;
    }),
  menuSortString: Ember.computed(
    'isScenarioResult', 'isOptionCategoryResult', 'isOptionResult', 'isCriterionResult',
    function() {
      if (this.get('isScenarioResult')) {
        return this.toString();
      }
      if (this.get('isOptionCategoryResult')) {
        return this.get('optionCategory').toString();
      }
      if (this.get('isOptionResult')) {
        return this.get('option').toString();
      }
      if (this.get('isCriterionResult')) {
        return this.get('criterion').toString();
      }
      return false;
    }),
  includedInBreakdown(resultsToFilter){
    if (!this.get('resultType')) {
      console.log('bad type');
      return false;
    }

    let ocx = this.optionCategoryExcluded(resultsToFilter);
    let oc = this.optionExcluded(resultsToFilter);
    let cx = this.criterionExcluded(resultsToFilter);

    let exclusions = ocx || oc || cx;

    return !exclusions;
  },
  optionCategoryExcluded(resultKeys) {
    if (!this.get('isOptionCategoryResult')) {
      return false;
    }
    let found = this.get('optionCategory.optionIds')
      .find(function(optionId) {
        return resultKeys.contains(optionId.toString());
      });
    return Ember.isEmpty(found);
  },
  optionExcluded(resultKeys){
    if (!this.get('isOptionResult')) {
      return false;
    }
    let optionId = this.get('option.id').toString();
    let found = resultKeys.contains(optionId);
    return !found;
  },
  criterionExcluded(resultKeys){
    if (!this.get('isCriterionResult')) {
      return false;
    }
    let combinedId = `${this.get('option.id')}-${this.get('criterion.id')}`;
    let resultFound = resultKeys.contains(combinedId);
    return !resultFound;
  },

});
