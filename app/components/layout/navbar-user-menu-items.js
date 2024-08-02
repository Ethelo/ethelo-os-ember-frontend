import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  tagName: 'ul',
  classNames: ['dropdown-menu'],
  authService: Ember.inject.service('authentication'),

  mode: null,
  didInsertElement() {
    this._super(...arguments);
    document.querySelector('ul.dropdown-menu').setAttribute('aria-labelledby', 'user-dropdown');
  },
  findLink(type){
    let links = this.get('registry.decisionUser.editLinks');
    if (Em.isEmpty(links)) {
      return null;
    } else {
      return links.findBy('type', type);
    }

  },

  configureLink: Ember.computed('registry.decisionUser.editLinks.[]', function() {
    this.get('registry.decisionUser.editLinks'); // observe
    return this.findLink('configure');
  }),

  previewLink: Ember.computed('registry.decisionUser.editLinks.[]', function() {
    this.get('registry.decisionUser.editLinks'); // observe
    return this.findLink('preview');
  }),

  publishedLink: Ember.computed('registry.decisionUser.editLinks.[]', function() {
    this.get('registry.decisionUser.editLinks'); // observe
    return this.findLink('published');
  }),

  canSeeProfile: Ember.computed('registry.user', 'registry.user.guest', function(){
    let user = this.get('registry.user');
    let guest = this.get('registry.user.guest');
    return user && !guest;
  }),
});
