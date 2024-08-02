import Ember from 'ember';
import AuthForm from './auth-form';

export default Ember.Component.extend(AuthForm, {
  actions: {
    addWeb3() {
      this._resetValidation();
      this.get('web3Service').metaMaskUpgrade(this);
    },
  }
});
