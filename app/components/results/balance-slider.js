import bootstrapSlider from 'frontend/components/tool/bootstrap-slider';
import Registry from 'frontend/mixins/registry';
import Formatter from 'frontend/utils/formatters';
import BalanceTools from 'frontend/mixins/balance-tools';
import TaxTools from 'frontend/mixins/tax-tools';

export default bootstrapSlider.extend(Registry, TaxTools, BalanceTools, {
  i18n: Ember.inject.service(),
  classNames: ['balance-slider'],
  previousClass: null,
  inputId: 'balance-slider',
  showTitle: true,
  balanceState: Ember.computed('calculation.value', 'balanceMin', 'balanceMax', function() {
    return this.balanceText(this.get('calculation.value'), this.get('balanceMin'), this.get('balanceMax'));
  }),

  sliderValue: Ember.computed('calculation.value', function() {
    if (Em.isEmpty(this.get('calculation.value'))) {
      return null;
    }
    const adjusted = this.adjustedCalculationData(this.get('calculation')) || {};
    return adjusted.value;
  }),
  sliderFormat: Ember.computed.alias('calculation.format'),
  sliderMessage: Ember.computed('messageCalculation.value', 'balanceState', function() {
    this.get('messageCalculation.value'); // watch
    const adjusted = this.adjustedCalculationData(this.get('messageCalculation')) || {};
    let value = adjusted.value;

    const balanceState = this.get('balanceState');
    const attribute = this.formatValue(value, this.get('messageCalculation.format'));
    const abs = this.formatValue(Math.abs(value), this.get('messageCalculation.format'));
    const suffix = this.get('translationSuffix');
    if (balanceState === 'deficit') {
      return this.get('i18n').t(`sidebars.balance.deficit${suffix}`, {attribute: attribute, abs_attribute: abs});
    } else if (balanceState === 'balanced') {
      return this.get('i18n').t(`sidebars.balance.balanced${suffix}`, {attribute: attribute, abs_attribute: abs});
    }
    return this.get('i18n').t(`sidebars.balance.surplus${suffix}`, {attribute: attribute, abs_attribute: abs});
  }),
  sliderId: Ember.computed('translationSuffix', function(){
    return `balance-bar${this.get('translationSuffix')}`;
  }),
  sliderClass: Ember.computed('balanceState', function() {
    const balanceState = this.get('balanceState');

    if (balanceState === 'deficit') {
      return 'deficit-slider';
    } else if (balanceState === 'balanced') {
      return 'balanced-slider';
    }
    return 'surplus-slider';
  }),

  formatValue(value, format) {
    if (Em.isEmpty(format)) {
      format = this.get('sliderFormat');
    }

    if (Ember.isEmpty(value) || !Formatter[format]) {
      return value;
    }

    return Formatter[format](value, this.get('i18n'));
  },

  formatValue2(value, format) {
    if (Em.isEmpty(format)) {
      format = this.get('slider2Format');
    }

    if (Ember.isEmpty(value) || !Formatter[format]) {
      return value;
    }

    return Formatter[format](value, this.get('i18n'));
  },

  sliderConfig(){
    let min = this.get('min');
    let max = this.get('max');
    let balanceMin = this.get('balanceMin');
    let balanceMax = this.get('balanceMax');
    let balancePoint = this.get('balancePoint');

    if (this.isAdjustableDetail(this.get('calculation.slug'))) {
      min = this.assessmentAdjustedValue(min);
      max = this.assessmentAdjustedValue(max);
      balanceMin = this.assessmentAdjustedValue(balanceMin);
      balanceMax = this.assessmentAdjustedValue(balanceMax);
      balancePoint = this.assessmentAdjustedValue(balancePoint);
    }

    let precision = 0;
    if (['dollars_and_cents', 'percent', 'number_with_decimals', 'money'].includes(this.get('sliderFormat'))) {
      precision = 2;
    }
    if (['percent_with_decimals'].includes(this.get('sliderFormat'))) {
      precision = 4;
    }

    const config = {
      id: 'display-' + this.get('inputId'),
      class: 'balance-slider-display',
      min,
      max,
      value: this.get('sliderValue'),
      rangeHighlights: [
        {start: min, end: balanceMin, class: "deficit"},
        {start: balanceMin, end: balanceMax, class: "balanced"},
        {start: balanceMax, end: max, class: "surplus"},
      ],
      precision: precision,
      ticks: [balancePoint],
      tooltip: 'always',
      formatter: this.formatValue.bind(this),
      enabled: false,
    };

    return config;
  },

  didInsertElement: function didInsertElement() {
    this.setupSlider();
  },

  setupSlider() {
    if (Em.isEmpty(this.$('#' + this.get('inputId')))) {
      return;
    }

    let config = this.sliderConfig();

    this.$('#' + this.get('inputId')).slider(config);

     let value = this.get('sliderValue');
      if( Em.isNone(value)){
        value = 0;
      }
      this.$('#' + this.get('inputId')).slider('setValue', value);
      this.$('.tooltip-inner').addClass('primary-accent-bg');

  },

  updateSlider: Ember.observer('calculation.value', 'currentTaxState', function() {
    this.get('calculation.value');
    this.get('currentTaxState'); // observe
    this.setupSlider();
  }),

});
