import ListParents from './list-parents';

export default ListParents.extend({
  target: Ember.computed.alias('option'),
  target2: Ember.computed('criterion.id', function() {
    if(Em.isEmpty(this.get('criterion.id'))) {
      return null;
    } else {
      return this.get('criterion');
    }
  }),
  titleOverride: false,

  contentPrompt: Ember.computed(function() {
    return this.scopedTranslation(['content_prompt', 'comments.options', this.get('translationScope')]);
  }),
  titlePrompt: Ember.computed(function() {
    return this.scopedTranslation(['title_prompt', 'comments.options', this.get('translationScope')]);
  }),
  instruct: Ember.computed(function() {
    return this.scopedTranslation(['instruct_html', 'comments.options', this.get('translationScope')]);
  })

});
