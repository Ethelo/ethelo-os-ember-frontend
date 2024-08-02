import ListParents from './list-parents';


export default ListParents.extend({
  target: Ember.computed.alias('option'),
  target2: Ember.computed.alias('criterion'),
  titleOverride: false,

  contentPrompt: Ember.computed(function() {
    return this.scopedTranslation(['content_prompt', 'comments.criteria', this.get('translationScope')]);
  }),
  titlePrompt: Ember.computed(function() {
    return this.scopedTranslation(['title_prompt', 'comments.criteria', this.get('translationScope')]);
  }),
  instruct: Ember.computed(function() {
    return this.scopedTranslation(['instruct_html', 'comments.criteria', this.get('translationScope')]);
  })
});
