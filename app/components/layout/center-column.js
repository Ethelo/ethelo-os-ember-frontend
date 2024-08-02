import RightColumn from 'frontend/mixins/right-column';

export default Ember.Component.extend(RightColumn, {
  editLink: Ember.computed('pageLinks.[]', 'page.id', function() {
    return this.get('pageLinks').findBy('target.id', this.get('page.id'));
  }),
  pageLinks: Ember.computed.filterBy('registry.decisionUser.editLinks', 'type', 'page'),

});
