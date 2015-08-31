TeachersFilterController = RouteController.extend({
  data: function(){
    return {
      setAddress: this.params.hash
    };
  }
});
