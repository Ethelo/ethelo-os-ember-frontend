import Ember from 'ember';

export default Ember.Mixin.create({
  sortBy: {
    strength: 'strengthPercent',
    fairness: 'fairnessDifference',
    approval: 'approval',
    votes: 'numFor',
    voterPercent: 'voterPercent',
    support: 'satisfactionPercent',
    nav: 'navSort',
  }
});
