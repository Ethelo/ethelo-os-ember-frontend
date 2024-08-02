import InfluentTools from 'frontend/mixins/influent-tools';
import Registry from 'frontend/mixins/registry';

export default Ember.Mixin.create(Registry, InfluentTools, {
  analytics: Ember.inject.service(),
  allOptionCategoryWeights: Ember.computed(function() {
    return this.get('store').peekAll('option-category-weight');
  }),
  allOptionCategories: Ember.computed(function() {
    return this.get('store').peekAll('option-category');
  }),
  currentUserOptionCategoryWeights: Ember.computed(
    'allOptionCategoryWeights.@each.updatedAt',
    'allOptionCategoryWeights.@each.weighting',
    'registry.decisionUser.id',
    function() {
    let decisionUserId = this.get('registry.decisionUser.id');
    return this.get('allOptionCategoryWeights').filter(function(optionCategoryWeight) {
      // exclude unsaved weights
      return optionCategoryWeight.get('decisionUser.id') === decisionUserId && optionCategoryWeight.get('id') !== null;
    });
  }),
  currentUserOptionCategories: Ember.computed.filter('allOptionCategories', function(optionCategory) {
    return optionCategory.get('options.length') > 0;
  }),
  currentOptionCategoryWeight: Ember.computed('currentUserOptionCategoryWeights.@each.weighting', 'optionCategory.id', function() {
    let currentUserOptionCategoryWeights = this.get('currentUserOptionCategoryWeights');
    let optionCategoryId = this.get('optionCategory.id');
    return currentUserOptionCategoryWeights.find(function(optionCategoryWeight) {
      return optionCategoryWeight.get('optionCategory.id') === optionCategoryId;
    });
  }),
  defaultOptionCategoryWeight: Ember.computed.alias('optionCategory.weighting'),
  currentOptionCategoryWeightValue: Ember.computed('currentOptionCategoryWeight.weighting', function() {
    return this.get('currentOptionCategoryWeight.weighting') || this.get('defaultOptionCategoryWeight');
  }),
  participantHasVoted: Ember.computed('currentOptionCategoryWeightValue', function() {
    return this.get('currentOptionCategoryWeightValue') > 0;
  }),
  actions: {
    saveWeighting: function(weighting, optionCategory) {
      if (this.promptBeforeVoting()) {
        return;
      }
      let self = this;
      let optionCategoryWeightHash = {
        weighting: weighting,
        optionCategory: optionCategory,
        decisionUser: this.get('registry.decisionUser'),
        updatedAt: new Date(), // include immediately for faster placement in optionCategoryWeight list
      };

      let promise;
      // if editing an existing optionCategoryWeight
      let currentOptionCategoryWeight = self.get('currentOptionCategoryWeight');
      if (currentOptionCategoryWeight) {
        // just update the bin
        currentOptionCategoryWeight.set('weighting', optionCategoryWeightHash.weighting);
        promise = currentOptionCategoryWeight.save();
      } else {
        let newOptionCategoryWeight = this.get('store').createRecord('option-category-weight', optionCategoryWeightHash);
        promise = newOptionCategoryWeight.save();
      }

      let analytics = this.get('analytics');
      let registry = this.get('registry');

      let saved = promise.then(function() {
        analytics.trackEvent('Voting', 'Option Category Weight', optionCategory.get('title'));
        if (!registry.isDestroyed) {
          registry.delayedReloadUserScenario();
        }
      });
      return saved;
    },
  }
});
