import Registry from 'frontend/mixins/registry';
import BalanceTools from 'frontend/mixins/balance-tools';
import RightColumn from 'frontend/mixins/right-column';
import ParticipantResults from 'frontend/components/results/participant-results';

export default ParticipantResults.extend(Registry, BalanceTools, RightColumn, {
  editLink: Ember.computed('registry.decisionUser.editLinks.[]', function () {
    let links = this.get('registry.decisionUser.editLinks');
    if (Em.isEmpty(links)) {
      return null;
    } else {
      return links.findBy('type', 'personal_results');
    }
  }),

  // Overriding this as this page will not have RHS setting for balance bar
  showBalanceSidebar: Ember.computed('balanceEnabled', 'balance2Enabled', function () {
    return this.get('balanceEnabled') || this.get('balance2Enabled');
  }),
});
