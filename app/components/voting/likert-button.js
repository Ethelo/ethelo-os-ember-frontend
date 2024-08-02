import BinVoteInfluent from 'frontend/mixins/bin-vote-influent';

export default Ember.Component.extend(BinVoteInfluent, {
  tagName: 'li',
  classNames: ['ethelo-likert-button-container'],
  classNameBindings: ['isActive:active', 'showSubtext:subtext', 'binClass'],

  isActive: Ember.computed('bin', 'currentBinVoteValue', function() {
    return this.get('bin') === this.get('currentBinVoteValue');
  }),
  binClass: Ember.computed('bin', function(){
    return `bin${this.get('bin')}`;
  }),
  showSubtext: Ember.computed('bin', 'binCount', 'neutralBin', function() {
    const bin = this.get('bin');
    const binsToShowSubText= [1, this.get('neutralBin'), this.get('binCount')];
    if(this.get('binCount') % 2 === 0){
      const neutralBin = Math.floor((this.get('binCount') + 1) / 2);
      binsToShowSubText.push(neutralBin);
    }
    return binsToShowSubText.includes(bin);
  }),
  voteBackgroundClass: Ember.computed('bin', function() {
    return this.backgroundClassFor(this.binNameFor(this.get('bin')));
  }),
  captionKey: Ember.computed('bin', function() {
    return this.captionKeyForBin(this.get('bin'), 'support');
  }),

});
