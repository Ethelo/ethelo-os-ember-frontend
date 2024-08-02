import Registry from 'frontend/mixins/registry';
import Modals from "frontend/mixins/modals";

export default Ember.Service.extend(Registry, Modals, {
  isServiceFactory: true, // should not be needed?
  routing: Ember.inject.service(),
  analytics: Ember.inject.service(),
  previousTransition: null,
  prc: null,
  rc: null,
  inviteCode: null,
  rememberMe: true,
  agreeTerms: false,
  etheloMail: false,
  username: null,
  password: null,
  email: null,
  resetService() {
    this.set('prc', null);
    this.set('rc', null);
    this.set('inviteCode', null);
    this.set('username', null);
    this.set('password', null);
    this.set('email', null);
    this.set('rememberMe', true);
  },
  allowsSignup: Ember.computed.alias('registry.decision.allowsSignup'),
  failedInvite: Ember.computed('notJoined', 'decision.requiresInvite', 'session.invited',
    function() {
      if(!this.get('notJoined')) {
        return false;
      }
      return this.get('decision.requiresInvite') || !!this.get('session.invited');
    }),
  notJoined: Ember.computed('session.userId', 'session.decisionUserId', function() {
    let userId = this.get('session.userId');
    let decisionUserId = this.get('session.decisionUserId');
    return userId && !decisionUserId;
  }),
  notLoggedIn: Ember.computed('registry.user', 'registry.user.guest', function() {
    return (this.get('registry.user.guest') || !this.get('registry.user'));
  }),
  toggleRememberMe() {
    this.set('rememberMe', !this.get('rememberMe'));
  },
  toggleAgreeTerms() {
    this.set('agreeTerms', !this.get('agreeTerms'));
  },
  toggleEtheloMail() {
    this.set('etheloMail', !this.get('etheloMail'));
  },
  trackSignOut() {
    this.get('analytics').sendPageView('/signed_out', 'User Signed Out');
    this.get('analytics').updateUserId(null);
  },
  trackSignIn() {
    this.get('analytics').sendPageView('/signed_in', 'User Signed In');
  },
  trackInviteJoin() {
    this.get('analytics').sendPageView('/user_code_joined', 'User Created with Invite Code');
  },
  trackGuestJoin() {
    this.get('analytics').sendPageView('/guest_joined', 'Guest User Created Account');
  },
  trackJoin() {
    this.get('analytics').sendPageView('/joined', 'New User Created Account');
  },
  trackNewPasswordRequest() {
    this.get('analytics').sendPageView('/new_password_request', 'Lost Password Request');
  },
  trackNewPassword() {
    this.get('analytics').sendPageView('/new_password', 'New Password Set');
  },
  trackProfileUpdate() {
    this.get('analytics').sendPageView('/profile/edit', 'Profile Update');
  },
  addError(component, key, message) {
    let errorList = component.get('errorList');

    if(errorList.set) {
      errorList.set(key, message);
    } else {
      errorList = {};
      errorList[key] = message;
    }

    component.set('errorList', errorList);
    console.log(component.get('errorList'));
  },
  verifyUsername(username, component) {
    if(!username || username.trim() === '') {
      this.addError(component, 'username', 'errors.validation.username.presence');
      return;
    }
    if(username.length < 3 || username.length > 30) {
      this.addError(component, 'username', 'errors.validation.username.length');
      return;
    }

    this.set('username', username);
  },
  verifyTerms(component) {
    if(!this.get('agreeTerms')) {
      this.addError(component, 'terms', 'errors.validation.terms.accepted');
      return;
    }
  },
  verifyEmail(email, component) {
    if(!email || email.trim() === '') {
      this.addError(component, 'email', 'errors.validation.email.presence');
      return;
    }
    if(email.indexOf('@') === -1 || email.indexOf('.') === -1) {
      this.addError(component, 'email', 'errors.validation.email.invalid');
      return;
    }
    this.set('email', email);
  },
  verifyEmailFormat(email, component) {
    if(!email || email.trim() === '') {
      return;
    }
    if(email.indexOf('@') === -1 || email.indexOf('.') === -1) {
      this.addError(component, 'email', 'errors.validation.email.invalid');
      return;
    }
    this.set('email', email);
  },
  verifyPassword(password, component) {
    if(!password || password.trim() === '') {
      this.addError(component, 'password', 'errors.validation.password.presence');
      return;
    }
    this.set('password', password);
  },
  verifyConfirmedPassword(password, confirmation, component, required = true) {
    let noConfirm = (!confirmation || confirmation === '');
    let noPassword = (!password || password.trim() === '');
    let passwordFormat = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@=:',\.$%^&*-])");

    if(required && noConfirm) {
      this.addError(component, 'confirmation', "errors.validation.confirmation.presence");
    } else if(confirmation !== password) {
      this.addError(component, 'confirmation', "errors.validation.confirmation.match");
    }
    if(noPassword) {
      if(required) {
        this.addError(component, 'password', 'errors.validation.password.presence');
      }
    } else if(password.length < 6) {
      this.addError(component, 'password', "errors.validation.password.length_low");
    } else if(password.length > 128) {
      this.addError(component, 'password', "errors.validation.password.length_high");
    } else if(!passwordFormat.test(password)) {
      this.addError(component, 'password', "errors.validation.password.format");
    }
  },
  verifyCode(inviteCode, component) {
    const auth = this;
    this.set('inviteCode', inviteCode);

    let request = this.get('registry').loadDecisionInvite(inviteCode)
      .done((loaded) => {
        const invite = loaded || {error: "errors.code.invite_not_found", valid: false};
        component.set('invite', invite);
      });

    return request;
  },
  apiUrl(path) {
    return this.get('session.EtheloServer') + '/api/v2/' + path + '.json';
  },
  ajaxRequest(component, path, data) {
    let url = this.apiUrl(path);
    component.set('processing', true);
    component.set('errorList', {});
    data['decision_id'] = this.get('session.decisionId');
    data['f'] = this.get('session.f');
    data['error_locale'] = 'ember';

    if(data.user) {
      data.user.remember_me = this.get('rememberMe') ? 1 : 0;
    }
    if(this.get('prc')) {
      data['prc'] = this.get('prc');
    }
    if(this.get('rc')) {
      data['rc'] = this.get('rc');
    }

    let request = $.ajax({
      url: url,
      context: this,
      type: 'POST',
      dataType: 'json',
      data: data,
      crossDomain: true,
      xhrFields: {withCredentials: true}
    });

    request.fail((xhr, textStatus, error) => {
      //jshint unused:false
      let errors = {};
      if(xhr.status === 401) { // unauthorized
        errors = {auth: 'errors.auth.invalid_email_or_password'};
      } else {

        let response = xhr.responseJSON;
        if(Ember.isNone(response)) {
          errors = {auth: 'errors.auth.unexpected_error'};
        } else {
          errors = this.handleJsonApiErrors(xhr.responseJSON);
        }
      }
      component.set('errorList', errors);
      console.log(component.get('errorList'));

    });

    request.always(function() {
      component.set('processing', false);
    });

    return request;
  },
  handleJsonApiErrors(error) {
    let errors = error.errors;
    let fields = errors.reduce(function(memo, error) {
      let paths = error.source.pointer.split('/');
      let attr = paths[paths.length - 1];
      memo[attr] = error.detail;
      return memo;
    }, {});
    return fields;
  },
  submitTerms(component) {
    component.set("user.agreedToTerms", true);
    let data = {user: {terms: true}};

    let request = this.ajaxRequest(component, 'user/accept_consent', data);
    request.done((result) => {
      this.updateUser(result);
      this.closePrivacyConsentModal();
    });
    request.error((error) => {
      component.set("user.agreedToTerms", false);
      console.log(error);
    });
  },
  loginWithPassword(component) {
    this.set('signOutNext', false);
    let data = {user: {email: this.get('email'), password: this.get('password')}};
    let request = this.ajaxRequest(component, 'user/login_password', data);
    request.done(this.updateUser, this.trackSignIn, this.closeAuthModal, this.sendToPreviousTransition);
  },
  createPasswordUser(component) {
    let username = this.get('username'),
      userEmail = this.get('email'),
      agreedToTerms = this.get('agreeTerms'),
      receive_ethelo_notifications = this.get('etheloMail');
    let data = {
      user: {
        email: userEmail,
        name: username,
        terms: agreedToTerms,
        ethelo_notifications: receive_ethelo_notifications,
      },
    };
    let request = this.ajaxRequest(component, 'user/join_password', data);
    request.done((result) => {
      this.updateUser(result);
      this.trackJoin();
      this.closeAuthModal();
      this.sendToPreviousTransition();
    });
    return request;
  },
  deleteUserAccount() {
    this.openDeleteAccountModal();
    $.ajax({
      url: this.apiUrl('user/delete_request'),
      type: 'GET',
      dataType: 'json',
      crossDomain: true,
      xhrFields: {withCredentials: true}
    }).done((result) => {
      if(result) {
        // added timeout because the response is coming too quick and modal appears and disappears very fast.
        setTimeout(() => {
          this.closeDeleteAccountModal();
        }, 2000);
      }
    }).error((err) => {
      console.error(err);
    });
  },
  upgradeGuest(component) {
    let username = this.get('username'), userEmail = this.get('email'), agreedToTerms = this.get('agreeTerms'),
      receive_ethelo_notifications = this.get('etheloMail');
    let data = {
      user: {
        email: userEmail,
        name: username,
        terms: agreedToTerms,
        ethelo_notifications: receive_ethelo_notifications,
      },
    };
    let request = this.ajaxRequest(component, 'user/upgrade_guest', data);
    request.done((result) => {
      this.updateUser(result);
      this.trackJoin();
      this.closeAuthModal();
      this.sendToPreviousTransition();
    });
    return request;
  },
  createInvitedUser(component) {
    let data = {
      user: {
        email: this.get('email'),
        name: this.get('username'),
        code: this.get('inviteCode'),
        terms: this.get('agreeTerms'),
        ethelo_notifications: this.get('etheloMail')
      }
    };
    let request = this.ajaxRequest(component, 'user/join_invited', data);
    request.done(this.updateUser, this.trackJoin, this.closeAuthModal, this.sendToPreviousTransition);
    return request;
  },
  requestPasswordReset(email, component) {
    let data = {
      user: {
        email: email,
      },
    };

    this.ajaxRequest(component, 'user/request_password_reset', data)
      .done(() => {
        component.set('sent', true);
      }, this.trackNewPasswordRequest);
  },
  resetPassword(token, password, confirmation, component) {
    let data = {
      user: {
        token: token,
        password: password,
        password_confirmation: confirmation
      },
    };

    let request = this.ajaxRequest(component, 'user/password_reset', data);
    request.done(this.updateUser, this.sendToLandingPage, this.trackNewPassword);
  },
  updateProfile(current_password, password, confirmation, component, success) {
    let data = {
      user: {
        email: this.get('email'),
        name: this.get('username'),
        password: password,
        password_confirmation: confirmation,
        current_password: current_password
      },
    };

    this.ajaxRequest(component, 'user/update_profile', data)
      .done(this.updateUser, success, this.trackProfileUpdate);
  },
  updateUser(data, reloadDecision = true) {
    let session = this.get('session');
    //skip on no change
    if(Ember.get(session, 'userId') === data['userId'] && data['userUpdated'] !== true) {
      return;
    }
    this.resetService();
    this.get('web3Service').resetService();

    this.get('store').unloadAll('comment');
    this.get('store').unloadAll('commentSummary');

    if(Em.isEmpty(data['userId'])) {
      // force reload
      window.location.href = window.location.href;
    }

    if(data['userId']) {
      Ember.set(session, 'userId', data['userId']);
    }
    if(data['decisionUserId']) {
      // once logged in, switch the global config to this decision user
      Ember.set(session, 'decisionUserId', data['decisionUserId']);
      this.get('analytics').updateUserId(data['decisionUserId']);
    }
    if(reloadDecision) {
      this.get('registry').reloadDecision();
    }
  },
  signOut() {
    this.resetService();
    this.get('web3Service').resetService();

    this.openSignOutModal();
    let session = this.get('session');
    Ember.set(session, 'decisionUserId', null);
    Ember.set(session, 'userId', null);

    let request = this.ajaxSignOut();
    request.done((result) => {
      this.updateUser(result);
      setTimeout(() => {
        this.closeSignOutModal();
      }, 1500);
      window.location.href = this.get("previousTransition").router.generate("first");
    });
  },
  ajaxSignOut() {
    return $.ajax({
      url: this.apiUrl('user/sign_out'),
      type: 'GET',
      dataType: 'json',
      crossDomain: true,
      xhrFields: {withCredentials: true}
    });
  },
  sendToPreviousTransition() {
    let previousTransition = this.get('previousTransition');
    if(previousTransition) {
      this.set('previousTransition', null);
      previousTransition.retry();
    } else {
      this.get('routing').transitionTo('first');
    }
  },
  sendToRetrievePassword() {
    this.get('routing').transitionTo('login.password.reset');
  },
  sendToLandingPage() {
    this.get('routing').transitionTo('first');
  },
  sendToSignIn() {
    this.get('routing').transitionTo('login', {
      queryParams: {
        tab: 'login'
      }
    });
  },
  sendToSignUp() {
    this.get('routing').transitionTo('login', {
      queryParams: {
        tab: 'register'
      }
    });
  },

});
