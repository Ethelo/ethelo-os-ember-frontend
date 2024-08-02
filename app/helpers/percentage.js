export default Ember.Helper.helper(function([decimal, withoutSign]) {
  if (Ember.isNone(decimal)) {
    return null;
  }

  if (decimal === null) {
    decimal = 0;
  }

  let result = (parseFloat(decimal) * 100).toFixed(0);

  result = moment.localeData().postformat(result);

  if (!withoutSign){
    return result + '%';
  }
  return result;

});
