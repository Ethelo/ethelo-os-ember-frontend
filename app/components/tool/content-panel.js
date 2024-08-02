import ContentBlocks from 'frontend/mixins/content-blocks';
import Formatter from 'frontend/utils/formatters';

export default Ember.Component.extend(ContentBlocks, {
  panelId: Ember.computed('page.componentId', 'key', function() {
    return Formatter.cssId(this.get('key') + '-' + this.get('page.componentId'));
  }),
  panelScope: Ember.computed('key', 'page.translationScope', function() {
    return this.get('page.translationScope') + '.' + this.get('key');
  }),
  alwaysHasPanel: false,
  content: Ember.computed('key', 'page.translationsScope', function() {
    this.get('page.translationScope'); // observe
    let key = this.get('key');
    let useDefault = this.get(`page.settings.${key}-content-html-default`);
    if (useDefault) {
      return this.get('page.dataSource.info'); //  default may be empty
    } else {
      return this.contentFor(`${key}.content_html`, this.get('page.translationScope'));
    }
  }),
  hasPanel: Ember.computed('content', 'alwaysHasPanel', function(){
    return !Em.isEmpty(this.get('content')) || this.get('alwaysHasPanel');
  })
});
