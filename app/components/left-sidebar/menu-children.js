import Ember from "ember";
import LeftColumn from "frontend/mixins/left-column";

export default Ember.Component.extend(LeftColumn, {
  i18n: Ember.inject.service(),
  menu: Ember.inject.service(),
  namespace: '', // mobile vs regular
  page: Ember.computed.alias('item.page'),
  activeClass: Ember.computed('isCurrentPage', function() {
    return this.get('isCurrentPage') ? 'active' : '';
  }),
  isCurrentPage: Ember.computed('page.id', 'menu.currentPageId', function() {
    this.get('menu.currentPageId'); // observe
    this.get('page.id'); // observe
    return this.get('menu').isCurrentPage(this.get('page'));
  }),
  childIsCurrentPage: Ember.computed('item.childItems.[]', 'menu.currentPageId', function() {
    this.get('menu.currentPageId'); // observe
    const menu = this.get('menu');
    const childItems = this.get('item.childItems');
    let match = childItems.find(function(item) {
      return menu.isCurrentPage(item.page);
    });
    return !Em.isEmpty(match);
  }),
  dataParent: Ember.computed('parentId', function() {
    return '#' + this.get('parentId');
  }),
  panelId: Ember.computed('page.componentId', 'namespace', function() {
    return `${this.get('namespace')}${this.get('page.componentId')}-panel`;
  }),
  parentId: Ember.computed('panelId', function() {
    return `${this.get('panelId')}-parent`;
  }),
  linkId: Ember.computed('page.componentId', function() {
    return `${this.get('namespace')}${this.get('page.componentId')}-menulink`;
  }),
  didInsertElement() {
    this._super(...arguments);
    if (this.get("isCurrentPage") || this.get('childIsCurrentPage') ) {
      this.set('isCollapsed', false);
    }else {
      this.set('isCollapsed', this.get('page.beginCollapsed'));
    }
  },
  currentChanged: Ember.observer('isCurrentPage', 'childIsCurrentPage', function () {
    if (this.get("isCurrentPage") || this.get('childIsCurrentPage')) {
      this.set('isCollapsed', false);
    }
  }),
  isCollapsed: true,
  actions: {
    toggleCollapsed(e) {
      if(e && 'key' in e && e.key === 'Tab') {
        return;
      }

      // Only allow Enter/Spacebar key in accessibility to open/close the dropdown
      if(e && 'keyCode' in e && (e.keyCode === 13 || e.keyCode === 32)) {
        this.set('isCollapsed', !this.get('isCollapsed'));
        e.preventDefault();
      }
    },
  }
});
