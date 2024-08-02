import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  theme: Ember.computed.alias('registry.decision.theme'),
  panelId: "filters_panel",
  selectedFilters: {},
  enableFilters: Ember.computed.alias('theme.enableFilters'),
  collapseFilters: Ember.computed.alias('theme.collapseFilters'),
  enableVotingFilter: Ember.computed.alias('theme.enableVotingFilter'),
  filter1Caption: Ember.computed.alias('theme.filter1Caption'),
  filter1Keywords: Ember.computed.alias('theme.filter1Keywords'),
  filter2Caption: Ember.computed.alias('theme.filter2Caption'),
  filter2Keywords: Ember.computed.alias('theme.filter2Keywords'),
  filter3Caption: Ember.computed.alias('theme.filter3Caption'),
  filter3Keywords: Ember.computed.alias('theme.filter3Keywords'),
  filter4Caption: Ember.computed.alias('theme.filter4Caption'),
  filter4Keywords: Ember.computed.alias('theme.filter4Keywords'),
  filter1Configured: Ember.computed('filter1Keywords', 'filter1Caption', 'enableFilters', function() {
    return this.filterIsConfigured(this.get('filter1Keywords'), this.get('filter1Caption'));
  }),
  filter2Configured: Ember.computed('filter2Keywords', 'filter2Caption', 'enableFilters', function() {
    return this.filterIsConfigured(this.get('filter2Keywords'), this.get('filter2Caption'));
  }),
  filter3Configured: Ember.computed('filter3Keywords', 'filter3Caption', 'enableFilters', function() {
    return this.filterIsConfigured(this.get('filter3Keywords'), this.get('filter3Caption'));
  }),
  filter4Configured: Ember.computed('filter4Keywords', 'filter4Caption', 'enableFilters', function() {
    return this.filterIsConfigured(this.get('filter4Keywords'), this.get('filter4Caption'));
  }),
  votingFilterConfigured: Ember.computed('enableFilters', 'enableVotingFilter', function() {
    return this.get('enableFilters') && this.get('enableVotingFilter');
  }),
  filterIsConfigured: function(keywords, caption) {
    if(!this.get('enableFilters')) {
      return false;
    }
    if(Ember.isEmpty(caption)) {
      return false;
    }

    if(Ember.isEmpty(keywords)) {
      return false;
    }

    return (keywords.get('length') > 0);
  },

  filterConfiguration(number) {
    let selected = this.get(`selectedFilters.filter${number}`).toArray();

    return {
      caption: this.get(`filter${number}Caption`),
      keywords: this.get(`filter${number}Keywords`),
      id: `filter${number}`,
      inputId: `filter${number}`,
      selected: selected,
    };
  },
  configuredFilters: Ember.computed(
    'filter1Configured', 'filter2Configured', 'filter3Configured', 'filter4Configured',
    function() {
      if(!this.get('enableFilters')) {
        return [];
      }

      let list = [];
      if(this.get('filter1Configured')) {
        list.push('filter1');
      }
      if(this.get('filter2Configured')) {
        list.push('filter2');
      }
      if(this.get('filter3Configured')) {
        list.push('filter3');
      }
      if(this.get('filter4Configured')) {
        list.push('filter4');
      }

      return list;
    }),
  showPanel: Ember.computed('enableFilters', 'votingFilterConfigured', 'configuredFilters.[]',
    function() {
      if(!this.get('enableFilters')) {
        return false;
      }

      return this.get('votingFilterConfigured') || this.get('configuredFilters.length') > 0;
    }),
  showClearFilters: Ember.computed('votingFilterConfigured', 'configuredFilters.[]',
    function() {
      let count = this.get('votingFilterConfigured') ? 1 : 0;
      count = count + this.get('configuredFilters.length');
      return count > 1;
    }),
  actions: {
    updateFilter(key, value) {
      this.sendAction('updateFilter', key, value);
      return true;
    },
    clearFilters() {
      this.sendAction('updateFilter', 'filter0', null);
      this.sendAction('updateFilter', 'filter1', []);
      this.sendAction('updateFilter', 'filter2', []);
      this.sendAction('updateFilter', 'filter3', []);
      this.sendAction('updateFilter', 'filter4', []);
      return true;
    },

  }
});
