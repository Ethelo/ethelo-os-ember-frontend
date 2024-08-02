import Ember from 'ember';
import DetailTools from 'frontend/mixins/detail-tools';

const { Component, get, set, computed, inject } = Ember;

export default Component.extend(DetailTools, {
  i18n: inject.service(),
  classNames: ['data-table'],
  activeItemId: null,
  hasValues: computed('preparedItems', function() {
    return get(this, 'preparedItems').length > 0;
  }),


  preparedItems: computed('items.[]', function() {
    let items = get(this, 'items').copy();
    return this.prepareForTable(items);
  }),

  actions: {
    toggleHint(itemId) {
      const activeItemId = get(this, 'activeItemId');

      set(this, 'activeItemId', activeItemId === itemId ? null : itemId);
    }
  }
});
