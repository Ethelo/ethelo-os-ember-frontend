import BinVoteInfluent from 'frontend/mixins/bin-vote-influent';

export default Ember.Component.extend(BinVoteInfluent, {
  binList: Ember.computed(function () {
    let numChoices = this.get('binCount');
    let voteChoices = [];
    for (let i = 1; i <= numChoices; i++) {
      voteChoices.push(i);
    }
    return voteChoices;
  }),
  singleLikertButton: Ember.computed('binCount', function () {
    return this.get('binCount') === 1 ? true : false;
  }),
  singleLikertClass: Ember.computed('singleLikertButton', function () {
    if (this.get('singleLikertButton')) {
      return 'single';
    }
    return;
  }),
  criterionTitle: Ember.computed('criterion.title', function () {
    return this.get("criterion.title").toString().toUpperCase();
  }),
  condensedLikertStyle: Ember.computed('currentBinBackground', function () {
    const currentBinBackgroundColor = this.get("currentBinBackground");
    let backgroundColor = "#757575";
    if (!Ember.isEmpty(currentBinBackgroundColor)) {
      backgroundColor = currentBinBackgroundColor;
    }
    return new Ember.Handlebars.SafeString(`background-color:${backgroundColor} ; color: white;`);
  }),
  condensedModalId: Ember.computed('option.id', 'criterion.id', function() {
    return `${this.get('option.id')}-${this.get('criterion.id')}-modal`;
  }),
  actions: {
    openCondensedModal() {
      if(this.promptBeforeVoting()) {
        return;
      }
      $(`#${this.get('condensedModalId')}`).modal('show');
    },
  }
});
