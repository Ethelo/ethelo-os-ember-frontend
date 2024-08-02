import Ember from 'ember';
import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  authService: Em.inject.service('authentication'),
  web3Service: Em.inject.service('web3'),
  menu: Ember.inject.service(),
  errorList: {},
  processing: false,
  signingPackage: Ember.computed.alias('registry.decisionUser.signingPackage'),
  signature: Ember.computed.alias('signingPackage.signature'),
  changedJson: Ember.computed.alias('signingPackage.changedJsonData'),
  parsedChangedJson: Ember.computed('changedJson', function() {
    let jsonData = this.get('changedJson');
    if(!jsonData) {
      return null;
    }
    try {
      const parsed = JSON.parse(jsonData);
      return parsed;
    } catch(e) {
      return false;
    }
  }),
  alreadySigned: Ember.computed('changedJson', 'signature', 'signingPackage.updatedAt', function() {
    this.get('signingPackage.updatedAt'); // observe
    if(this.get('signature') == null) {
      return false;
    } // never signed
    if(this.get('changedJson') == null) {
      return true;
    } //nothing new to sign
    return this.get('parsedChangedJson') === null; // json is not valid OR not null
  }),
  actions: {
    signPackage() {
      const web3Service = this.get('web3Service');
      web3Service.metaMaskSignData(this.get('changedJson'), this);
    },
  }
});
