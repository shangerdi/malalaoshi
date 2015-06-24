Template.registerHelper('pluralize', function(n, thing) {
  // fairly stupid pluralizer
  if (n === 1) {
    return '1 ' + thing;
  } else {
    return n + ' ' + thing + 's';
  }
});

Template.registerHelper('isEqual', function(a, b) {
  return a==b;
});

Template.registerHelper('eduDegreeList', function(a, b) {
  var list = getEduDegreeList(a);
  if (b) {
    _.each(list, function(o){
      if (o.key==b) {
        o.selected="true";
      }
    });
  }
  return list;
});
