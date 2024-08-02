import Ember from 'ember';

export function isFirst(params/*, hash*/) {
  return params[0] === 0;
}

export default Ember.Helper.helper(isFirst);
