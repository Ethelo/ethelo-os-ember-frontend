import BinVoteInfluent from 'frontend/mixins/bin-vote-influent';
import Registry from 'frontend/mixins/registry';
import ResultBreakdown from 'frontend/mixins/result-breakdown';

export default Ember.Mixin.create(BinVoteInfluent, Registry, ResultBreakdown,
  {
    allOptions: Ember.computed(function() {
      return this.get('store').peekAll('option');
    }),

    // rank and user configuration for scenario
    rank: 1,
    withUser: true,

    balanceEnabled: Ember.computed('balanceSettings.balance-enabled', 'calculation1', function() {
      return !!(this.get('balanceSettings.balance-enabled') && this.get('calculation1'));
    }),

    balance2Enabled: Ember.computed('balanceSettings.balance2-enabled', 'calculation2', function() {
      return !!(this.get('balanceSettings.balance2-enabled') && this.get('calculation2'));
    }),

    balanceConfig: Ember.computed('calculation1', 'messageCalculation1', function() {
      return {
        calculation: this.get('calculation1'),
        messageCalculation: this.get('messageCalculation1'),
        enabled: this.get('balanceEnabled'),
        min: this.get('balanceSettings.sidebar-min'),
        max: this.get('balanceSettings.sidebar-max'),
        balanceMin: this.get('balanceSettings.balance-min'),
        balanceMax: this.get('balanceSettings.balance-max'),
        balancePoint: this.get('balanceSettings.balance-point'),
        translationSuffix: '',
      };
    }),

    balance2Config: Ember.computed('calculation2', 'messageCalculation2', function() {
      return {
        calculation: this.get('calculation2'),
        messageCalculation: this.get('messageCalculation2'),
        enabled: this.get('balance2Enabled'),
        min: this.get('balanceSettings.sidebar2-min'),
        max: this.get('balanceSettings.sidebar2-max'),
        translationSuffix: '2',
        balanceMin: this.get('balanceSettings.balance2-min'),
        balanceMax: this.get('balanceSettings.balance2-max'),
        balancePoint: this.get('balanceSettings.balance2-point'),
      };
    }),

    calculation1: Ember.computed('scenario.calculations.@each.value', 'balanceSettings.reference-calculation-slug', function() {
      const slug = this.get('balanceSettings.reference-calculation-slug');

      return (this.get('scenario.calculations') || []).find(function(calculation) {
        return calculation.get('slug') === slug;
      });
    }),
    messageCalculation1: Ember.computed('scenario.calculations.@each.value', 'balanceSettings.message-calculation-slug', function() {
      const slug = this.get('balanceSettings.message-calculation-slug');

      return (this.get('scenario.calculations') || []).find(function(calculation) {
        return calculation.get('slug') === slug;
      });
    }),
    calculation2: Ember.computed('scenario.calculations.@each.value', 'balanceSettings.reference-calculation2-slug', function() {
      const slug = this.get('balanceSettings.reference-calculation2-slug');

      return (this.get('scenario.calculations') || []).find(function(calculation) {
        return calculation.get('slug') === slug;
      });
    }),
    messageCalculation2: Ember.computed('scenario.calculations.@each.value', 'balanceSettings.message-calculation2-slug', function() {
      const slug = this.get('balanceSettings.message-calculation2-slug');

      return (this.get('scenario.calculations') || []).find(function(calculation) {
        return calculation.get('slug') === slug;
      });
    }),
    autoBalanceOption: Ember.computed('allOptions.[]', 'balanceSettings.auto-balance-option-slug', function() {
      const slug = this.get('balanceSettings.auto-balance-option-slug');
      return this.get('allOptions').find(function(option) {
        return option.get('slug') === slug;
      });
    }),
    isAutoBalanceOption(option) {
      return option.get('slug') === this.get('balanceSettings.auto-balance-option-slug');
    },
    option: Ember.computed.alias('autoBalanceOption'),

    balanceText: function(value, balanceMin, balanceMax) {
      if(value < balanceMin) {
        return 'deficit';
      } else if(value <= balanceMax) {
        return 'balanced';
      }
      return 'surplus';
    },

    bothBarsBalanced: Ember.computed('balanceEnabled', 'balance2Enabled', 'scenario.apiId', 'calculation1.value', 'calculation2.value', function() {
      let balance1 = 'balanced';
      let noScenario = Em.isEmpty(this.get('scenario.apiId'));

      if(this.get('balanceEnabled')) {
        if(noScenario) {
          return false;
        }
        const config1 = this.get('balanceConfig');
        balance1 = this.balanceText(this.get('calculation1.value'), config1.balanceMin, config1.balanceMax);
      }

      let balance2 = 'balanced';

      if(this.get('balance2Enabled')) {
        if(noScenario) {
          return false;
        }
        const config2 = this.get('balance2Config');
        balance2 = this.balanceText(this.get('calculation2.value'), config2.balanceMin, config2.balanceMax);
      }

      return (balance1 === 'balanced' && balance2 === 'balanced');
    }),

    balanceBinVotes: Ember.computed('currentUserBinVotes.@each.bin', 'currentUserBinVotes.@each.updatedAt', 'autoBalanceOption.id', function() {
      const optionIds = [this.get('autoBalanceOption.id')];
      const criteriaIds = this.get('allCriteria').mapBy('id');
      return this.currentBinVotesFor(optionIds, criteriaIds);
    }),
    balanceVoteValue: Ember.computed('balanceBinVotes.[]', function() {
      const bin = this.get('balanceBinVotes.firstObject.bin');
      if (Em.isEmpty(bin)) {
        return 'no';
      } else {
        return bin > 1 ? 'yes' : 'no';
      }
    }),
    autoBalanceOn: Ember.computed('autoBalanceOption.binVotes.[]', 'balanceVoteValue', 'calculation1.value', function() {
      return this.get('autoBalanceOption.binVotes.length') && this.get('balanceVoteValue') === 'yes';
    }),

    hasAnyBalanceBar: Ember.computed.or('balanceSettings.balance-enabled', 'balanceSettings.balance2-enabled'),
    balanceSettings: Ember.computed.alias('registry.decision.sidebars.balance'),
    balanceBlocksNavigation: Ember.computed(
      'bothBarsBalanced', 'hasAnyBalanceBar', 'scenario.status', 'scenario.apiId', 'progressChanged',
      function() {
        this.get('progressChanged');
        this.get('bothBarsBalanced');
        this.get('scenario.status');
        this.get('scenario.apiId'); // watch

        if(!this.get('hasAnyBalanceBar')) {
          return false;
        }

        if(!this.get('scenario.apiId')) {
          return true; // if they haven't voted always block
        }

        return !this.get('bothBarsBalanced');
      }),
  });
