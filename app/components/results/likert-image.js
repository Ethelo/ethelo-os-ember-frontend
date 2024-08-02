import InfluentTools from 'frontend/mixins/influent-tools';
import BinVoteInfluent from 'frontend/mixins/bin-vote-influent';

export default Ember.Component.extend(InfluentTools, BinVoteInfluent,{
  value: null,
  format: null,
  size: null,
  color: null,
  activeBinArray: Ember.computed('activeBinCount', function(){
    let activeBinCount = this.get('activeBinCount');
    if( activeBinCount < 1){
      return [];
    } else {
      return new Array(activeBinCount).fill(0);
    }
  }),
  activeBinCount: Ember.computed('binCount', 'value', function() {
    let value = this.get('value');
    value = parseFloat(value);
    if(isNaN(value)){
      return 0;
    }

    let rescaledValue = this.rescaleToBin(value, this.get('format'));
    rescaledValue = parseInt(rescaledValue);

    if(isNaN(rescaledValue)){
      return 0;
    } else {
      return rescaledValue;
    }
  }),
  tooltip: Ember.computed('activeBinCount', 'value', function(){
    let value = this.get('value');
    value = parseFloat(value);
    let captionKey = this.captionKeyForBin(this.get('activeBinCount'), this.get('format'), true);
    let percent = '-';
    if(isNaN(value) || Ember.isEmpty(value)){
      percent =  '-';
    } else {
      percent = this.rescaleToPercent(value, this.get('format'));
    }
    return `${this.get('i18n').t(captionKey)} ${percent}%`;
  }),
  inactiveBinArray: Ember.computed('inactiveBinCount', function(){
    let inactiveBinCount = this.get('inactiveBinCount');
    if( inactiveBinCount < 1){
      return [];
    } else {
      return new Array(inactiveBinCount).fill(0);
    }
  }),
  inactiveBinCount: Ember.computed('activeBinCount', 'binCount', function(){
    return this.get('binCount') - this.get('activeBinCount');
  })
});
