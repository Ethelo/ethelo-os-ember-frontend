import InfluentTools from 'frontend/mixins/influent-tools';
import Registry from 'frontend/mixins/registry';
import Modals from "frontend/mixins/modals";

window.profiles = {};
export default Ember.Mixin.create(Registry, Modals, InfluentTools, {
  analytics: Ember.inject.service(),
  currentBinVote: Ember.computed('option.id', 'criterion.id', 'registry.decisionUser.id',
    'currentBinVote.deleteVote', 'currentBinVote.bin', function() {
      let optionId = this.get('option.id');
      let criterionId = this.get('criterion.id');
      if(!optionId || !criterionId) {
        return null;
      }
      let result = this.currentBinVoteFor(optionId, criterionId);

      // preload a blank vote if we don't have one (so we
      // don't have to watch the whole array for record creation)
      if(!result) {
        result = this.get('store').createRecord('bin-vote', {
          bin: 0,
          decisionUser: this.get('registry.decisionUser'),
          criterion: this.get('criterion'),
          option: this.get('option')
        });
      }

      return result;
    }),
  currentBinVoteFor: function(optionId, criterionId) {
    let decisionUserId = this.get('registry.decisionUser.id');
    if(!decisionUserId || !optionId || !criterionId) {
      return null;
    }
    let result = this.get('store').peekAll('bin-vote').find(function(binVote) {
      if((binVote.get('decisionUser.id') === decisionUserId) &&
        (binVote.get('option.id') === optionId) &&
        (binVote.get('criterion.id') === criterionId) &&
        !binVote.get('deleteVote')) {
        return binVote;
      }
    });
    return result;
  },
  currentBinVotesFor(optionIds, criteriaIds) {
    let currentUserBinVotes = this.get('currentUserBinVotes');
    return currentUserBinVotes.filter(function(binVote) {
      return optionIds.includes(binVote.get('option.id')) && criteriaIds.includes(binVote.get('criterion.id'));
    }).sortBy('id');
  },
  binaryVoteValueForBinVote(binVote) {
    let binVoteBin = binVote && binVote.get('bin');
    return binVoteBin > 0 ? 'yes' : '';
  },
  currentBinVoteValue: Ember.computed('currentBinVote.bin', function() {
    let voteValue =  this.get('currentBinVote.bin') > 0 ? this.get('currentBinVote.bin') : null;
    return voteValue;
  }),
  currentBinName: Ember.computed('currentBinVoteValue', function() {
    return this.binNameFor(this.get('currentBinVoteValue'));
  }),
  currentBinBackground: Ember.computed('participantHasVoted', 'currentBinName', function() {
    return this.get('participantHasVoted') ? this.colorFor(this.get('currentBinName')) : '';
  }),
  currentBinClass: Ember.computed('participantHasVoted', 'currentBinName', function() {
    if(this.get('participantHasVoted')) {
      return this.backgroundClassFor(this.get('currentBinName'));
    } else {
      return `${this.get('currentBinName')}-color-text`;
    }
  }),
  currentBinBackgroundClass: Ember.computed('participantHasVoted', 'currentBinName', function() {
    return this.backgroundClassFor(this.get('currentBinName'));
  }),

  binBackgroundStyle: Ember.computed('currentBinBackground', function() {
    return new Ember.Handlebars.SafeString(`background-color: ${this.get('currentBinBackground')}`);
  }),
  currentBinKey: Ember.computed('currentBinVoteValue', function() {
    return this.captionKeyForBin(this.get('currentBinVoteValue'), 'support');
  }),
  participantHasVoted: Ember.computed('currentBinVoteValue', function() {
    return this.get('currentBinVoteValue') > 0;
  }),

  binVoteData(bin, option, criterion) {
    return {
      bin: bin,
      option: option,
      criterion: criterion,
      decisionUser: this.get('registry.decisionUser'),
      updatedAt: new Date(), // include immediately for faster placement in binVote list
    };
  },
  binCount: Ember.computed.alias('registry.decision.optionVoteBins'),

  saveBinVote(binVoteData, currentBinVote, deleteVote, action) {
    let promise;

    if(!currentBinVote && deleteVote) {
      return;
    }
    if(currentBinVote) {
      currentBinVote.set('deleteVote', deleteVote);
      currentBinVote.set('bin', binVoteData.bin);
      promise = currentBinVote.save();
    } else {
      let newBinVote = this.get('store').createRecord('bin-vote', binVoteData);
      promise = newBinVote.save();
    }
    let analytics = this.get('analytics');
    let registry = this.get('registry');
    let actionTarget = this.get('option.title') + this.get('option.id') + this.get('criterion.title') + this.get('criterion.id');

    let saved = promise.then(function() {
      analytics.trackEvent('Voting', action, actionTarget);
      if(deleteVote && currentBinVote && !currentBinVote.isDestroyed) {
        currentBinVote.unloadRecord();
      }
      if(!registry.isDestroyed) {
        registry.delayedReloadUserScenario();
      }
    });
    return saved;
  },
  saveBinaryVotes(bin, option) {
    const criteria = this.get('criteria');
    let deleteVote;

    criteria.forEach((criterion) => {
      this.set('criterion', criterion);
      deleteVote = Em.isEmpty(bin) || bin < 1;

      let binVoteData = this.binVoteData(bin, option, criterion);
      const currentBinVote = this.currentBinVoteFor(option.get('id'), criterion.get('id'));
      return this.saveBinVote(binVoteData, currentBinVote, deleteVote, "Binary Option Criteria");
    });
  },

  actions: {
    saveVote: function() {
      this.closeAllModals();
      if(this.promptBeforeVoting()) {
        return;
      }
      let deleteVote = (this.get('bin') === this.get('currentBinVoteValue'));

      let binVoteData = this.binVoteData(this.get('bin'), this.get('option'), this.get('criterion'));

      // if editing an existing binVote
      let currentBinVote = this.get('currentBinVote');
      return this.saveBinVote(binVoteData, currentBinVote, deleteVote, "Likert Option Criteria");
    },

    saveBinaryVotes(bin) {
      if(this.promptBeforeVoting()) {
        return;
      }
      bin = (bin > 0) ? this.get('binCount') : 0;
      return this.saveBinaryVotes(bin, this.get('option'));
    },
    toggleBinaryOne(bin) {
      if(this.promptBeforeVoting()) {
        return;
      }

      let thisOption = this.get('option');
      if(bin > 0) {
        bin = this.get('binCount');
      } else {
        bin = 0;
      }

      let options = this.get('option.optionCategory.options');
      options.forEach((option) => {
        if(option.get('id') === thisOption.get('id')) {
          return this.saveBinaryVotes(bin, option);
        } else {
          // always delete other votes to enforce pick one
          return this.saveBinaryVotes(0, option);
        }
      });
    }
  }
});
