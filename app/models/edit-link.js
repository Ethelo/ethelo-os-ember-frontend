import DS from 'ember-data';
export default DS.Model.extend({
  type: DS.attr('string'),
  adminLink: DS.attr('string'),
  caption: DS.attr('string'),
  target: DS.belongsTo('comment-target', {
    async: false, inverse: null, polymorphic: true
  }),
});