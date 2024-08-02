export default Ember.Service.extend({
  isServiceFactory: true, // should not be needed?
  registry: Ember.inject.service(),
  gaDisabled() {
    return typeof window.dataLayer === 'undefined';
  },
  googleArgs(values) {
    values['dimension1'] = this.get('registry.decision.title');
    values['dimension2'] = this.get('registry.decision.subdomain');
    values['dimension3'] = this.currentUserType();
    values['dimension4'] = this.get('registry.decision.id');

    return values;
  },
  fbDisabled() {
    return typeof fbq === "undefined";
  },
  sendPageView(url, title) {
    if(!this.gaDisabled()) {
      const args = this.googleArgs({
        page_title: title,
        page_location: this.get('session.EtheloServer') + url
      });
      gtag('event', 'page_view', args);
    }
    if(!this.fbDisabled()) {
      fbq("track", "ViewContent", {content_name: title});
    }
  },

  trackEvent(categoryText, actionText, labelText) {
    if(this.gaDisabled()) {
      return;
    }

    const args = this.googleArgs({
      'event_category': categoryText,
      'event_label': labelText,
    });
    gtag('event', actionText, args);

  },
  currentUserType() {
    let userType;
    if(this.get("registry.user") == null) {
      userType = "Visitor (Not Logged In)";
    } else if(this.get("registry.user.guest")) {
      userType = "Guest Participant (Anonymous Account)";
    } else if(this.get("registry.user.staff")) {
      userType = "Ethelo Admin";
    } else if(this.get("registry.decisionUser.canSeeAdmin")) {
      userType = "Project Admin";
    } else {
      userType = "Participant (Authenticated Account)";
    }
    return userType;
  },
  updateUserId(decisionUserId) {
    if(this.gaDisabled()) {
      return;
    }

    gtag('set', {
      'user_id': decisionUserId,
      'dimension3': this.currentUserType(),
    });

  },
});
