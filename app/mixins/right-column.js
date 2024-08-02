import Registry from 'frontend/mixins/registry';
import BalanceTools from 'frontend/mixins/balance-tools';
import ContentBlocks from 'frontend/mixins/content-blocks';

export default Ember.Mixin.create(Registry, BalanceTools, ContentBlocks, {
  menu: Ember.inject.service(),

  decision: Ember.computed.alias('page.decision'),

  hasPageComments: Ember.computed('decision.commentsPermissions', function() {
    return 'decision.commentsPermissions' !== 'none';
  }),
  hasSidebarPageComments: Ember.computed('page.hasSidebarPageComments', 'hasPageComments', function() {
    return this.get('page.hasSidebarPageComments') && this.get('hasPageComments');
  }),

  showJoinButton: Ember.computed('page.hasJoinSidebar', 'registry.user.guest', function() {
    if (!this.get('registry.user.guest') ){
      return false;
    }
    return this.get('page.hasJoinSidebar');
  }),

  showBalanceSidebar: Ember.computed('page.hasBalanceSidebar', 'balanceConfigured', function() {
    return this.get('page.hasBalanceSidebar') && this.get('balanceConfigured');
  }),

  showDecisionInfo: Ember.computed('page.hasDecisionInfoSidebar', function() {
    return this.get('page.hasDecisionInfoSidebar');
  }),

  showTopSidebar: Ember.computed('page.translationsScope', 'page.hasTopSidebar', function() {
    return this.hasContentFor('sidebar_top.content_html', this.get('page.translationScope')) &&
      this.get('page.hasTopSidebar');
  }),

  showBottomSidebar: Ember.computed('page.translationsScope', 'page.hasBottomSidebar', function() {
    return this.hasContentFor('sidebar_bottom.content_html', this.get('page.translationScope')) &&
      this.get('page.hasBottomSidebar');
  }),

  canClientComment: Ember.computed.alias('registry.decisionUser.canClientComment'),

  showRightColumn: true,

  showNext: Ember.computed.alias('registry.decision.theme.enableSidebarNext'),

  openSidebar: Ember.computed('page.defaultSidebar',
                              'page.hasParticipantResultsSidebar', 'hasSidebarPageComments',
                              'showDecisionInfo','showTopSidebar', function() {

    let defaultSidebar = this.get('page.defaultSidebar');
    /* if needed change defaultSidebar name so it matches the comparisons in right-column.hbs */
    if (defaultSidebar === 'participant_results') {
      defaultSidebar = 'participant_result';
    }
    if (defaultSidebar === 'top') {
      defaultSidebar = 'sidebar_top';
    }
    if (defaultSidebar === 'bottom') {
      defaultSidebar = 'sidebar_bottom';
    }

    let sidebarList = [];
    if (this.get('page.hasParticipantResultsSidebar')) {
      sidebarList.push('participant_result');
    }
    if (this.get('hasSidebarPageComments')) {
      sidebarList.push('comments');
    }
    if (this.get('showTopSidebar')) {
      sidebarList.push('sidebar_top');
    }
    if (this.get('showDecisionInfo')) {
      sidebarList.push('decision_info');
    }
    if (this.get('showBottomSidebar')) {
      sidebarList.push('sidebar_bottom');
    }

    if (sidebarList.includes(defaultSidebar)) {
      return defaultSidebar;
    } else {
      return sidebarList.shift();
    }
  }),
  /* social-sharing */
  showSocialSharingIcons: Ember.computed('page.hasSocialSharing', 'registry.decision.theme.hasDefaultSharing', function() {
    return this.get('page.hasSocialSharing') && this.get('registry.decision.theme.hasDefaultSharing');
  }),
  icons: Ember.computed('page.socialSharingInfo.icons', 'registry.decision.theme.defaultSharingInfo', function() {
    let defaultIcons = this.get('registry.decision.theme.defaultSharingInfo.icons');

    let pageIcons=this.get('page.socialSharingInfo.icons');
    if(pageIcons){
      pageIcons =pageIcons.filter(x=>!Ember.isEmpty(x));
      if(pageIcons.length > 0){
        return pageIcons;
      }
    }

    // let commonIcons = defaultIcons.some(icon => pageIcons.includes(icon));

    // if (defaultIcons.length !== pageIcons.length || !commonIcons) {
    //   /* filter all unique icons */
    //   let filtered = Array.from(new Set(defaultIcons.concat(pageIcons)));
    //   filtered=filtered.filter(x=>!Ember.isEmpty(x));
    //   return filtered;
    // }

    return defaultIcons || [];
  }),
  pageSharingInfo: Ember.computed('page.socialSharingInfo', function() {
    return this.get('page.socialSharingInfo');
  }),
  overrideIcons: Ember.computed('page.socialSharingInfo.icons', function() {
    return this.get('page.socialSharingInfo.icons');
  }),
  defaultSharingInfo: Ember.computed('registry.decision.theme.defaultSharingInfo', function() {
    return this.get('registry.decision.theme.defaultSharingInfo');
  })

});
