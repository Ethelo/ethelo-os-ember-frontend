import questionForm from 'frontend/components/survey/question-form';
import TaxTools from 'frontend/mixins/tax-tools';

export default questionForm.extend( TaxTools, {
  taxAssessment: Ember.computed.alias('registry.decision.taxAssessment'),
  question: Ember.computed.alias('assessmentQuestion'),

  editLink: null, //TODO link to tax assessment page

  placeholder: Ember.computed.alias('currentDefaultAssessment'),
  saveBlank:true,

});
