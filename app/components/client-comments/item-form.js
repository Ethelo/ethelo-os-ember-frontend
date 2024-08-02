import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  clientCommentService: Ember.inject.service('client-comments'),
  formId: Ember.computed('target.id', 'target.commentType', function() {
    //observe
    this.get('target.commentType');
    this.get('target.id');

    let service = this.get('commentService');
    let id = service.prefixedId('comment', this.get('target'));

    return id;
  }),

  classNames: 'new-comment',
  title: null,
  content: null,
  buttonBarExpanded: false,
  titleError: null,
  contentError: null,
  hasError: Ember.computed('titleError', 'contentError', function() {
    return this.get('contentError') || this.get('titleError');
  }),
  init() {
    this._super();

    let comment = this.get('existingClientComment');
    if (comment) {
      this.set('title', comment.get('title'));
      this.set('content', comment.get('content'));
    }
  },
  showClientCommentForm: Ember.computed.alias('registry.decisionUser.canClientComment'),

  didInsertElement() {
    // add auto-expand
    let textarea = $(this.get('element')).find('textarea');
    autosize(textarea);

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

  clientCommentHash() {
    let data = {
      comment: {
        title: this.get('titleText'),
        content: this.get('bodyText'),
        target: this.get('target'),
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
  verifyClientCommentContent() {
    if (this.get('titleText') === '') {
      this.set('titleError', 'errors.comments.blank');
    }
    if (this.get('bodyText') === '') {
      this.set('contentError', 'errors.comments.blank');
    }
  },

  actions: {

    post() {
      let component = this;

      this.verifyClientCommentContent();
      if (this.get('hasError')) {
        return false;
      }

      let clientCommentData = this.clientCommentHash();

      let clientCommentService = this.get('clientCommentService');

      // if editing an existing comment
      let existingClientComment = component.get('existingClientComment');
      if (existingClientComment) {
        // just update the content and privacy setting
        existingClientComment.set('content', clientCommentData.comment.content);
        existingClientComment.set('title', clientCommentData.comment.title);
        existingClientComment.save();
      }

      // if creating a new comment
      else {
        clientCommentData['decisionUser'] = this.get('registry.decisionUser'); // ensure is current
        clientCommentData['comment']['createdAt'] = new Date(); // include immediately for faster placement in comment list
        clientCommentService.postComment(clientCommentData['comment']);
      }

      this.set('content', null);
      this.set('title', null);
      this.sendAction('complete');
      let textarea = $(this.get('element')).find('textarea');
      Ember.run.next(this, function() {
        autosize.update(textarea); // make sure this runs after ember re-renders
      });
    },

    expandButtonBar() {
      if(this.get('showClientCommentForm')){
        this.set('buttonBarExpanded', true);
      } else {
        return false;
      }

    },
  }
});
