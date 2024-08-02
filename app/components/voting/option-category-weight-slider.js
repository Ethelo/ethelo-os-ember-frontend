import bootstrapSlider from 'frontend/components/tool/bootstrap-slider';
import optionCategoryWeightInfluent from 'frontend/mixins/option-category-weight-influent';

export default bootstrapSlider.extend(optionCategoryWeightInfluent, {
  classNames: ['weighting-slider'],
  previousClass: null,
  showDragHint: false,
  inputId: Ember.computed('optionCategory.id', function() {
    return `oc-slider-${this.get('optionCategory.id')}`;
  }),
  canRemoveValue: false,
  defaultValue: Ember.computed('optionCategory.weighting', function(){
    return this.get('optionCategory.weighting') || 50;
  }),
  value: Ember.computed.alias('currentOptionCategoryWeightValue'),
  promptBeforeSave(){
    return this.promptBeforeVoting();
  },
  saveValue() {
    this.send('saveWeighting', this.get('value'), this.get('optionCategory'));
  },
  setDefaultStyles() {
    this.$('.tooltip').removeClass('hide');
    this.$('.tooltip-inner').css({padding: '3px 95px'});
  },
  setSelectedStyles() {
    this._super();
    this.$('.tooltip').addClass('hide'); // no tooltips for input slider
  },
  tooltip() {
    return '';
  },
  layoutName: 'components/tool/bootstrap-slider',
});
