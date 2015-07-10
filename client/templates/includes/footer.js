Template.footer.onRendered(function() {
  $(function() {
    var resize = function(event) {
      var height = $(window).height() - 210;
      $('#main').css('min-height', height + 'px');
    }
    window.onresize = resize;
    resize();
  });
});
