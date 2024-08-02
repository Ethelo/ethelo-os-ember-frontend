import Registry from 'frontend/mixins/registry';
import Modals from "frontend/mixins/modals";
export default Ember.Component.extend(Registry, Modals, {
  commentService: Ember.inject.service('comments'),
  formId: Ember.computed('target.id', 'target.commentType', 'target2.id', 'target2.commentType', 'parent', function() {
    //observe
    this.get('target.commentType');
    this.get('target.id');
    this.get('target2.commentType');
    this.get('target2.id');

    let service = this.get('commentService');
    let parent = this.get('parent');

    let id = service.prefixedId('comment', this.get('target'), this.get('target2'));
    if (parent) {
      id = id + '-' + parent.get('id');
    }
    return id;
  }),

  commentsMaxLength: Ember.computed.alias('registry.decision.commentsMaxLength'),
  defaultCommentPrivacy: Ember.computed.alias('registry.decisionUser.defaultCommentPrivacy'),
  classNames: 'new-comment',
  title: null,
  content: null,
  privacy: null,
  buttonBarExpanded: false,
  parent: null,
  titleError: null,
  contentError: null,
  hasError: Ember.computed('titleError', 'contentError', function() {
    return this.get('contentError') || this.get('titleError');
  }),

  remainingChars: Ember.computed('content', function() {
    let bodyLen = (this.get('content') || '').trim().length;
    if (Ember.isEmpty(bodyLen)) {
      bodyLen = 0;
    }
    let maxLen = this.get('commentsMaxLength');
    return maxLen - bodyLen;
  }),

  commentTitlesRequired: Ember.computed(
    'target.hasPageCommentTitleOverride',
    'titleOverride',
    'parent',
    function() {
      if (!Em.isBlank(this.get('parent'))) {
        return false;
      }
      return this.get('target.hasPageCommentTitleOverride') || this.get('titleOverride');
    }),

  commentTitlesNotRequired: Ember.computed.not('commentTitlesRequired'),
  onlyPrivateComments: Ember.computed.alias('registry.decision.adminOnlyComments'),
  isPublic: Ember.computed('privacy', 'onlyPrivateComments', function() {
    return !this.get('onlyPrivateComments') && this.get('privacy') === 'all';
  }),
  isAdminsOnly: Ember.computed('privacy', 'onlyPrivateComments', function() {
    return this.get('onlyPrivateComments') || this.get('privacy') === 'admin';
  }),

  isReply: Ember.computed('parent', function() {
    return !!this.get('parent');
  }),

  userStatusChanged: function() {
    if (!this.get('hasError')) {
      this.set('title', null);
      this.set('content', null);
    }
  }.observes('registry.user.guest'),
  init() {
    this._super();

    let comment = this.get('existingComment');
    if (comment) {
      this.set('title', comment.get('title'));
      this.set('content', comment.get('content'));
      this.set('privacy', comment.get('privacy'));
    }
    this.setDefaultPrivacy();
  },

  setDefaultPrivacy() {
    if (this.get('privacy') == null) {
      if (this.get('registry.decision.adminOnlyComments')) {
        this.set('privacy', 'admin');
      } else {
        this.set('privacy', 'all');
      }
    }
  },

  didInsertElement() {
    // add auto-expand
    let textarea = $(this.get('element')).find('textarea');
    autosize(textarea);

    this.$('textarea').on('click', () => {
      this.promptBeforeCommenting();
    });

    this.$('textarea').on('focus', () => {
      this.$('textarea').click();
    });
    
    this.$('.textarea-title').on('keyup', () => {
      this.set('titleError', null);
    });

    this.$('.textarea-content').on('keyup', () => {
      this.set('contentError', null);
    });

    // open right away if auto-open is enabled
    if (this.get('autoOpen')) {
      this.set('buttonBarExpanded', true);
    }

    // prompt shims for IE8
    if (((typeof (IE_VERSION) !== 'undefined')) && (IE_VERSION <= 8)) {
      $.prompt.shim();
    }
  },

  commentHash() {
    let data = {
      comment: {
        title: this.get('commentTitlesRequired') ? this.get('titleText') : '',
        content: this.get('bodyText'),
        privacy: this.get('privacy'),
        target: this.get('target'),
        target2: this.get('target2'),
        parent: this.get('parent'),
      },
    };

    return data;
  },

  titleText: Ember.computed('title', function() {
    return (this.get('title') || '').trim();
  }),
  bodyText: Ember.computed('content', function() {
    return (this.get('content') || '').trim();
  }),
  verifyCommentContent() {
    if (this.get('commentTitlesRequired')) {
      if (this.get('titleText') === '') {
        this.set('titleError', 'errors.comments.blank');
      }

    } else if (this.get('bodyText') === '') {
      this.set('contentError', 'errors.comments.blank');

    }
  },

  actions: {

    setPrivacy(privacy) {
      this.set('privacy', privacy);
    },

    post() {
      if(this.promptBeforeCommenting()) {
        return false;
      }

      this.verifyCommentContent();
      if(this.get('hasError')) {
        return false;
      }

      let commentData = this.commentHash();

      let component = this;
      // if editing an existing comment
      let existingComment = component.get('existingComment');

      if(existingComment) {
        // just update the content and privacy setting
        existingComment.set('content', commentData.comment.content);
        existingComment.set('title', commentData.comment.title);
        existingComment.set('privacy', commentData.comment.privacy);
        existingComment.save();
      }

      // if creating a new comment
      else {
        commentData['decisionUser'] = this.get('registry.decisionUser'); // ensure is current
        commentData['comment']['createdAt'] = new Date(); // include immediately for faster placement in comment list
        this.get('commentService').postComment(commentData['comment']);
      }

      this.set('content', null);
      this.set('title', null);
      this.set('buttonBarExpanded', false);
      this.sendAction('complete');
      let textarea = $(this.get('element')).find('textarea');
      Ember.run.next(this, function() {
        autosize.update(textarea); // make sure this runs after ember re-renders
      });
    },

    expandButtonBar() {
      if(this.promptBeforeCommenting()) {
        return false;
      }
      this.set('buttonBarExpanded', true);
    },
  }
});
