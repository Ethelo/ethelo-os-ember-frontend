import InfluentTools from 'frontend/mixins/influent-tools';
import Registry from 'frontend/mixins/registry';

export default Ember.Mixin.create(Registry, InfluentTools, {
  analytics: Ember.inject.service(),
  allOptionCategoryRangeVotes: Ember.computed(function() {
    return this.get('store').peekAll('option-category-range-vote');
  }),
  currentUserOptionCategoryRangeVotes: Ember.computed(
    'allOptionCategoryRangeVotes.@each.lowOption',
    'allOptionCategoryRangeVotes.@each.highOption',
    'registry.decisionUser.id',
    function() {
    let decisionUserId = this.get('registry.decisionUser.id');
    return this.get('allOptionCategoryRangeVotes').filter(function(optionCategoryRangeVote) {
      return optionCategoryRangeVote.get('decisionUser.id') === decisionUserId;
    });
  }),
  currentUserVotedOptionCategories: Ember.computed('currentUserOptionCategoryRangeVotes.@each.updatedAt', function(){
    return this.get('currentUserOptionCategoryRangeVotes')
      .filter(function(optionCategoryRangeVote) {
        return !optionCategoryRangeVote.get('deleteVote');
      })
      .map((optionCategoryRangeVote) => {
        return optionCategoryRangeVote.get('optionCategory.id');
      });
  }),
  currentOptionCategoryRangeVote: Ember.computed(
    'currentUserOptionCategoryRangeVotes.@each.lowOption',
    'currentUserOptionCategoryRangeVotes.@each.highOption',
    'optionCategory.id',
    function() {
    let currentUserOptionCategoryRangeVotes = this.get('currentUserOptionCategoryRangeVotes');
    let optionCategoryId = this.get('optionCategory.id');
    return currentUserOptionCategoryRangeVotes.find(function(optionCategoryRangeVote) {
      return optionCategoryRangeVote.get('optionCategory.id') === optionCategoryId;
    });
  }),
  currentOptionCategoryRangeVoteLowTick: Ember.computed('currentOptionCategoryRangeVote', function() {
    const optionCategory = this.get('optionCategory');
    const currentOCRVote=this.get('currentOptionCategoryRangeVote');
    if(Em.isEmpty(currentOCRVote) || currentOCRVote.get('deleteVote')){
      return null;
    }
    const currentVoteLowOptionId = currentOCRVote.get('lowOption.id');
    if(Em.isEmpty(currentVoteLowOptionId)) {
      return null;
    }
    const tick = optionCategory.optionIdToTick(currentVoteLowOptionId);
    return tick;
  }),
  participantHasVoted: Ember.computed('currentOptionCategoryRangeVoteValue', function() {
    return Ember.isEmpty(this.get('currentOptionCategoryRangeVoteValue.lowOption'));
  }),
  actions: {
    saveRangeVote: function(lowOption, highOption, optionCategory) {
      if (this.promptBeforeVoting()) {
        return;
      }
      let self = this;
      let optionCategoryRangeVoteHash = {
        lowOption: lowOption,
        highOption:  highOption,
        deleteVote: Em.isEmpty(lowOption),
        optionCategory: optionCategory,
        decisionUser: this.get('registry.decisionUser'),
        updatedAt: new Date(), // include immediately for faster placement in optionCategoryRangeVote list
      };

      // if editing an existing optionCategoryRangeVote
      let currentOptionCategoryRangeVote = self.get('currentOptionCategoryRangeVote');
      let promise;
      if (currentOptionCategoryRangeVote) {
         // just update the bin
          currentOptionCategoryRangeVote.set('deleteVote', optionCategoryRangeVoteHash.deleteVote);
          currentOptionCategoryRangeVote.set('lowOption', optionCategoryRangeVoteHash.lowOption);
          currentOptionCategoryRangeVote.set('highOption', optionCategoryRangeVoteHash.highOption);
          promise = currentOptionCategoryRangeVote.save();
     } else {
        let newOptionCategoryRangeVote = this.get('store').createRecord('option-category-range-vote', optionCategoryRangeVoteHash);
        promise = newOptionCategoryRangeVote.save();
      }

      let analytics = this.get('analytics');
      let registry = this.get('registry');

      let saved = promise.then(function() {
        analytics.trackEvent('Voting', 'OptionCategoryRange', optionCategory.get('title'));
        if (!registry.isDestroyed) {
          registry.delayedReloadUserScenario();
        }
      });

      return saved;
    },
  }

});
