import Ember from 'ember';
import AuthForm from './auth-form';

export default Ember.Component.extend(AuthForm, {
  code: null, //passed in from route or form
  invite: null, //passed in from route
  inviteMode: 'mixed',

  showNameField: Ember.computed(
    'decision.requiresInvite',
    'invite',
    'invite.allowNameChange',
    'inviteMode',
    'web3Service.forceWeb3', function() {
      if(!this.get('decision.requiresInvite')) {
        return true;
      }

      if(this.get('inviteMode') === 'web3' || this.get('web3Service.forceWeb3')) {
        return true;
      }

      if(Em.isEmpty(this.get('invite'))) {
        return true;
      }

      return this.get('invite.allowNameChange');
    }),
  showEmailField: Ember.computed(
    'invite',
    'code',
    'invite.allowEmailChange',
    'inviteMode',
    'web3Service.forceWeb3',
    function() {
      if(this.get('inviteMode') === 'web3') {
        return true;
      }

      if(this.get('code')) {
        return false;
      }

      if(Em.isEmpty(this.get('invite'))) {
        return true;
      }

      return false;
    }),
  showPasswordButton: Ember.computed.alias('web3Service.allowsPasswordParticipation'),
  requireWeb3Invite: Ember.computed('decision.requiresInvite', 'invite.error', 'web3Service.allowsPasswordParticipation', function() {
    if(!this.get('decision.requiresInvite')) {
      return false;
    }

    if(this.get('web3Service.allowsPasswordParticipation')) {
      return false;
    }

    if(Em.isEmpty(this.get('invite'))) {
      return true;
    }
    return Em.isPresent(this.get('invite.error'));
  }),
  requireInviteCode: Ember.computed(
    'decision.requiresInvite',
    'invite.error',
    'web3Service.forceWeb3',
    'inviteMode',
    function() {
      if(!this.get('decision.requiresInvite')) {
        return false;
      }

      if(this.get('inviteMode') === 'web3') {
        return false;
      }

      if(this.get('web3Service.forceWeb3')) {
        return false;
      }

      if(Em.isEmpty(this.get('code'))) {
        return true;
      }


      if(Em.isEmpty(this.get('invite'))) {
        return true;
      }

      return Em.isPresent(this.get('invite.error'));
    }),
  failedInvite: Ember.computed(
    'processing',
    'authService.failedInvite',
    function() {
      if(this.get('processing')) {
        return false;
      }

      return this.get('authService.failedInvite');
    }),

  requireTerms: true,
  didInsertElement() {
    this._super(...arguments);
    this.updateMaterial();
    this.addValidationResets();
    this._checkCodeError();
  },
  _checkCodeError() {
    let codeError = this.get('invite.error');
    if(Em.isPresent(codeError)) {
      this.set('errorList.auth', codeError);
    }
  },
  fieldsValid() {
    const errorList = this.get('errorList');
    return !(errorList.email != null || errorList.username != null || errorList.terms != null);
  },

  actions: {
    setAuthTab(tab) {
      this.sendAction('setAuthTab', tab);
    },
    signUpNewUser() {
      const authService = this.get('authService');
      this._resetValidation();
      if(this.get('requireTerms')) {
        authService.verifyTerms(this);
      }
      authService.verifyUsername(this.get('name'), this);
      authService.verifyEmail(this.get('email'), this);
      if(this.fieldsValid()) {
        if(this.get('user.guest')) {
          authService.upgradeGuest(this);
        } else {
          authService.createPasswordUser(this);
        }
      }
    },
    web3Signup() {
      const web3Service = this.get('web3Service');
      const authService = this.get('authService');
      this._resetValidation();
      if(this.get('requireTerms')) {
        authService.verifyTerms(this);
      }
      authService.verifyUsername(this.get('name'), this);
      authService.verifyEmail(this.get('email'), this);
      if(this.fieldsValid()) {
        if(this.get('user.guest')) {
          web3Service.metaMaskUpgrade(this);
        } else {
          web3Service.metaMaskJoin(this);
        }

      }
    },
    submitInviteCode() {
      const authService = this.get('authService');
      this._resetValidation();
      authService.verifyCode(this.get('code'), this)
        .done(this._checkCodeError);
    },
    createInvitedUser() {
      const authService = this.get('authService');
      this._resetValidation();
      authService.inviteCode = this.get('code');
      if(this.get('requireTerms')) {
        authService.verifyTerms(this);
      }
      if(this.get('showNameField')) {
        authService.verifyUsername(this.get('name'), this);
      }
      if(this.get('showEmailField')) {
        authService.verifyEmail(this.get('email'), this);
      }
      if(this.fieldsValid()) {
        authService.createInvitedUser(this);
      }
    },
    joinWithWeb3Invite() {
      const web3Service = this.get('web3Service');
      const authService = this.get('authService');
      web3Service.set('inviteCode', this.get('code'));

      this._resetValidation();
      if(this.get('requireTerms')) {
        authService.verifyTerms(this);
      }
      authService.verifyUsername(this.get('name'), this);
      authService.verifyEmailFormat(this.get('email'), this);
      if(this.fieldsValid()) {
        web3Service.metaMaskInviteJoin(this);
      }
    },
  },
});
