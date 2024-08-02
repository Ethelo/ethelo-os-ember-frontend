import BasePage from 'frontend/mixins/base-page';
import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(BasePage, Registry, {
  allPages: Ember.computed(function() {
    return this.get('store').peekAll('page');
  }),
  childPages: Ember.computed('allPages.[]', 'page.id', function() {
    let parent = this.get('page.id');
    return this.get('allPages').filter(function(page) {
      return page.get('parent.id') === parent;
    });
  }),
});
