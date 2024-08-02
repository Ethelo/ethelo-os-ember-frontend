import Registry from 'frontend/mixins/registry';
const {underscore} = Ember.String;

export default Ember.Mixin.create(Registry, {
  allBinVotes: Ember.computed(function() {
    return this.get('store').peekAll('bin-vote');
  }),
  currentUserBinVotes: Ember.computed('allBinVotes.@each.bin', 'allBinVotes.@each.updatedAt', 'registry.decisionUser.id', function() {
    let decisionUserId = this.get('registry.decisionUser.id');
    return this.get('allBinVotes').filter(function(binVote) {
      //observing in case it makes a difference for observers
      binVote.get('bin');
      binVote.get('updatedAt');
      return binVote.get('decisionUser.id') === decisionUserId;
    });
  }),
  binCount: Ember.computed.alias('registry.decision.optionVoteBins'),
  neutralBin: Ember.computed('binCount', function() {
    return Math.ceil((this.get('binCount') + 1) / 2);
  }),
  defaultValue: Ember.computed.alias('neutralBin'),
  lowestPossibleScore: Ember.computed('registry.decision.supportOnly', function() {
    return this.get('registry.decision.supportOnly') ? 0 : -1;
  }),
  captionKeyForBin(binNumber, format, plural = false){
    let binName;
    if (binNumber === 'yes' || binNumber === 'no') {
      binName = binNumber;
    } else {
      binName = this.binNameFor(binNumber, this.get('binCount'));
    }
    if (plural && binName === 'no_vote') {
      binName = 'no_votes';
    }
    if (format === "support") {
      return underscore(`voting.${binName}_caption`);
    } else {
      return `results.metrics.${format.decamelize()}.${binName}_caption`;
    }
  },
  backgroundClassFor(binName){
    return `${binName}-color-bg`;
  },
  textClassFor(binName){
    return `${binName}-color-text`;
  },
  colorFor(binName){
    return this.get(`registry.decision.theme.${binName}Color`);
  },
  binNameFor(bin, scale = null){
    scale = Ember.isNone(scale) ? this.get('binCount') : scale;
    if (bin > 0) {
      let nineBinList = this.get(`nineBinConversion.show${scale}`);
      let nineBin = nineBinList[bin - 1];
      if (Ember.isEmpty(nineBin)) {
        return null;
      } else {
        return `bin${nineBin}`;
      }
    } else {
      return 'no_vote';
    }
  },
  nineBinNameFor(bin){
    if (bin > 0) {
      let nineBinList = this.get('nineBinConversion.show9');
      let nineBin = nineBinList[bin - 1];
      if (Ember.isEmpty(nineBin)) {
        return null;
      } else {
        return `bin${nineBin}`;
      }
    } else {
      return 'no_vote';
    }
  },

  rescaleVoterPercent(input, max, min = 0.001){
    return this.rescale(input, 0, 1, min, max);
  },
  rescaleApproval(input, max, min = 0.001){
    return this.rescale(input, 0, 1, min, max);
  },
  rescaleEthelo(input, max, min = 0.001){
    return this.rescale(input, -1, 1, min, max);
  },
  rescaleDissonance(input, max, min = 0.001){
    return this.rescale(input, 0, 1, min, max);
  },
  rescaleSupport(input, max, min = 0.001){
    return this.rescale(input, this.get('lowestPossibleScore'), 1, min, max);
  },

  rescaleToBin(input, format){

    let rescaledValue;

    switch (format) {
      case "support":
        rescaledValue = this.rescaleSupportToBin(input);
        break;
      case "voterPercent": // percent value
        rescaledValue = this.rescaleApprovalToBin(input);
        break;
      case "percent": // percent value
        rescaledValue = this.rescaleApprovalToBin(input);
        break;
      case "approval": // percent value
        rescaledValue = this.rescaleApprovalToBin(input);
        break;
      case "ethelo":
        rescaledValue = this.rescaleEtheloToBin(input);
        break;
      case "dissonance":
        rescaledValue = this.rescaleDissonanceToBin(input);
        break;
    }

    return rescaledValue;
  },

  rescaleToPercent(input, format, min = 0.001){

    let rescaledValue;

    switch (format) {
      case "voterPercent":
        rescaledValue = this.rescaleApprovalToPercent(input, min); //percent
        break;
      case "support":
        rescaledValue = this.rescaleSupportToPercent(input, min);
        break;
      case "approval":
        rescaledValue = this.rescaleApprovalToPercent(input, min);
        break;
      case "ethelo":
        rescaledValue = this.rescaleEtheloToPercent(input, min);
        break;
      case "dissonance":
        rescaledValue = this.rescaleDissonanceToPercent(input, min);
        break;
      case "percent":
        rescaledValue = this.rescaleApprovalToPercent(input, min); //percent
        break;

    }

    return rescaledValue;

  },

  rescaleApprovalToBin(input){
    return this.rescaleApproval(input, this.get('binCount'), 1).toFixed();
  },
  rescaleEtheloToBin(input){
    return this.rescaleEthelo(input, this.get('binCount'), 1).toFixed();
  },
  rescaleDissonanceToBin(input){
    return this.rescaleDissonance(input, this.get('binCount'), 1).toFixed();
  },
  rescaleSupportToBin(input){
    return this.rescaleSupport(input, this.get('binCount'), 1).toFixed();
  },
  rescaleApprovalToPercent(input, min = 0.001 ){
    return this.rescaleApproval(input, 100, min).toFixed();
  },
  rescaleEtheloToPercent(input, min = 0.001){
    return this.rescaleEthelo(input, 100, min).toFixed();
  },
  rescaleDissonanceToPercent(input, min = 0.001){
    return this.rescaleDissonance(input, 100, min).toFixed();
  },
  rescaleSupportToPercent(input, min = 0.001){
   return this.rescaleSupport(input, 100, min).toFixed();
  },

  rescale(input, inputLow, inputHigh, outputLow, outputHigh){
    if (input < inputLow) {
      input = inputLow;
    }

    if (input > inputHigh) {
      input = inputHigh;
    }

    let inputRange = inputHigh - inputLow;
    let inputDiff = input - inputLow;
    let outputRange = outputHigh - outputLow;
    return (inputDiff / inputRange) * (outputRange) + outputLow;

  },
  percentToBin(percent, scale = 9){
    let maxBins = scale - 1; // max bins allowed - 1 to account for array offset
    let binNum = maxBins;
    if (percent <= 0) {
      binNum = 0;
    } else if (percent <= 100) {
      binNum = Math.round(percent * maxBins / 100);
    } else if (percent > 100) {
      binNum = maxBins;
    }
    return binNum;
  },
  percentToBinName(percent, scale = 9){
    let bin = this.percentToBin(percent, scale);
    return this.binNameFor(bin, scale);
  },
  nineBinConversion: Ember.Object.create({
    show1: ['9'],
    show2: ['1', '9'],
    show3: ['1', '5', '9'],
    show4: ['1', '4', '6', '9'],
    show5: ['1', '3', '5', '7', '9'],
    show6: ['1', '2', '4', '6', '8', '9'],
    show7: ['1', '2', '3', '5', '7', '8', '9'],
    show8: ['1', '2', '3', '4', '6', '7', '8', '9'],
    show9: ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  })
});
