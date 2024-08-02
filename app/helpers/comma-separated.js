export default Ember.Helper.helper(function([number]) {
  if (Ember.isNone(number)) {
    return null;
  }
  // precision of max 2 decimals
  var result = parseFloat(number).toFixed(2);
  result = result.replace(/(\..*?)0+$/, "$1").replace(/\.$/, '');
  result = result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  result = moment.localeData().postformat(result);

  return result;
});
