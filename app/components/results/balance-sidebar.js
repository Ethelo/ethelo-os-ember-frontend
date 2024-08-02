import BinVoteInfluent from 'frontend/mixins/bin-vote-influent';
import Registry from 'frontend/mixins/registry';
import BalanceTools from 'frontend/mixins/balance-tools';

export default Ember.Component.extend(BinVoteInfluent, Registry, BalanceTools, {
  i18n: Ember.inject.service(),
  rank: 1,
  enableAutoBalanceBtn: true,
  didInsertElement() {
    const showAutoBalance = this.get('showAutoBalance');
    if(!Ember.isEmpty(showAutoBalance)) {
      this.set('enableAutoBalanceBtn', showAutoBalance);
    }
  },
  actions: {
    toggleAutoBalance() {
      const deleteVote = this.get('balanceVoteValue') === 'yes';
      const bin = this.get('balanceVoteValue') === 'yes' ? 1 : this.get('binCount');
      const option = this.get('option');
      const criteria = this.get('allCriteria');

      criteria.forEach((criterion) => {
        this.set('criterion', criterion);

        const binVoteData = this.binVoteData(bin, option, criterion);

        const currentBinVote = this.currentBinVoteFor(option.get('id'), criterion.get('id'));

        return this.saveBinVote(binVoteData, currentBinVote, deleteVote, "AutoBalance Toggle");
      });
    },
  },
});
