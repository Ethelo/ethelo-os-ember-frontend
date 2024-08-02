import BinVoteInfluent from 'frontend/mixins/bin-vote-influent';

export default Ember.Component.extend(BinVoteInfluent, {
  tagName: '',
  captionKeyNo: Ember.computed(function() {
    return this.captionKeyForBin('no', 'support');
  }),
  captionKeyYes: Ember.computed(function() {
    return this.captionKeyForBin('yes', 'support');
  }),
  actions: {
    saveVotes(likertBin){
      if(this.get("isBinaryOne")) {
        this.send("toggleBinaryOne", likertBin);
      } else {
        this.send("saveBinaryVotes", likertBin);
      }
    }
  }
});
