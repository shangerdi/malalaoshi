NavStack = function () {
  NavNode = function(id, pNode) {
    this.id = id;
    this.parent = pNode;
    this.children = [];
    this.add = function(childId) {
      var child = new NavNode(childId, this);
      this.children.push(child);
    }
  };
  this.root = new NavNode();
  var _innerFind = function(node, id) {
    if (node.id===id) {
      return node;
    }
    if (node.children && node.children.length) {
      var ret = false;
      _.find(node.children, function(o){
        ret = _innerFind(o,id);
        return ret;// if true, break loop
      });
      if (ret) {
        return ret;
      }
    }
    return null;
  };
  this._findNav = function(id) {
    if (!id) return null;
    return _innerFind(this.root, id);
  };
  this.findParent = function(id) {
    var navNode = this._findNav(id);
    if (navNode && navNode.parent) {
      return navNode.parent.id
    }
    return false;
  };
  this.add = function(id, parentId) {
    var node = this.root;
    if (parentId) {
      var t = this._findNav(parentId);
      if (t) {
        node = t;
      }
    }
    node.add(id);
  };
};
navStack = new NavStack();
navStack.add('home');
navStack.add('teachers');
navStack.add('dashboard');
navStack.add('orders');
navStack.add('register', 'home');
navStack.add('mylogin', 'home');
navStack.add('profile', 'dashboard');
navStack.add('profileEditBasic', 'dashboard');
navStack.add('profileEditEdu', 'dashboard');
navStack.add('profileEditCert', 'dashboard');
navStack.add('profileEditAvatar', 'dashboard');
navStack.add('teacher', 'teachers');
// test
// console.log(navStack);
// console.log(navStack.root);
// console.log(navStack.findParent('dashboard'));
// console.log(navStack.findParent('one_teacher'));
// console.log(navStack.findParent('profile'));