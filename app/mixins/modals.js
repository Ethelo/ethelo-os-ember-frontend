export default Ember.Mixin.create({
  registry: Ember.inject.service(),
  web3Service: Em.inject.service('web3'),
  notLoggedIn: Ember.computed.alias('authService.notLoggedIn'),
  failedWeb3: Ember.computed.or('web3Service.userMustAddWeb3', 'web3Service.failedTokenGate'),
  closeAllModals() {
    $('.modal').modal('hide');
  },
  adjustModal(id) {
    let modal = $(id);
    if(modal.length > 0) {
      modal.modal('handleUpdate');
    }
  },
  openModal(id) {
    let modal = $(id);
    if(modal.length > 0) {
      modal.modal('show');
    }
  },
  closeModal(id) {
    let modal = $(id);
    if(modal.length > 0) {
      modal.modal('hide');
    }
  },
  adjustAuthModal() {
    this.adjustModal("#auth-modal");
  },
  openAuthModal() {
    this.openModal("#auth-modal");
  },
  closeAuthModal() {
    this.closeModal("#auth-modal");
  },
  openDemoModal() {
    this.openModal("#demo-modal");
  },
  openSignOutModal() {
    this.openModal("#sign-out-modal");
  },
  closeSignOutModal() {
    this.closeModal("#sign-out-modal");
  },
  openPrivacyConsentModal() {
    this.openModal("#privacy-consent-modal");
  },
  closePrivacyConsentModal() {
    this.closeModal("#privacy-consent-modal");
  },
  openDeleteAccountModal() {
    this.openModal("#delete-account-modal");
  },
  closeDeleteAccountModal() {
    this.closeModal("#delete-account-modal");
  },
  showVotingTools: Ember.computed.or(
    'registry.decisionUser.canVote',
    'registry.decision.demoVoting',
    'registry.decision.authenticatedVoting',
    'failedWeb3'
  ),
  promptBeforeVoting() {
    if(this.get('registry.decisionUser.canVote')) {
      return false;
    }

    if(this.get('registry.decision.demoVoting')) {
      this.openDemoModal();
      return true;
    }

    if(this.get('failedWeb3')) {
      this.openAuthModal();
      return true;
    }

    if(this.get('registry.decision.authenticatedVoting') && this.get('notLoggedIn')) {
      this.openAuthModal();
      return true;
    }

    // silently fail if we have a not voting state
    // that is not otherwise covered
    return true;
  },
  commentsEnabled: Ember.computed.or(
    'registry.decisionUser.canComment',
    'registry.decision.demoComments',
    'registry.decision.authenticatedComments',
    'failedWeb3'
  ),
  promptBeforeCommenting() {
    if(this.get('registry.decisionUser.canComment')) {
      return false;
    }

    if(this.get('registry.decision.demoComments')) {
      this.openDemoModal();
      return true;
    }

    if(this.get('failedWeb3')) {
      this.openAuthModal();
      return true;
    }

    if(this.get('registry.decision.authenticatedComments') && this.get('notLoggedIn')) {
      this.openAuthModal();
      return true;
    }

    // silently fail if we have a not commenting state
    // that is not otherwise covered
    return false;
  },

  showSurveyTools: Ember.computed.or(
    'registry.decisionUser.canAnswerSurvey',
    'registry.decision.demoSurvey',
    'registry.decision.authenticatedSurvey',
    'failedWeb3'
  ),
  canAnswerSurvey: Ember.computed.alias('registry.decisionUser.canAnswerSurvey'),
  promptBeforeSurvey() {
    if(this.get('isPledgeQuestion')) {
      return false;
    }

    if(this.get('registry.decisionUser.canAnswerSurvey')) {
      return false;
    }

    if(this.get('registry.decision.demoSurvey')) {
      this.openDemoModal();
      return true;
    }

    if(this.get('failedWeb3')) {
      this.openAuthModal();
      return true;
    }

    if(this.get('registry.decision.authenticatedSurvey') && this.get('notLoggedIn')) {
      this.openAuthModal();
      return true;
    }

    // silently fail if we have a not survey state
    // that is not otherwise covered
    return true;
  }
});
