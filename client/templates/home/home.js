Template.home.onRendered(function() {
  var viewHeight = $(window).height();
  $(".home-box").height(viewHeight);
  var oldLoc = $(".listbox").offset();
  $(".listbox").offset({top:viewHeight-170, left:oldLoc.left});
});