MalaPopup = {
  show: function (options){
    /**
    optoins:{
      autoDelete: defalut(false)
      timeout: defalut(3000)
      modal: defalut(true)
      closeBtn: defalut(true)
      template: templateName or message
    }
    **/
    this.template = Template.malaPopup;
    if(_.has(options, 'autoDelete')){
      this.autoDelete = options.autoDelete;
      this.timeout = options.timeout || 3000;
    }else{
      this.autoDelete = false;
    }
    if(_.has(options, 'modal')){
      this.modal = options.modal;
    }else{
      this.modal = true;
    }
    if(_.has(options, 'closeBtn')){
      this.closeBtn = options.closeBtn;
    }else{
      this.closeBtn = true;
    }

    if(options.buttons && options.buttons.length > 0){
      MalaPopup.buttons = [];
      for (var i = 0; i < options.buttons.length; i++){
        var button = options.buttons[i];
        MalaPopup.buttons.push({
          text: button.text,
          type: button.type,
          index: i,
          onTap: button.onTap
        });
      }
    }

    var innerTemplate = '';
    if (options.templateName){
      innerTemplate = Template[options.templateName].renderFunction().value;
    } else if (options.template){
      innerTemplate = '<span>' + options.template + '</span>';
    }

    var data = {
      title: options.title,
      subTitle: options.subTitle,
      buttons: MalaPopup.buttons,
      template: innerTemplate,
      closeBtn: this.closeBtn
    };

    if($('.mala-popup').length > 0){
      var templateLoad = $(Blaze.toHTMLWithData(this.template, data));
      var malaPopupBody = templateLoad.find('.mala-popup-body');
      var pBd = $('.mala-popup-body');
      if(pBd.length > 0){
        pBd.last().after(malaPopupBody);
      }else{
        $('.mala-popup').append(malaPopupBody);
      }
    }else{
      this.view = Blaze.renderWithData(this.template, data, $('.ionic-body').get(0));

      if(this.modal){
        $('body').addClass('popup-open');
      }else{
        $('.backdrop').removeClass('backdrop');
        $('.popup-container').addClass('popup-container-modal');
      }

      var $backdrop = $(this.view.firstNode());
      $backdrop.addClass('visible active');
      var $popup = $backdrop.find('.popup-container');
      $popup.addClass('popup-showing active');
    }
    if(options.title){
      $('.mala-popup').addClass('has-head');
    }
    if(MalaPopup.buttons && MalaPopup.buttons.length > 0){
      $('.mala-popup').addClass('has-buttons');
    }
    if(this.autoDelete){
      var self = this;
      var malaPopupBody = $('.mala-popup-body').last();
      Meteor.setTimeout(function(){
        if($('.mala-popup-body').length > 1){
          malaPopupBody.remove();
        }else{
          MalaPopup.close();
        }
      }, self.timeout);
    }
  },

  close: function (){
    MalaPopup.buttons = [];
    var $popup = this._domrange ? $(this.view.firstNode()).find('.popup-container') : $('.popup-container');
    $popup.addClass('popup-hidden').removeClass('active');

    setTimeout(function (){
      $('body').removeClass('popup-open');
      $('.backdrop').remove();
      Blaze.remove(this.view);
    }.bind(this), 100);
  },

  buttonClicked: function (index, event, template){
    var callback = MalaPopup.buttons[index].onTap;
    if(callback){
      if (callback(event, template) === true){
        MalaPopup.close();
      }
    }
  }
};

Template.malaPopup.rendered = function (){
  $(window).on('keyup.malaPopup', function(event){
    if (event.which == 27){
      MalaPopup.close();
    }
  });
};

Template.malaPopup.destroyed = function (){
  $(window).off('keyup.malaPopup');
};

Template.malaPopup.events({
  'click': function (event, template){
    if ($(event.target).hasClass('popup-container')){
      //MalaPopup.close();
    }
  },

  'click [data-index]': function (event, template){
    var index = $(event.target).data('index');
    MalaPopup.buttonClicked(index, event, template);
  },

  'click .close': function(event, template){
    if($('.mala-popup-body').length > 1){
      $(event.target).closest('.mala-popup-body').remove();
    }else{
      MalaPopup.close();
    }
  }
});

Template.malaPopup.helpers({
  hasHead: function(){
    return this.title || this.subTitle;
  }
});
