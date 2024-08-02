import optionCategoryWeightInfluent from 'frontend/mixins/option-category-weight-influent';
import criterionWeightInfluent from 'frontend/mixins/criterion-weight-influent';
import OptionCategoryRangeVoteInfluent from 'frontend/mixins/option-category-range-vote-influent';
import BalanceTools from 'frontend/mixins/balance-tools';
import surveyTools from 'frontend/mixins/survey-tools';

export default Ember.Mixin.create(
  optionCategoryWeightInfluent,
  surveyTools,
  OptionCategoryRangeVoteInfluent,
  criterionWeightInfluent,
  BalanceTools, {
    enableProgressBar: Ember.computed.alias('registry.decision.theme.enableProgressBar'),
    progressRequiredItemsOnly: Ember.computed.alias('registry.decision.theme.progressRequiredItemsOnly'),
    showWeb3SubmitButton: Ember.computed.bool('registry.decision.web3SignatureRequired'),

    menuPages: Ember.computed(function () {
      return this.get('store').peekAll('page').filterBy('notOnMenu', false);
    }),
    allBinVotes: Ember.computed(function () {
      return this.get('store').peekAll('bin-vote');
    }),
    filteredBinVotes: Ember.computed.filterBy('allBinVotes', 'invalidVote', false),
    allRangeVotes: Ember.computed(function () {
      return this.get('store').peekAll('option-category-range-vote');
    }),
    filteredRangeVotes: Ember.computed.filterBy('allRangeVotes', 'deleteVote', false),

    allOptions: Ember.computed(function () {
      const that = this;
      return this.get('store').peekAll('option')
        .filter(function (option) {
          return !that.isAutoBalanceOption(option);
        });
    }),
    allCriteria: Ember.computed(function () {
      return this.get('store').peekAll('criterion');
    }),
    allOptionCategories: Ember.computed(function () {
      return this.get('store').peekAll('option-category');
    }),
    allSurveyResponses: Ember.computed(function () {
      return this.get('store').peekAll('survey-response');
    }),
    blockingPages: Ember.computed.filterBy("menuPages", "blocksBlockedPages", true),
    completionPages: Ember.computed.filterBy("menuPages", "completionPage", true),
    blockedPagesAreBlocked: Ember.computed('progressChanged', function () {
      this.get('progressChanged'); //watch

      let blockingPages = this.get('blockingPages');
      let that = this;

      return blockingPages.reduce(function (isBlocked, page) {
        if (isBlocked) {
          return true;
        }
        return !that.progressCompleteFor(page, 'permissions');
      }, false);

    }),
    completionPagesAreBlocked: Ember.computed('progressChanged', 'completionPages', function () {
      this.get('progressChanged'); //watch
      if (this.get('completionPages.length') > 0) {
        return !Ember.isEmpty(this.get('percent')) && this.get('percent') < 100.0;
      } else {
        return false;
      }
    }),
    optionCategoryOptions(optionCategory) {
      const autoBalanceOption = this.autoBalanceOption;
      const that = this;
      if (!autoBalanceOption) {
        return optionCategory.get('options');
      }
      return optionCategory.get('options')
        .filter(function (option) {
          return !that.isAutoBalanceOption(option);
        });
    },

    sliderOptionCategoryItems: function (page) {
      const included = page.get('includedItems');
      const that = this;

      return this.get('allOptionCategories')
        .filter(function (optionCategory) {
          return that.optionCategoryOptions(optionCategory).length > 0 &&
            included.contains(optionCategory.get('id').toString());
        });

    },
    sliderOptionCategoryProgress: function (page, requiredOnly = false) {
      if (page && page.get('notRequired') && requiredOnly) {
        return [0, 0];
      }
      const optionCategories = this.sliderOptionCategoryItems(page);

      let total = optionCategories.length;
      let done = optionCategories.reduce((acc, optionCategory) => {
        return (
          acc + optionCategory.get('rangeVotes').filterBy('deleteVote', false).length
        );
      }, 0);

      return [done, total];
    },

    votingOptionCategoryProgress: function (page, requiredOnly = false) {
      if (page && page.get('notRequired') && requiredOnly) {
        return [0, 0];
      }
      const that = this;
      const criterionCount = this.get('allCriteria.length');

      const excluded = page.get('excludedItems') || [];
      const options = page.get('dataSource.options').filter(function(option) {
        return !excluded.contains(option.get('id').toString()) && !that.isAutoBalanceOption(option);
      });

      let total = options.length * criterionCount;
      let done = options.reduce((acc, option) => {
        return (
          acc + option.get('binVotes').filterBy('invalidVote', false).length
        );
      }, 0);

      if (page.get('isBinaryLikert')) {
        total = 1;
        done = done > 0 ? 1 : 0;
      }

      return [done, total];
    },
    votingCriterionProgress: function (page, requiredOnly = false) {
      if (page && page.get('notRequired') && requiredOnly) {
        return [0, 0];
      }
      const criterionId = page.get('dataSource.id');
      const criterionCount = criterionId ? 1 : 0;

      const that = this;
      const excluded = page.get('excludedItems') || [];
      const options = this.get('allOptions').filter(function(option) {
        return !excluded.contains(option.get('id').toString()) && !that.isAutoBalanceOption(option);
      });

      let total = criterionCount * options.length;
      let done = this.get('filteredBinVotes').filterBy('criterion.id', criterionId).get('length');

      return [done, total];
    },
    votingOptionProgress: function (page, requiredOnly = false) {
      if (page && page.get('notRequired') && requiredOnly) {
        return [0, 0];
      }
      const optionId = page.get('dataSource.id');
      const optionCount = optionId ? 1 : 0;

      const excluded = page.get('excludedItems') || [];
      const criteria = this.get('allCriteria').filter(function(criterion) {
        return !excluded.contains(criterion.get('id').toString());
      });

      let total = optionCount * criteria.length;
      let done = this.get('filteredBinVotes').filterBy('option.id', optionId).get('length');

      return [done, total];
    },
    totalsForQuestions: function (questions, requiredOnly = false) {
      if (requiredOnly) {
        questions = questions.filterBy('required', true);
      }

      let total = questions.get('length');
      let done = questions.reduce((acc, question) => {
        let answered = question.answeredBy(this.get('registry.decisionUser')) ? 1 : 0;
        return acc + answered;
      }, 0);

      return [done, total];
    },
    surveyPageProgress: function (page, requiredOnly = false) {
      let questions = page
        .get('dataSource.questions')
        .filterBy('isContentOnly', false);
      return this.totalsForQuestions(questions, requiredOnly);
    },
    pledgePageProgress: function (page, requiredOnly = false) {
      let slug = page.get('settings.pledge-question-slug');
      let questions = [this.questionMatchingSlug(slug)];
      return this.totalsForQuestions(questions, requiredOnly);
    },
    submitPageProgress: function (page, requiredOnly = false) {
      if( this.get('showWeb3SubmitButton') ){
        // always required
        const done = this.get('registry.decisionUser.signingPackage.changedJsonData') ? 0 : 1;
        return [done, 1];
      } else {
        const slug = page.get('settings.submit-question-slug');
        let questions = [this.questionMatchingSlug(slug)];
        let progress = this.totalsForQuestions(questions, requiredOnly);
        return progress;
      }
    },
    weightingOptionCategoryProgress: function (page, requiredOnly = false) {
      if (page && page.get('notRequired') && requiredOnly) {
        return [0, 0];
      }
      const excluded = page.get('excludedItems');
      const that = this;
      let validOptionCategoryIds = this.get('allOptionCategories')
        .filter(function (optionCategory) {
          return optionCategory.get('weightingEnabled') &&
            that.optionCategoryOptions(optionCategory).length > 0 &&
            !excluded.contains(optionCategory.get('id').toString());
        })
        .map(function (optionCategory) {
          return optionCategory.get('id');
        });

      let total = validOptionCategoryIds.get('length');
      let done = this.get('currentUserOptionCategoryWeights')
        .filter(function (optionCategoryWeight) {
          return validOptionCategoryIds.contains(optionCategoryWeight.get('optionCategory.id'));
        })
        .get('length');
      return [done, total];
    },
    weightingCriterionProgress: function (page, requiredOnly = false) {
      if (page && page.get('notRequired') && requiredOnly) {
        return [0, 0];
      }
      const excluded = page.get('excludedItems');

      let total = this.get('allCriteria')
        .filter(function (criterion) {
          return criterion.get('weightingEnabled') && !excluded.contains(criterion.get('id').toString());
        })
        .get('length');
      let done = this.get('currentUserCriterionWeights')
        .filter(function (criterionWeight) {
          return criterionWeight.get('criterion.weightingEnabled') && !excluded.contains(criterionWeight.get('criterion.id').toString());
        })
        .get('length');

      return [done, total];
    },

    progressChanged: Ember.computed(
      'menuPages.[]',
      'allOptions.[]',
      'allCriteria.[]',
      'allOptionCategories.[]',
      'filteredBinVotes.@each.updatedAt',
      'filteredRangeVotes.@each.updatedAt',
      'currentUserOptionCategoryWeights.@each.updatedAt',
      'currentUserCriterionWeights.@each.updatedAt',
      'currentUserOptionCategoryWeights.@each.weighting',
      'currentUserCriterionWeights.@each.weighting',
      'currentUserSurveyResponses.@each.updatedAt',
      'enableProgressBar',
      'registry.decisionUser.signingPackage.changedJsonData',
      function () {
        this.get('enableProgressBar');
        let updated = function (object) {
          return object.get('updatedAt');
        };
        this.get('menuPages');
        this.get('allOptions');
        this.get('allCriteria');
        this.get('allOptionCategories');
        this.get('filteredBinVotes').map(updated);
        this.get('filteredRangeVotes').map(updated);
        this.get('currentUserOptionCategoryWeights').map(updated);
        this.get('currentUserCriterionWeights').map(updated);
        this.get('currentUserSurveyResponses').map(updated);
        this.get('registry.decisionUser.signingPackage.changedJsonData');

        return Date.now();
      }),

    progressCompleteFor: function (page, mode = 'permissions') {
      return ['n/a', 'complete'].contains(this.progressStateFor(page, mode));
    },

    progressStateFor: function (page, mode = 'permissions') {
      let progress = this.progressFor(page, mode);
      let done = progress[0];
      let total = progress[1];

      if (total < 1) {
        return 'n/a';
      } else if (done < 1) {
        return 'none';
      } else if (done >= total) {
        return 'complete';
      } else {
        return 'partial';
      }
    },

    progressFor: function (page, mode = 'permissions') {
      let requiredOnly = true;
      if (mode === 'progress') {
        if (page.get('excludeFromProgressBar')) {
          return [0, 0];
        } else {
          requiredOnly = page.get('requiredOnlyInProgressBar');
        }
      }

      // never track in demo mode
      if (this.get('registry.decision.demoVoting')) {
        return [0, 0];
      }

      const template = page.get('template');
      if (template === 'voting_option_category') {
        return this.votingOptionCategoryProgress(page, requiredOnly);

      } else if (template === 'slider_option_category') {
        return this.sliderOptionCategoryProgress(page, requiredOnly);

      } else if (template === 'voting_criterion') {
        return this.votingCriterionProgress(page, requiredOnly);

      } else if (template === 'voting_option') {
        return this.votingOptionProgress(page, requiredOnly);

      } else if (template === 'survey-page') {
        return this.surveyPageProgress(page, requiredOnly);

      } else if (template === 'pledge-page') {
        return this.pledgePageProgress(page, requiredOnly);

      } else if (template === 'submit-page') {
        return this.submitPageProgress(page, requiredOnly);

      } else if (template === 'weighting_option_category') {
        return this.weightingOptionCategoryProgress(page, requiredOnly);

      } else if (template === 'weighting_criterion') {
        return this.weightingCriterionProgress(page, requiredOnly);

      } else {
        return [0, 0];
      }
    },

    percent: Ember.computed('progressChanged', function () {
      this.get('progressChanged');
      let menuPages = this.get('menuPages');
      let that = this;

      let totals = menuPages.reduce(function (acc, page) {
        let progress = that.progressFor(page, 'progress');
        acc.done = acc.done + progress[0];
        acc.total = acc.total + progress[1];
        return acc;
      }, {
        done: 0,
        total: 0
      });

      const percent = Math.floor(totals.done * 100 / totals.total);

      return isNaN(percent) ? '' : percent;
    }),

    progressPercent: Ember.computed('percent', function () {
      const percent = this.get('percent');
      return !Ember.isEmpty(percent) ? `${percent}%` : '';
    }),

    percentWidth: Ember.computed('percent', function () {
      const percent = isNaN(this.get('percent')) ? 0 : this.get('percent');
      return new Ember.Handlebars.SafeString(`width: ${percent}%`);
    }),
  });
