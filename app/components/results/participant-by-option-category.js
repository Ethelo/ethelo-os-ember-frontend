import FullByOptionCategory from 'frontend/components/results/full-by-option-category';
import InfluentTools from 'frontend/mixins/influent-tools';
import ResultBreakdown from 'frontend/mixins/result-breakdown';

export default FullByOptionCategory.extend(InfluentTools, ResultBreakdown, {
  namespace: 'participant-results',
  settings: Ember.computed.alias('registry.decision.sidebars.participant-results'),
  truncateTitles: Ember.computed.bool('settings.truncate-titles'),
  showPiecharts: Ember.computed.bool('settings.option-category-piecharts-enabled'),
});
