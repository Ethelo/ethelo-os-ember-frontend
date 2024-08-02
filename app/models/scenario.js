import DS from 'ember-data';

export default DS.Model.extend({
  rank: DS.attr('number'),
  updatedAt: DS.attr('date'),
  global: DS.attr('boolean'),
  quadratic: DS.attr('boolean'),
  status: DS.attr('string'),
  apiId: DS.attr('string'),
  scenarioSetId: DS.attr('string'),
  successful: Ember.computed.equal('status', 'success'),
  pending: Ember.computed.equal('status', 'pending'),
  error: Ember.computed.equal('status', 'error'),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  options: DS.hasMany('option', {
    async: false
  }),
  optionIds: Ember.computed.mapBy('options', 'id'),

  decisionUser: DS.belongsTo('decision-user', {
    async: false,
  }),
  results: DS.hasMany('scenario-result', {
    async: false
  }),
  calculations: DS.hasMany('scenario-calculation', {
    async: false
  }),

  optionCategoryWeightingTotal: Ember.computed('results.@each.updatedAt', function() {
    let results = this.get('results');
    if (Ember.isEmpty(results)) {
      return 0;
    }

    let ids = [];

    let total = results.reduce(function(acc, result) {
      let optionCategoryId = result.get('optionCategory.id');
      if (result.get('isOptionCategoryResult') && !ids.includes(optionCategoryId)) {
        acc = acc + (result.get('averageWeight') || 0);
        ids.push(optionCategoryId);
      }
      return acc;
    }, 0);
    return total;

  }),

  criterionWeightingTotal: Ember.computed('results.@each.updatedAt', function() {
    let results = this.get('results');
    if (Ember.isEmpty(results)) {
      return 0;
    }

    let ids = [];

    let total = results.reduce(function(acc, result) {
      let criterionId = result.get('criterion.id');
      if (result.get('isCriterionResult') && !ids.includes(criterionId)) {
        acc = acc + (result.get('averageWeight') || 0);
        ids.push(criterionId);
      }
      return acc;
    }, 0);
    return total;

  }),
});
