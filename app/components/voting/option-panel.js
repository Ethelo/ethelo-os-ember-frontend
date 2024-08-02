import Formatter from 'frontend/utils/formatters';
import Registry from 'frontend/mixins/registry';
import BinVoteInfluent from 'frontend/mixins/bin-vote-influent';
import Modals from "frontend/mixins/modals";

export default Ember.Component.extend(Registry, Modals, BinVoteInfluent, {
  panelId: Ember.computed('page.componentId', 'option.slug', function () {
    return Formatter.cssId(this.get('option.slug') + '-' + this.get('page.componentId'));
  }),
  hasMultipleCriteria: Ember.computed('criteria.[]', function() {
    return this.get('criteria').get('length') > 1;
  }),
  criteriaIds: Ember.computed('criteria.[]', function() {
    return this.get('criteria').mapBy('id');
  }),
  collapseOptions: Ember.computed.alias('page.settings.collapse-options'),

  optionLinks: Ember.computed.filterBy('registry.decisionUser.editLinks', 'type', 'option'),

  editLink: Ember.computed('optionLinks.[]', 'option.id', function () {
    return this.get('optionLinks').findBy('target.id', this.get('option.id'));
  }),
  participantHasVoted: Ember.computed('currentUserBinVotes.@each.bin',
    'currentUserBinVotes.@each.updatedAt',
    'currentUserBinVotes.@each.deleteVote',
    'option.id',
    'criteriaIds.[]',
    function () {
    const optionIds = [this.get('option.id')];
    const criteriaIds = this.get('criteriaIds');
    let vote = this.currentBinVotesFor(optionIds, criteriaIds);
    vote = vote.filter(binVote => !binVote.get("invalidVote"));
    return vote.length > 0 ? true : false;
  }),
});
