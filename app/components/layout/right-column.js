import Registry from 'frontend/mixins/registry';
import BalanceTools from 'frontend/mixins/balance-tools';
import RightColumn from 'frontend/mixins/right-column';

export default Ember.Component.extend(Registry, BalanceTools, RightColumn, {
  editLink: Ember.computed('registry.decisionUser.editLinks.[]', function() {
    let links = this.get('registry.decisionUser.editLinks')
    if (Em.isEmpty(links)) {
      return null;
    } else {
      return links.findBy('type', 'personal_results');
    }
  }),
});
