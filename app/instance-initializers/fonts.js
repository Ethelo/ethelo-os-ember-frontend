export default {
  name: 'fonts',
  initialize: function({}) {
    let font = new FontFaceObserver('Material Icons');

    font.load().then(function () {
      $('.material-icons').removeClass('hide-icons');
      // font available
    }, function () {
      $('.material-icons').addClass('hide-icons');
    });

    let font2 = new FontFaceObserver('Noto Sans').load();

  }
};
