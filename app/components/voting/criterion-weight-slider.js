import bootstrapSlider from 'frontend/components/tool/bootstrap-slider';
import criterionWeightInfluent from 'frontend/mixins/criterion-weight-influent';

export default bootstrapSlider.extend(criterionWeightInfluent, {
  classNames: ['weighting-slider'],
  previousClass: null,
  showDragHint: false,
  defaultValue: Ember.computed('criterion.weighting', function(){
    return this.get('criterion.weighting') || 50;
   }),
  value: Ember.computed.alias('currentCriterionWeightValue'),
  canRemoveValue: false,
  inputId: Ember.computed('criterion.id', function(){
    return 'oc-slider-'  + this.get('criterion.id');
  }),
  tooltip(){
    return '';
  },
  name: Ember.computed.alias('inputId'),
  setDefaultStyles(){
    this.$('.tooltip').removeClass('hide');
    this.$('.tooltip-inner').css({padding: '3px 95px'});
    },
  setSelectedStyles() {
    this._super();
    this.$('.tooltip').addClass('hide'); // no tooltips for input slider
  },
  promptBeforeSave(){
    return this.promptBeforeVoting();
  },
  saveValue(){
    this.send('saveWeighting', this.get('value'), this.get('criterion'));
  },

  layoutName: 'components/tool/bootstrap-slider',
});
