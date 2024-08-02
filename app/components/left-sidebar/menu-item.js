import pageCompletion from 'frontend/mixins/page-completion';

export default Ember.Component.extend(pageCompletion, {
  i18n: Ember.inject.service(),
  menu: Ember.inject.service(),
  store: Ember.inject.service(),
  tagName: 'li',
  classNames: ['nav-item-container list-group-item no-padding'],
  toggleMenuProgress: Ember.computed.alias('registry.decision.theme.toggleMenuProgress'),
  activeClass: Ember.computed('isCurrentPage', function() {
    return this.get('isCurrentPage') ? 'active' : '';
  }),
  isCurrentPage: Ember.computed('page.id', 'menu.currentPageId', function() {
    this.get('menu.currentPageId'); // observe
    this.get('page.id'); // observe
    return this.get('menu').isCurrentPage(this.get('page'));
  }),
  namespace: '', // mobile vs desktop
  page: Ember.computed.alias('item.page'),
  divId: Ember.computed('page.componentId', function() {
    return `${this.get('namespace')}${this.get('page.componentId')}-menuitem`;
  }),
  linkId: Ember.computed('page.componentId', function() {
    return `${this.get('namespace')}${this.get('page.componentId')}-menulink`;
  }),
  linkClass: Ember.computed('page.nestingClass', function() {
    return ' with-ripple ' + this.get('page.nestingClass');
  }),
  combineLinkIdAndLinkClass: Ember.computed('linkId', 'linkClass', function() {
    return this.get('linkId') + ' ' + this.get('linkClass');
  }),

  pageIsDisabled: Ember.computed('progressChanged', 'menu.balanceBlocksNavigation', function() {
    this.get('menu.balanceBlocksNavigation'); // watch
    return this.get('menu').pageIsBlocked(this.get('page'));
  }),
  balanceBlocksItem: Ember.computed('page.requiresBalance', 'menu.balanceBlocksNavigation', function() {
    return (this.get('page.requiresBalance') && this.get('menu.balanceBlocksNavigation'));
  }),
  disabledMenuItemMessage: Ember.computed('balanceBlocksItem', 'pageIsDisabled', function() {
    if(!Ember.isEmpty(this.get('pageIsDisabled')) && this.get('pageIsDisabled')) {
      if(this.get('balanceBlocksItem')) {
        return this.get('i18n').t('sidebars.balance.blocked_menu');
      }
      return this.get('i18n').t('navigation.menu_bocked');
    }
    return "";
  }),
  progressIcon: Ember.computed('progressChanged',
    function() {
      let progressIconData = {
        className: "",
        iconName: "",
      };
      this.get('progressChanged');
      if(!this.get('toggleMenuProgress')) {
        return '';
      }

      let progress = this.progressStateFor(this.get('page'), 'progress');

      if(progress === 'n/a') {
        return '';
      } else if(progress === 'none') {
        // Page that was not interacted or totally incomplete page.
        progressIconData.className = 'incomplete';
        progressIconData.iconName = 'radio_button_unchecked';
      } else if(progress === 'complete') {
        // Full complete page.
        progressIconData.className = 'full-complete';
        progressIconData.iconName = 'task_alt';
      } else {
        // InProgress or Partial complete page.
        progressIconData.className = 'half-complete';
        progressIconData.iconName = 'schedule';
      }
      return progressIconData;
    }
  ),
  collapseChildren: true,


});
