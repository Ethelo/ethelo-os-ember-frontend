export const ordinal = function([count]) {
  if (Ember.isNone(count)) {
    return null;
  }

  var itemCount = parseInt(count);
  return ('' + itemCount).ordinalize();
};

export default Ember.Helper.helper(ordinal);
