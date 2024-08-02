import questionForm from 'frontend/components/survey/question-form';
import TaxTools from 'frontend/mixins/tax-tools';

export default questionForm.extend( TaxTools, {
  question: Ember.computed.alias('propertyTypeQuestion'),
  editLink: null, //TODO link to tax assessment page

  actions: {
    selectRadio(value) {
      this.set('formValue', value);
      Ember.run.debounce(this, this.save, 500);

    },
  }
});
