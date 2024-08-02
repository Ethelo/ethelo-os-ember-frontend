import Ember from 'ember';

export function formatHtmlId(strings/*, hash*/) {
  var [name] = strings;

  if (!name) {
    return '';
  }

  return strings
    .filter(x => x)
    .map((string) => string.toLowerCase().dasherize())
    .join('-');
}

export default Ember.Helper.helper(formatHtmlId);
