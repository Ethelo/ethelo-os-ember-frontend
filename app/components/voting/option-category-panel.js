import Formatter from 'frontend/utils/formatters';
import Registry from 'frontend/mixins/registry';
import OptionCategoryRangeVoteInfluent from 'frontend/mixins/option-category-range-vote-influent';
import Modals from "frontend/mixins/modals";

export default Ember.Component.extend(Registry, OptionCategoryRangeVoteInfluent, Modals, {
  panelId: Ember.computed('page.componentId', 'optionCategory.slug', function() {
    return Formatter.cssId(this.get('optionCategory.slug') + '-' + this.get('page.componentId'));
  }),
  editLink: Ember.computed('optionCategoryLinks.[]', 'optionCategory.id', function() {
    return this.get('optionCategoryLinks').findBy('target.id', this.get('optionCategory.id'));
  }),
  optionCategoryLinks: Ember.computed.filterBy('registry.decisionUser.editLinks', 'type', 'option_category'),

});
