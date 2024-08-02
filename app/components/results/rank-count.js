export default Ember.Component.extend({
  total: null,
  current: null,
  i18n: Ember.inject.service(),
  currentScenario: Ember.computed("total", "current", function() {
    const current = this.get("current");
    this.get("total"); // watch
    let i18n = this.get("i18n");

    if (this.get('isPageFirst') && current === 1) {
      return i18n.t("results.nav.first").string;
    } else if (this.get('isPageLast')) {
      return i18n.t("results.nav.last").string;
    }

    if (Ember.typeOf(current) === 'string') {
      return i18n.t("results.nav.ordinal", {number: current.ordinalize()}).string;
    }
  }),
  isPageFirst: Ember.computed('current', function() {
    return parseInt(this.get('current')) === 1;
  }),
  isPageLast: Ember.computed('current','total', function() {
    return parseInt(this.get('current' )) === parseInt(this.get('total' )) - 1;
  })
});
