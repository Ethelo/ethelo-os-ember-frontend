import bootstrapSlider from 'frontend/components/tool/bootstrap-slider';
import OptionCategoryRangeVoteInfluent from 'frontend/mixins/option-category-range-vote-influent';
import TaxTools from 'frontend/mixins/tax-tools';
import Modals from "frontend/mixins/modals";

export default bootstrapSlider.extend(OptionCategoryRangeVoteInfluent, TaxTools, Modals, {
  classNames: ['pick-one-slider'],
  previousClass: null,
  didInsertElement() {
    this.setupSlider();
    let collapseId = this.get("collapseId");
    // re-render slider on collapse
    if(Em.isEmpty(collapseId)) {
      return;
    }

    $(`#${collapseId}`).on("click", () => {
      let that = this;
      setTimeout(() => {
        that.refreshSlider();
      }, 200);
    });
  },
  sliderTickDetail: Ember.computed('allDetails.[]', function() {
    return this.get('allDetails').find(function(detail) {
      return detail.get('slug') === 'slider-tick';
    });
  }),

  ticks: Ember.computed('sliderItems', 'currentTaxState', function() {
    this.get('currentTaxState'); //observe
    let items = Ember.copy(this.get('sliderItems'));
    let settings = {
      ticks: [],
      ticks_labels: [],
      sliderItems: []
    };
    let labels = this.get('sliderTickDetail.valuesByOptionId');
    let taxConfig = this.get('taxAssessment.enableAssessment') ?
      this.categoryTaxConfig(this.get('optionCategory')) : null;

    let label;
    let override;

    for(let i = 0; i < items.length; i++) {
      override = this.labelOverride(labels, items[i].id);
      if(override) {
        label = override;
      } else {
        if(this.get('taxAssessment.enableAssessment')) {
          label = this.taxAssessmentLabel(items[i], taxConfig);
        } else {
          label = this.formatValue(items[i].raw_value, items[i].format);
        }
      }
      let newSliderItem = items[i];
      newSliderItem["formattedValue"] = label;
      settings.ticks_labels.push(label);
      settings.ticks.push(i);
      settings.sliderItems.push({...newSliderItem});
    }

    return settings;
  }),

  taxAssessmentLabel: function(item, taxConfig) {
    let value;
    let flatFee;
    if(this.isAdjustableDetail(item.detail.get('slug'))) {
      value = this.residentialToCurrentAssessment(item.raw_value);
      flatFee = taxConfig['flatFee'];
    } else {
      value = this.get('currentDefaultAssessment') * taxConfig['assessmentPercent']; // use appropriate default value
      flatFee = item.raw_value;
    }

    return this.formatValue(value + flatFee, item.format);
  },

  defaultValue: Ember.computed('optionCategory.defaultLowOption', function() {
    let optionCategory = this.get('optionCategory');
    return optionCategory.optionIdToTick(optionCategory.get('defaultLowOption.id'));
  }),
  labelOverride: function(labels, optionId) {
    if(Em.isEmpty(labels) || Em.isNone(labels[optionId]) || Em.isEmpty(labels[optionId].value)) {
      return false;
    } else {
      return labels[optionId].value;
    }
  },

  tooltipFormatter: Ember.computed('sliderItems', function() {
    const items = this.get('sliderItems') || {};

    return function(value, e) {
      return Em.isEmpty(items[value]) ? '' : items[value].tooltip;
    };

  }),
  setSelectedStyles() {
    this._super(); // ember super call
    this.$('.tooltip-inner').removeAttr('style');
  },
  sliderConfig() {
    if(this.get('currentOptionCategoryRangeVote.deleteVote')) {
      this.set("value", null);
    }
    let config = this.get('ticks');
    config.formatter = this.get('tooltipFormatter').bind(this);
    config.id = `${this.get('inputId')}-slider`;
    config.value = this.get('sliderValue');

    return config;
  },
  name: Ember.computed.alias('inputId'),
  inputId: Ember.computed('optionCategory.id', function() {
    return 'ocrv-slider-' + this.get('optionCategory.id');
  }),
  nearestTick() {
    let items = this.get('sliderItems');
    return items[this.get('value')];
  },
  currentOptionCategoryVote: Ember.computed('currentOptionCategoryRangeVote', function() {
    const currentVote = this.get('currentOptionCategoryRangeVote');
    if(!Ember.isEmpty(currentVote) && !currentVote.get('deleteVote') && !Em.isEmpty(currentVote.get('lowOption'))) {
      return currentVote.get('lowOption');
    }
    return null;
  }),
  selectedOptionId: Ember.computed('currentOptionCategoryVote', function() {
    let currentVote = this.get('currentOptionCategoryVote');
    if(Ember.isEmpty(currentVote)) {
      return null;
    }
    return currentVote.get('id');
  }),
  voteButtonStyle: Ember.computed('selectedOptionId', function() {
    const selectedOptionId = this.get("selectedOptionId");
    if(Ember.isEmpty(selectedOptionId)) {
      return new Ember.String.htmlSafe(`background-color:#757575 ; color: white;`);
    }
    return new Ember.String.htmlSafe("");
  }),
  selectedOption: Ember.computed('sliderItems', 'value', function() {
    let nearest = this.nearestTick();
    let option;
    if(this.valuePresent(nearest)) {
      option = nearest['option'];
    } else {
      option = null;
    }
    return option;
  }),
  saveValue() {
    let option = this.get('selectedOption');
    this.send('saveRangeVote', option, option, this.get('optionCategory'));
  },
  modalId: Ember.computed('question.id', function(){
    return `${this.get('optionCategory.id')}-slider-mobile-modal`;
  }),
  promptBeforeSave(){
    return this.promptBeforeVoting();
  },
  actions: {
    saveVotingSliderValue(currentItem) {
      if (this.promptBeforeSave()){
        return false;
      }
      const lowAndHighOption = Ember.copy(currentItem);
      if(this.get('selectedOptionId') === lowAndHighOption.option.get('id')) {
        this.send('clearValue');
      } else {
        this.send('saveRangeVote', lowAndHighOption.option, lowAndHighOption.option, this.get('optionCategory'));
      }
      this.closeModal('#' + this.get('modalId'));
    }
  }
});
