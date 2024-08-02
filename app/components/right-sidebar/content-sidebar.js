import ContentBlocks from 'frontend/mixins/content-blocks';
import Formatter from 'frontend/utils/formatters';

export default Ember.Component.extend(ContentBlocks, {
  tagName: '',
  // classNames: ['panel', 'panel-default'],
  panelId: Ember.computed('page.componentId', 'key', function() {
    return Formatter.cssId(this.get('key') + '-' + this.get('page.componentId'));
  }),
  sidebarScope: Ember.computed('key', 'page.translationScope', function() {
    return this.get('page.translationScope') + '.' + this.get('key');
  }),
});
