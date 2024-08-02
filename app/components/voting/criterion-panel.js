import Formatter from 'frontend/utils/formatters';
import Registry from 'frontend/mixins/registry';
import BinVoteInfluent from 'frontend/mixins/bin-vote-influent';
import Modals from "frontend/mixins/modals";

export default Ember.Component.extend(Registry, Modals, BinVoteInfluent, {

  panelId: Ember.computed('page.componentId', 'criterion.slug', function() {
    return Formatter.cssId(this.get('criterion.slug') + '-' + this.get('page.componentId'));
  }),

  criterionLinks: Ember.computed.filterBy('registry.decisionUser.editLinks', 'type', 'criteria'),

  editLink: Ember.computed('criterionLinks.[]', 'criterion.id', function() {
    return this.get('criterionLinks').findBy('target.id', this.get('criterion.id'));
  }),
});
