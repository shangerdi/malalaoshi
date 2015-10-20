IonActionSheetCustom = {
  transitionEndEvent: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',

  show: function (templateName, options) {
    this.template = Template[templateName];

    var buttons = [];
    for (var i = 0; i < options.buttons.length; i++) {
      var button = options.buttons[i];
      buttons.push({
        text: button.text,
        index: i
      });
    }

    var data = {
      titleText: options.titleText,
      finishText: options.finishText,
      destructiveText: options.destructiveText,
      cancelText: options.cancelText,
      buttons: buttons
    };

    this.callbacks = {
      finish: options.finish,
      cancel: options.cancel,
      destructiveButtonClicked: options.destructiveButtonClicked,
      buttonClicked: options.buttonClicked
    };

    this.view = Blaze.renderWithData(this.template, data, $('.ionic-body').get(0));
    $('body').addClass('action-sheet-open');

    var $backdrop = $(this.view.firstNode());
    $backdrop.addClass('active');

    var $wrapper = $backdrop.find('.action-sheet-wrapper');
    Meteor.setTimeout(function () {
      $wrapper.addClass('action-sheet-up');
    }, 20);
  },

  finish: function () {
    this.close(this.callbacks.finish);
  },

  cancel: function () {
    this.close(this.callbacks.cancel);
  },

  buttonClicked: function (index) {
    var callback = this.callbacks.buttonClicked;
    if (callback(index) === true) {
      IonActionSheetCustom.close();
    }
  },

  destructiveButtonClicked: function () {
    var callback = this.callbacks.destructiveButtonClicked;
    if (callback() === true) {
      IonActionSheetCustom.close();
    }
  },

  close: function (callback) {
    var $backdrop = $(this.view.firstNode());
    $backdrop.removeClass('active');

    var $wrapper = $backdrop.find('.action-sheet-wrapper');
    Meteor.setTimeout(function() {
      $wrapper.removeClass('action-sheet-up');
    }.bind(this), 10);

    $wrapper.on(this.transitionEndEvent, function () {
      $('body').removeClass('action-sheet-open');
      Blaze.remove(this.view);

      if (typeof(callback) === 'function') {
        callback();
      }
    }.bind(this));
  }
};

Template.ionActionSheetCustom.rendered = function () {
  $(window).on('keyup.ionActionSheet', function(event) {
    if (event.which == 27) {
      IonActionSheetCustom.cancel();
    }
  });
};

Template.ionActionSheetCustom.destroyed = function () {
  $(window).off('keyup.ionActionSheet');
};

Template.ionActionSheetCustom.events({
  // Handle clicking the backdrop
  'click': function (event, template) {
    if ($(event.target).hasClass('action-sheet-backdrop')) {
      IonActionSheetCustom.cancel();
    }
  },

  'click [data-index]': function (event, template) {
    var index = $(event.target).data('index');
    IonActionSheetCustom.buttonClicked(index);
  },

  'click [data-destructive]': function (event, template) {
    IonActionSheetCustom.destructiveButtonClicked();
  },

  'click [data-finish]': function (event, template) {
    IonActionSheetCustom.finish();
  },

  'click [data-cancel]': function (event, template) {
    IonActionSheetCustom.cancel();
  }

});
