import DS from 'ember-data';
import Formatter from 'frontend/utils/formatters';
import Shuffle from 'frontend/utils/shuffle';

import CommentTarget from 'frontend/mixins/comment-target';
import {
  scopedTranslation
} from 'frontend/helpers/scopet';

export default DS.Model.extend(CommentTarget, {
  i18n: Ember.inject.service(),
  menu: Ember.inject.service(),
  dataSource: DS.belongsTo('data-source', {
    async: false,
    inverse: null,
    polymorphic: true
  }),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  parent: DS.belongsTo('page', {
    async: false,
    inverse: null
  }),
  notOnMenu: Ember.computed.equal('parent.slug', 'pages-not-on-menu'),
  componentId: Ember.computed('slug', 'id', function () {
    let slug = this.get('slug');
    if (Ember.isEmpty(slug)) {
      slug = this.get('id');
    }
    return Formatter.cssId('page-' + slug);
  }),
  excludedItems: Ember.computed('settings.excluded-items', function () {
    let excluded = this.get('settings.excluded-items');
    if (Em.isEmpty(excluded)) {
      return [];
    }
    return excluded;
  }),
  includedItems: Ember.computed('settings.included-items', function () {
    let included = this.get('settings.included-items');
    if (Em.isEmpty(included)) {
      return [];
    }
    return included;
  }),
  hasDataSourceTitle: Ember.computed('dataSource', 'settings.title-default', function () {
    return !Ember.isEmpty(this.get('dataSource')) && this.get('settings.title-default') === true;
  }),
  titleContent: Ember.computed('dataSource.title', 'settings.title-default', 'translationScope', 'title', function () {
    let i18n = this.get('i18n');
    if (Ember.isEmpty(this.get('dataSource')) || this.get('settings.title-default') !== true) {
      return scopedTranslation(i18n, ['title', this.get('translationScope')], {});
    } else {
      return this.get('dataSource.title');
    }
  }),
  validPageCommentTarget: Ember.computed('dataSource', 'settings.page-comments-source', function () {
    let commentSource = this.get('settings.page-comments-source');

    if (commentSource === 'page') {
      return true;
    } else {
      return !Ember.isEmpty(this.get('dataSource'));
    }
  }),
  loginPanelEnabled: Ember.computed.alias('settings.login-panel-enabled'),
  assessmentPanelEnabled: Ember.computed('settings.assessment-panel-enabled', 'decision.taxAssessment.enableAssessment', function () {
    return this.get('decision.taxAssessment.enableAssessment') && this.get('settings.assessment-panel-enabled');
  }),
  isCondensedLikert: Ember.computed('settings.likert-style', function () {
    return this.get('settings.likert-style') === 'condensed';
  }),
  isBinaryLikert: Ember.computed.or('isBinaryOne', 'isBinaryMany'),

  isBinaryOne: Ember.computed('settings.likert-style', function () {
    return this.get('settings.likert-style') === 'binary_one';
  }),
  isBinaryMany: Ember.computed('settings.likert-style', function () {
    return this.get('settings.likert-style') === 'binary_many';
  }),

  hasPageCommentTitleOverride: Ember.computed('settings.page-comments-titles-enabled', function () {
    return this.get('validPageCommentTarget') && this.get('settings.page-comments-titles-enabled') !== false;
  }),

  hasItemListComments: Ember.computed('validPageCommentTarget', 'settings.item-list-comments', function () {
    return this.get('settings.item-list-comments') !== false;
  }),
  hasSidebarPageComments: Ember.computed('validPageCommentTarget', 'settings.page-comments-position', function () {
    return this.get('validPageCommentTarget') && this.get('settings.page-comments-position') === 'sidebar';
  }),
  hasCenterPageComments: Ember.computed('validPageCommentTarget', 'settings.page-comments-position', function () {
    return this.get('validPageCommentTarget') && this.get('settings.page-comments-position') === 'center';
  }),
  hasCommentOrderLikes: Ember.computed('validPageCommentTarget', 'settings.page-comments-order', function() {
    return this.get('validPageCommentTarget') && this.get('settings.page-comments-order') === 'likes';
  }),
  beginCollapsed: Ember.computed('settings.collapse-on-menu', function () {
    return this.get('settings.collapse-on-menu') === true;
  }),

  valid: DS.attr('boolean'),
  title: DS.attr('string'),
  slug: DS.attr('string'),
  template: DS.attr('string'),

  sidebars: DS.attr('array'),
  defaultSidebar: DS.attr('string', {
    defaultValue: null
  }),
  menuVisibility: DS.attr('string', {
    defaultValue: 'visible'
  }),

  settings: DS.attr('object'),
  itemOrder: DS.attr('array'),
  randomizeItems: DS.attr('boolean', {
    defaultValue: false
  }),
  translationScope: DS.attr('string'),

  // Randomize Items
  finalItemOrder: Ember.computed('itemOrder', function () {

    let itemOrder = this.get('itemOrder');
    if (this.get('randomizeItems')) {
      return this.participantOrder([...itemOrder], this.get('decision.decisionUser.id'));
    }
    return itemOrder;
  }),

  participantOrder: function (items, userId) {
    //check userId
    if (userId) {
      if (typeof userId !== 'number') {
        userId = parseInt(userId);
      }
    } else {
      return items;
    }

    // Shuffle the itemOrder with userId as seed to maintain randomness among users.
    return Shuffle(items, userId);

  },
  // nav settings
  rootState: DS.attr('string'),
  depth: DS.attr('string'),
  nestingClass: Ember.computed('depth', function () {
    return 'nesting-' + this.get('depth');
  }),
  hasChildren: DS.attr('boolean', {
    defaultValue: false
  }),
  position: DS.attr('number'),
  disabled: false,
  completed: true,
  linkable: DS.attr('boolean'),
  doNotLink: Ember.computed('linkable', 'disabled', 'valid', function () {
    return !this.get('linkable') || this.get('disabled') || !this.get('valid');
  }),
  templateClass: Ember.computed('template', function () {
    return 'page-' + this.get('template').replace(/_/g, '-');
  }),
  hasBalanceSidebar: Ember.computed('sidebars.[]', function () {
    return this.get('sidebars').includes('balance');
  }),
  hasParticipantResultsSidebar: Ember.computed('sidebars.[]', function () {
    return this.get('sidebars').includes('participant_result');
  }),

  hasJoinSidebar: Ember.computed('sidebars.[]', function () {
    return this.get('sidebars').includes('sidebar_join');
  }),

  hasDecisionInfoSidebar: Ember.computed('sidebars.[]', function () {
    return this.get('sidebars').includes('decision_info');
  }),

  hasTopSidebar: Ember.computed('sidebars.[]', function () {
    return this.get('sidebars').includes('sidebar_top');
  }),

  hasBottomSidebar: Ember.computed('sidebars.[]', function () {
    return this.get('sidebars').includes('sidebar_bottom');
  }),

  //social sharing
  hasSocialSharing: Ember.computed('sidebars.[]', function () {
    return this.get('sidebars').includes('social_sharing');
    //return true;
  }),

  /* page info for social sharing */
  // socialSharingInfo: Ember.computed.alias('decision.sidebars.social_sharing'),
  /* expected data format */
  socialSharingInfo: Ember.computed('settings.sharing', function () {
    return this.get('settings.sharing');
  }),

  commentType: 'Page',

  blockedPage: DS.attr('boolean', {
    defaultValue: false
  }),
  completionPage: DS.attr('boolean', {
    defaultValue: false
  }),
  requiredMode: DS.attr('string', {
    defaultValue: 'none'
  }),
  balanceBarRequired: DS.attr('string', {
    defaultValue: 'none'
  }),
  requiresBalance: Ember.computed('balanceBarRequired', 'decision.sidebars.balance.block-navigation', 'blockedPage', function(){
    const balanceBarRequired = this.get('balanceBarRequired');
    if (balanceBarRequired === 'blocked'){
      return true;
    }
    if (balanceBarRequired === 'none'){
      return false;
    }
    return this.get('decision.sidebars.balance.block-navigation') && this.get('blockedPage');
  }),
  progressBar: DS.attr('string', {
    defaultValue: 'default'
  }),
  excludeFromProgressBar: Ember.computed('progressBar', function(){
    return this.get('progressBar') === 'none';
  }),
  requiredOnlyInProgressBar: Ember.computed('progressBar', 'decision.theme.progressRequiredItemsOnly', function(){
    const progressBar = this.get('progressBar');
    if (progressBar === 'none' || progressBar === 'all'){
      return false;
    }
    if (progressBar === 'required'){
      return true;
    }
    return this.get('decision.theme.progressRequiredItemsOnly');
  }),
  allInProgressBar: Ember.computed('progressBar', 'decision.theme.progressRequiredItemsOnly', function(){
    const progressBar = this.get('progressBar');
    if (progressBar === 'none' || progressBar === 'required'){
      return false;
    }
    if (progressBar === 'all'){
      return true;
    }
    return !this.get('decision.theme.progressRequiredItemsOnly');
  }),
  blocksNextPages: Ember.computed('requiredMode', 'template', function(){
    const template = this.get('template');
    const requiredMode = this.get('requiredMode');

    // If we have randomize pages on we override permissions
    if(this.get('randomizeNestedPages') || this.get('parent.randomizeNestedPages')) {
      if((!Ember.isEmpty(this.get('parent.nestedPagesPermissions')) && this.get('parent.nestedPagesPermissions')) || (!Ember.isEmpty(this.get('nestedPagesPermissions')) && this.get('nestedPagesPermissions'))){
        if(this.get('parent.nestedPagesPermissions') === 'required_questions_only' || this.get('nestedPagesPermissions') === 'required_questions_only') {
          // if(['survey-page'].contains(this.get('template'))) {
          //   return !this.progressCompleteFor(this, 'permissions');
          // }
          return false;
        }

        if(this.get('parent.nestedPagesPermissions') === 'require_section_completed') {
          let lastPageInRandomizeSection = this.get('menu.lastPageInRandomizeSection');
          if(!Ember.isEmpty(lastPageInRandomizeSection) && this.get('id') === lastPageInRandomizeSection.get('id') && !this.get('currentPageComplete')) {
            return true;
          }
          return false;
        }

        if(this.get('parent.nestedPagesPermissions') === 'require_completion_in_order') {
          if(!this.get('currentPageComplete')){
            return true;
          }
          return false;
        }
      }
    }

    if (requiredMode === 'next'){ return true; }

    return ['survey-page', 'pledge-page', 'submit-page'].contains(template);
  }),
  blocksBlockedPages: Ember.computed.equal('requiredMode', 'blocked'),
  required: Ember.computed('blocksNextPages', 'blocksBlockedPages', function () {
    return (this.get('blocksNextPages') || this.get('blocksBlockedPages'));
  }),
  notRequired: Ember.computed.not('required'),
  randomizeNestedPages: Ember.computed.alias('settings.randomize-nested-pages'),
  nestedPagesPermissions: Ember.computed.alias('settings.nested-pages-permissions'),
  showIncompletePagesSection: Ember.computed.alias('settings.incomplete-pages-enabled'),
  hideSubmitButtonWhenPagesIncomplete: Ember.computed.alias('settings.hide-button-when-incomplete'),
  anchorValue: Ember.computed('template', function(){
    const template = this.get('template');
    if (template === 'voting_option_category') {
      return 'optionCategory.slug';

    } else if (template === 'slider_option_category') {
      return 'optionCategory.slug';

    } else if (template === 'voting_criterion') {
      return 'criteria.slug';

    } else if (template === 'voting_option') {
      return 'option.slug';
    } else {
      return null;
    }
  }),
});
