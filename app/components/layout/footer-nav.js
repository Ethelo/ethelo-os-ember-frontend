import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry,{
  activeSidebarView: Ember.computed.alias('menu.activeSidebarView'),
  tabbedContentSelected: Ember.computed('activeSidebarView', function() {
    var active = this.get('activeSidebarView');
    return (active === 'top_choice' || active === 'issue_comments');
  })
});
