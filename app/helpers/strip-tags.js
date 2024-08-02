export default Ember.Helper.helper(
  (str) => {
    if( str != null) {
      return $(`<p>${str}</p>`).text().trim();
    }
    return false;
  }
);
