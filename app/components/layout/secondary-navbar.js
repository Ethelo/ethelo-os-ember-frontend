import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry,{
  didInsertElement: function() {
    $(window).off('load.mobile resize.mobile').on('load.mobile resize.mobile', this.adaptSize.bind(this));

    this.set('commentBoxVisible', $('#issue-comments').length);
    this.adaptSize();
  },

  adaptSize() {
    let primary = Ember.$('.navbar-header');
    let secondary = this.$('.navbar.secondary');
    if(!secondary) {
      return;
    }
    let secondaryPadding = secondary.siblings('.secondary-navbar-top-padding');
    let navbarDisplayed = secondary.css('display') !== 'none';

    let fixedNavbar = this.get('fixed');

    if (fixedNavbar) {
      secondary.css('top', primary.height());
    } else {
      secondary.css('top', -70);
    }

    if (navbarDisplayed) {
      if (fixedNavbar) {
        secondaryPadding.css('padding-top', () => secondary.height() + 20);
      } else {
        secondaryPadding.css('display', 'none');
      }
    } else {
      secondaryPadding.css('display', 'none');
    }
  },

  commentBoxVisible: null,

  hasShortlist: false, // not brought over

  voteButtonVisible: Ember.computed('buttons', function() {
    let buttons = this.get('buttons');
    if (!buttons) {
      return false;
    }

    return buttons.split(',').contains('Vote');
  }),

  voteButtonActive: Ember.computed(
    'voteButtonVisible',
    'activeSidebarView',
    function() {
      return this.get('voteButtonVisible') && !this.get('activeSidebarView');
    }
  ),

  reviewVoteButtonVisible: Ember.computed('buttons', function() {
    let buttons = this.get('buttons');
    if (!buttons) {
      return false;
    }

    return buttons.split(',').contains('ReviewVote');
  }),

  reviewVoteButtonActive: Ember.computed(
    'reviewVoteButtonVisible',
    'activeSidebarView',
    function() {
      return this.get('reviewVoteButtonVisible') && !this.get('activeSidebarView');
    }
  ),

  topChoiceButtonVisible: Ember.computed('buttons','registry.decision.topChoiceEnabled', function() {
    let buttons = this.get('buttons');
    if (!buttons) {
      return false;
    }

    return buttons.split(',').contains('TopChoice') && this.get('registry.decision.topChoiceEnabled');
  }),

  topChoiceButtonActive: Ember.computed(
    'topChoiceButtonVisible',
    'activeSidebarView',
    function() {
      return this.get('topChoiceButtonVisible') &&
        (this.get('activeSidebarView') === 'top_choice');
    }
  ),

  issueCommentsButtonVisible: Ember.computed(
    'buttons',
    'projectStyle.issueCommentsEnabled',
    'commentBoxVisible',
    function() {
    let buttons = this.get('buttons');
    if (!buttons) {
      return false;
    }
    let issueCommentsEnabled = this.get('projectStyle.issueCommentsEnabled');
    let commentBoxVisible = this.get('commentBoxVisible');

    return buttons.split(',').contains('IssueComments') && issueCommentsEnabled && commentBoxVisible;
  }),

  issueCommentsButtonActive: Ember.computed(
    'issueCommentsButtonVisible',
    'activeSidebarView',
    function() {
      return this.get('issueCommentsButtonVisible') &&
        (this.get('activeSidebarView') === 'issue_comments');
    }
  ),

  visible: Ember.computed('topChoiceButtonVisible', 'issueCommentsButtonVisible', function() {
    return this.get('topChoiceButtonVisible') || this.get('issueCommentsButtonVisible');
  }),

  actions: {
    showVote() {
      this.set('activeSidebarView', null);
    },

    showReviewVote() {
      this.set('activeSidebarView', null);
    },

    showTopChoice() {
      this.set('activeSidebarView', 'top_choice');
    },

    showIssueComments() {
      this.set('activeSidebarView', 'issue_comments');
    }
  }
});
