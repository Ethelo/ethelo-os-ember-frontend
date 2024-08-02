import DS from 'ember-data';

export default DS.Model.extend({
  decision: DS.belongsTo('decision', {
    async: false
  }),

  enableAssessment: DS.attr('boolean', {defaultValue: false}),
  defaultAssessment: DS.attr('number'),
  commercialAssessment: DS.attr('number'),
  showTotalTaxChart: DS.attr('boolean', {defaultValue: true}),
  showMunicipalTaxChart: DS.attr('boolean', {defaultValue: true}),
  addCategoriesToMunicipal: DS.attr('boolean', {defaultValue: true}),
  dynamicCharts: DS.attr('boolean', {defaultValue: true}),
  municipalTaxRate: DS.attr('number'),
  commercialTaxRate: DS.attr('number'),
  totalMunicipalRevenue: DS.attr('number'),
  totalTaxesList: DS.attr('array'),
  municipalTaxesList: DS.attr('array'),
  questionSlug: DS.attr('string'),
  propertyQuestionSlug: DS.attr('string'),
  defaultTaxSlug: DS.attr('string'),
  adjustedTaxSlug: DS.attr('string'),
  defaultFlatFeeSlug: DS.attr('string'),
  adjustedFlatFeeSlug: DS.attr('string'),
  taxTotalDifferenceSlug: DS.attr('string'),
  adjustedTaxTotalSlug: DS.attr('string'),
  defaultTaxTotalSlug: DS.attr('string'),
  finalAdjustedTaxTotalSlug: DS.attr('string'),
  finalDefaultTaxTotalSlug: DS.attr('string'),
  adjustedFlatFeeTotalSlug: DS.attr('string'),
  defaultFlatFeeTotalSlug: DS.attr('string')

});
