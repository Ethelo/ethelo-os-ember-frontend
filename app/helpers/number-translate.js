import Ember from 'ember';

export default Ember.Helper.extend({
  compute(value) {
    if (Ember.isArray(value)) {
      value = value[0] + "";
    }
    var changed =  moment.localeData().postformat(value);
    return changed;
  }
});
