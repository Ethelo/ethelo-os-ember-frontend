import Registry from 'frontend/mixins/registry';
import SurveyTools from 'frontend/mixins/survey-tools';
import Formatter from 'frontend/utils/formatters';

export default Ember.Mixin.create(Registry, SurveyTools, {
  taxAssessment: Ember.computed.alias('registry.decision.taxAssessment'),
  allQuestions: Ember.computed(function() {
    return this.get('store').peekAll('question');
  }),
  allDetails: Ember.computed(function() {
    return this.get('store').peekAll('option-detail');
  }),
  allCalculations: Ember.computed(function() {
    return this.get('store').peekAll('scenario-calculation');
  }),
  allOptions: Ember.computed(function() {
    return this.get('store').peekAll('option');
  }),
  assessmentQuestion: Ember.computed('allQuestions.[]', 'taxAssessment.questionSlug', function() {
    let slug = this.get('taxAssessment.questionSlug');
    return this.get('allQuestions').find(function(question) {
      return question.get('slug') === slug;
    });
  }),
  propertyTypeQuestion: Ember.computed('allQuestions.[]', 'taxAssessment.propertyQuestionSlug', function() {
    let slug = this.get('taxAssessment.propertyQuestionSlug');
    return this.get('allQuestions').find(function(question) {
      return question.get('slug') === slug;
    });
  }),
  defaultTaxDetail: Ember.computed('allDetails.[]', 'taxAssessment.defaultTaxSlug', function() {
    return this.detailMatchingSlug(this.get('taxAssessment.defaultTaxSlug'));
  }),
  adjustedTaxDetail: Ember.computed('allDetails.[]', 'taxAssessment.adjustedTaxSlug', function() {
    return this.detailMatchingSlug(this.get('taxAssessment.adjustedTaxSlug'));
  }),
  adjustedFlatFeeTotalCalculation: Ember.computed('allCalculations.[]', 'taxAssessment.adjustedFlatFeeTotalSlug', function() {
    return this.calculationMatchingSlug(this.get('taxAssessment.adjustedFlatFeeTotalSlug'));
  }),
  defaultFlatFeeTotalCalculation: Ember.computed('allCalculations.[]', 'taxAssessment.defaultFlatFeeTotalSlug', function() {
    return this.calculationMatchingSlug(this.get('taxAssessment.defaultFlatFeeTotalSlug'));
  }),
  calculationMatchingSlug: function(slug) {
    return this.get('allCalculations').find(function(calculation) {
      return calculation.get('slug') === slug;
    });
  },
  detailMatchingSlug: function(slug) {
    return this.get('allDetails').find(function(detail) {
      return detail.get('slug') === slug;
    });
  },

  formatValue(value, format) {

    if(Ember.isNone(value) || !Formatter[format]) {
      return value;
    }

    return Formatter[format](value, this.get('i18n'));

  },
  isAdjustableDetail: function(slug) {
    if(Em.isEmpty(slug)) {
      return false;
    }
    return slug === this.get('adjustedTaxDetail.slug') || slug === this.get('defaultTaxDetail.slug');
  },

  currentTaxState: Ember.computed('customAssessmentValue', 'currentDefaultAssessment', 'currentPropertyType',
    function() {
      return this.get('customAssessmentValue').toString() + this.get('currentPropertyType').toString();
    }),

  customAssessmentValue: Ember.computed(
    'currentUserSurveyResponses.@each.value',
    'currentUserSurveyResponses.@each.updatedAt',
    'assessmentQuestion.id',
    'currentDefaultAssessment',
    'currentPropertyType',
    function() {
      let currentUserSurveyResponses = this.get('currentUserSurveyResponses');
      let questionId = this.get('assessmentQuestion.id');
      let current = currentUserSurveyResponses.find(function(response) {
        return String(response.get('question.id')) === String(questionId);
      });
      if(Em.isEmpty(current) || current.get('value') === null) {
        return this.get('currentDefaultAssessment');
      } else {
        let value = current.get('value').toString().replace(/[^0-9\.]/g, '');
        value = parseFloat(value);
        if(isNaN(value)) {
          return this.get('currentDefaultAssessment');
        } else {
          return value;
        }
      }
    }),
  currentDefaultAssessment: Ember.computed(
    'currentPropertyType',
    'taxAssessment.commercialAssessment',
    'taxAssessment.defaultAssessment',
    function() {
      if(this.get('currentPropertyType') === 'commercial') {
        return this.get('taxAssessment.commercialAssessment') || this.get('taxAssessment.defaultAssessment');
      } else {
        return this.get('taxAssessment.defaultAssessment');
      }
    }),
  currentPropertyType: Ember.computed(
    'currentUserSurveyResponses.@each.value',
    'currentUserSurveyResponses.@each.updatedAt',
    'propertyTypeQuestion.id',
    function() {
      let currentUserSurveyResponses = this.get('currentUserSurveyResponses');
      let questionId = this.get('propertyTypeQuestion.id');
      let current = currentUserSurveyResponses.find(function(response) {
        return String(response.get('question.id')) === String(questionId);
      });
      if(Em.isEmpty(current) || current.get('value') === null) {
        return 'residential';
      } else {
        let value = current.get('value').toString();
        return value === 'commercial' ? 'commercial' : 'residential';
      }
    }),

  adjustedCalculationsData(calculations) {
    let that = this;
    let adjusted = calculations.map((calculation) => {
        return that.adjustedCalculationData(calculation);
      }
    );

    return adjusted.sortBy('sort');
  },

  adjustedCalculationData(calculation) {
    if(Em.isEmpty(calculation)) {
      return null;
    }
    let slugs = [
      this.get('taxAssessment.taxTotalDifferenceSlug'),
      this.get('taxAssessment.adjustedTaxTotalSlug'),
      this.get('taxAssessment.defaultTaxTotalSlug'),
      this.get('taxAssessment.finalDefaultTaxTotalSlug'),
      this.get('taxAssessment.finalAdjustedTaxTotalSlug')
    ];

    let data = Ember.copy(calculation.get('dataRow'));
    if(slugs.includes(data.slug)) {
      let flatFee = 0;
      if(data.slug === this.get('taxAssessment.finalDefaultTaxTotalSlug')) {
        flatFee = this.get('defaultFlatFeeTotalCalculation.value');
      }
      if(data.slug === this.get('taxAssessment.finalAdjustedTaxTotalSlug')) {
        flatFee = this.get('adjustedFlatFeeTotalCalculation.value');
      }
      let adjusted = this.residentialToCurrentAssessment(data.value - flatFee) + flatFee;
      Ember.set(data, 'value', adjusted);
    }
    return data;
  },

  currentTaxRate: Ember.computed('currentPropertyType', function() {
    if(this.get('currentPropertyType') === 'commercial') {
      return this.get('taxAssessment.commercialTaxRate');
    } else {
      return this.get('taxAssessment.municipalTaxRate');
    }
  }),

  hasPropertyTaxType: Ember.computed('taxAssessment.commercialTaxRate', 'propertyTypeQuestion.id', function() {
    if(Em.isEmpty(this.get('propertyTypeQuestion.id'))) {
      return false;
    }
    let taxRate = this.get('taxAssessment.commercialTaxRate');
    return !Em.isEmpty(taxRate) && taxRate > 0;
  }),

  categoriesTaxData: Ember.computed('assessmentCategories.[]', 'currentTaxRate', 'currentDefaultAssessment', function() {
    this.get('currentTaxRate'); // observe
    this.get('currentDefaultAssessment'); // observe

    let assessmentCategories = this.get('assessmentCategories');
    let that = this;
    return assessmentCategories.map(function(oc) {
      return that.categoryTaxConfig(oc);
    });
  }),

  categoryTaxConfig(optionCategory) {

    let budgetPercent = parseFloat(optionCategory.get('budgetPercent')) / 100;
    if(isNaN(budgetPercent)) {
      budgetPercent = 0;
    }
    let flatFee = parseFloat(optionCategory.get('flatFee'));
    if(isNaN(flatFee)) {
      flatFee = 0;
    }

    let percentModifier = budgetPercent * this.get('currentTaxRate');

    return {
      caption: optionCategory.get('resultsLabel'),
      assessmentPercent: percentModifier,
      flatFee: flatFee,
    };
  },

  allOptionCategories: Ember.computed(function() {
    return this.get('store').peekAll('option-category');
  }),
  assessmentCategories: Ember.computed('allOptionCategories.[]', function() {
    return this.get('allOptionCategories').filter(function(optionCategory) {

      let flat = !(Ember.isEmpty(optionCategory.get('flatFee')) || optionCategory.get('flatFee') <= 0);

      let percent = !(Ember.isEmpty(optionCategory.get('budgetPercent')) || optionCategory.get('budgetPercent') <= 0);

      return flat || percent;
    });
  }),

  residentialToCurrentAssessment: function(residential) {
    let residentialDefault = this.get('taxAssessment.defaultAssessment');
    let base;

    if(this.get('currentPropertyType') === 'commercial') {
      //com amount = (res amount / res rate ) / (res default / ( com default * com rate ) )
      let residentialAdjustment = residential / this.get('taxAssessment.municipalTaxRate');
      let commercialAdjustment = this.get('taxAssessment.commercialAssessment') * this.get('taxAssessment.commercialTaxRate');
      base = residentialAdjustment / (residentialDefault / commercialAdjustment);
    } else {
      base = residential;
    }

    let customAssessmentAdjustment = (this.get('currentDefaultAssessment') / this.get('customAssessmentValue'));
    if(customAssessmentAdjustment <= 0) {
      customAssessmentAdjustment = 1;
    }
    customAssessmentAdjustment = customAssessmentAdjustment.toFixed(6);

    return base / customAssessmentAdjustment;
  },


});
