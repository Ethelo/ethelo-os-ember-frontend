import OptionPanel from './option-panel';

export default OptionPanel.extend({
  binaryBinVotes: Ember.computed('currentUserBinVotes.@each.bin', 'currentUserBinVotes.@each.updatedAt', 'option.id', 'criteria.[]', function() {
    const optionIds = [this.get('option.id')];
    const criteriaIds = this.get('criteriaIds');
    return this.currentBinVotesFor(optionIds, criteriaIds);
  }),
  binaryVoteValue: Ember.computed('binaryBinVotes.[]', function() {
    const binVote = this.get('binaryBinVotes.firstObject');
    return this.binaryVoteValueForBinVote(binVote);
  }),
  visibleDetails: Ember.computed.alias('option.visibleDetailValues'),
  titleDetails: Ember.computed('visibleDetails.[]', function() {
    return this.get('visibleDetails').slice(0, 2);
  }),
  details: Ember.computed('visibleDetails.[]', function() {
    return this.get('visibleDetails').slice(1);
  }),
  isCollapsed: Ember.computed('option', 'bottomPaneRequired', function() {
    const visibleDetails = this.get('visibleDetails');
    const hasVisibleDetails = window.innerWidth > 991 ? visibleDetails.length > 2 : visibleDetails.length > 1;

    return this.get('option.info') || this.get('bottomPaneRequired') || hasVisibleDetails;
  }),
});
