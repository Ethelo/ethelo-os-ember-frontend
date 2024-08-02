import BasePage from 'frontend/mixins/base-page';

export default Ember.Component.extend(BasePage, {

  i18n: Ember.inject.service(),

  showTaxAssessmentPanel: Ember.computed.alias('page.assessmentPanelEnabled'),
});
