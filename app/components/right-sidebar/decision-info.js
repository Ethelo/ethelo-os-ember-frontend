import ContentBlocks from 'frontend/mixins/content-blocks';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend(ContentBlocks, {
  tagName: '',
  // classNames: ['panel', 'panel-default'],
  panelId: Ember.computed('page.componentId', function(){
    return 'decision-info-' + this.get('page.componentId');
  }),
  beginCollapsed: Ember.computed('page.sidebars.[]', function(){
    this.get('page.sidebars'); //observe
    return t('sidebars.decision_info.title', {default: ['empty_default']}) !== '';
  }),
});
