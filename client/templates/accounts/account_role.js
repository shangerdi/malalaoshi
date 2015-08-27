Template.accountRole.onRendered(function() {
  var viewHeight = $(window).height();
  $(".account-role-box").height(viewHeight);
  $(".btns-box").css('top', (viewHeight-270)+"px");
});