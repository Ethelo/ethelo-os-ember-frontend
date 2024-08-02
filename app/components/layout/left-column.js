import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  editLink: Ember.computed('registry.decisionUser.editLinks.[]', function() {
    let links = this.get('registry.decisionUser.editLinks');
    if (Em.isEmpty(links)) {
      return null;
    } else {
      return links.findBy('type', 'menu');
    }
  }),
  showMenu: Ember.computed('page.menuVisibility', 'registry.user.guest', function(){
    let isGuest = this.get('registry.user.guest');
    let visibility = this.get('page.menuVisibility');

    if (visibility === 'authenticated') {
      return !isGuest;
    }
    return visibility !== 'hidden';
  })

});
