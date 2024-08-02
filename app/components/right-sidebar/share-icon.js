import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  analytics: Ember.inject.service(),
  class: ['is-coped'],
  popupWindowConfig: function (url) {
    let left = (screen.width - 570) / 2;
    let top = (screen.height - 570) / 2;
    let params = "menubar=no,toolbar=no,status=no,width=570,height=570,top=" + top + ",left=" + left;
    window.open(url, "NewWindow", params);
    return false;
  },

  populateMetaTags: function() {
    let pageSharing = this.get('defaultSharing');
    if (!Ember.isEmpty(this.get('overrideIcons')) && this.get('overrideIcons').includes(this.get('icon'))) {
      pageSharing = this.get('pageSharingInfo');
    }

    if (pageSharing) {
      if (pageSharing.url) {
        document.querySelector('meta[property="og:url"]').setAttribute('content', pageSharing.url);
      }
      if (pageSharing.title) {
        document.querySelector('meta[property="og:title"]').setAttribute('content', pageSharing.title);
      }
      if (pageSharing.image) {
        document.querySelector('meta[property="og:image"]').setAttribute('content', pageSharing.image);
      }
      if (pageSharing.description) {
        document.querySelector('meta[property="og:description"]').setAttribute('content', pageSharing.description);
      }
    }

    return pageSharing;
  },

  actions: {
    share() {

      let analytics = this.get('analytics');
      analytics.trackEvent('Social Media', 'Share', this.get('icon'));

      let href;
      let hrefInfo = this.populateMetaTags();

      /* More details:  https://css-tricks.com/simple-social-sharing-links/ */

      /* possible parameters for Twitter href: text, url, hashtags, via, related
      https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/parameter-reference1 */
      let twitter = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(hrefInfo.url) + '&text=' + encodeURIComponent(hrefInfo.message);

      /* possible parameters for Linked In mini=true (required parameter), url, title, summary, source */
      let linkedIn = 'https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(hrefInfo.url) + '&title=' + encodeURIComponent(hrefInfo.title) + '&summary=' + encodeURIComponent(hrefInfo.description);
      //'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(hrefInfo.url);

      /* possible parameters for Facebook href: '&quote=' + 'THE_CUSTOM_TEXT' */
      let facebook = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(hrefInfo.url);
      if (hrefInfo.message) {
        facebook += '&quote=' + encodeURIComponent(hrefInfo.message);
      }

      if (this.get('icon') === 'twitter') {
        href = twitter;
      }
      if (this.get('icon') === 'linked_in') {
        href = linkedIn;
      }
      if (this.get('icon') === 'facebook') {
        href = facebook;
      }

      if (this.get('icon') === 'copy_link') {
        analytics.trackEvent('Social Media', 'Share', this.get('icon'));
        /* copy link to clipboard */
        let temporary = $("<input>");
        $("body").append(temporary);
        temporary.val(hrefInfo.url).select();
        document.execCommand("copy");
        temporary.remove();

        /* show tooltip */
        $('.copy_link').addClass(this.get('class')[0]);
        setTimeout(() => $('.copy_link').removeClass(this.get('class')[0]), 2000);
        return false;
      }

      this.popupWindowConfig(href);
    },
    openShare(e) {
      // Only allow Enter/Spacebar key in accessibility to open/close the dropdown
      if(e && 'keyCode' in e &&  e.keyCode === 13 || e.keyCode === 32) {
        this.send('share');
        e.preventDefault();
      }
    }
  },
});
