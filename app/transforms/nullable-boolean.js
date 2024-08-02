import DS from 'ember-data';

export default DS.BooleanTransform.extend({
  deserialize(serialized) {
    return serialized === null ? null : this._super(serialized);
  },

  serialize: function(deserialized) {
    return deserialized === null ? null : this._super(deserialized);
  }
});
