import InfluentTools from 'frontend/mixins/influent-tools';
import Registry from 'frontend/mixins/registry';

export default Ember.Mixin.create(Registry, InfluentTools, {
  analytics: Ember.inject.service(),
  allCriterionWeights: Ember.computed(function() {
    return this.get('store').peekAll('criterion-weight');
  }),
  currentUserCriterionWeights: Ember.computed('allCriterionWeights.@each.weighting',
    'allCriterionWeights.@each.updatedAt',
    'registry.decisionUser.id',
    function() {
    let decisionUserId = this.get('registry.decisionUser.id');
    return this.get('allCriterionWeights').filter(function(criterionWeight) {
      return criterionWeight.get('decisionUser.id') === decisionUserId;
    });
  }),
  currentCriterionWeight: Ember.computed('currentUserCriterionWeights.@each.weighting', 'criterion.id', function() {
    let currentUserCriterionWeights = this.get('currentUserCriterionWeights');
    let criterionId = this.get('criterion.id');
    return currentUserCriterionWeights.find(function(criterionWeight) {
      return criterionWeight.get('criterion.id') === criterionId;
    });
  }),
  currentCriterionWeightValue: Ember.computed('currentCriterionWeight.weighting', function() {
    return this.get('currentCriterionWeight.weighting');
  }),
  participantHasVoted: Ember.computed('currentCriterionWeightValue', function() {
    return this.get('currentCriterionWeightValue') > 0;
  }),

  actions: {
    saveWeighting: function(weighting, criterion) {
      if (this.promptBeforeVoting()) {
        return;
      }
      let self = this;
      let criterionWeightHash = {
        weighting: weighting,
        criterion: criterion,
        decisionUser: this.get('registry.decisionUser'),
        updatedAt: new Date(), // include immediately for faster placement in criterionWeight list
      };

      // if editing an existing criterionWeight
      let currentCriterionWeight = self.get('currentCriterionWeight');
      let promise;
      if (currentCriterionWeight) {
        // just update the bin
        currentCriterionWeight.set('weighting', criterionWeightHash.weighting);
        promise = currentCriterionWeight.save();
      } else {
        let newCriterionWeight = this.get('store').createRecord('criterion-weight', criterionWeightHash);
        promise = newCriterionWeight.save();
      }

      let analytics = this.get('analytics');
      let registry = this.get('registry');

      let saved = promise.then(function() {
        analytics.trackEvent('Voting', 'Criterion Weight', criterion.get('title'));
        if (!registry.isDestroyed) {
          registry.delayedReloadUserScenario();
        }
      });
      return saved;
    },
  }
});
