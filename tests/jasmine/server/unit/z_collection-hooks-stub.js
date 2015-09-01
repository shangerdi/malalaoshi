var Security = {
  defineMethod: function () {},
  apply: function () {return this;},
  userOwnOrder: function () {return this;},
  ifHasRole: function() {return this;},
  userSelf: function() {return this;},
  ownsDocument: function() {return this;},
  never: function() {return this;}
};

Meteor.users.attachSchema = function () {};
Meteor.users.permit = function() { return Security;};
beforeEach(function () {
  Meteor.users.attachSchema = function () {};
  Meteor.users.permit = function() { return Security;};
});

var originalMeteorCollection = Meteor.Collection;

Meteor.Collection = function () {
  var collectionHooks = {
    before: {
      insert: [],
      update: [],
      remove: []
    },
    after: {
      insert: [],
      update: [],
      remove: []
    }
  };

  this.attachSchema = function(hook) {
  };
  this.permit = function () {
    return Security;
  };
  this.before = {
    insert: function (hook) {
      collectionHooks.before.insert.push(hook);
    },
    update: function (hook) {
      collectionHooks.before.update.push(hook);
    },
    remove: function (hook) {
      collectionHooks.before.remove.push(hook);
    }
  };

  this.after = {
    insert: function (hook) {
      collectionHooks.after.insert.push(hook);
    },
    update: function (hook) {
      collectionHooks.after.update.push(hook);
    },
    remove: function (hook) {
      collectionHooks.after.remove.push(hook);
    }
  };

  this.before.insert.run = generateHookRunner(this, collectionHooks.before.insert);
  this.before.update.run = generateHookRunner(this, collectionHooks.before.update);
  this.before.remove.run = generateHookRunner(this, collectionHooks.before.remove);

  this.after.insert.run = generateHookRunner(this, collectionHooks.after.insert);
  this.after.update.run = generateHookRunner(this, collectionHooks.after.update);
  this.after.remove.run = generateHookRunner(this, collectionHooks.after.remove);

  originalMeteorCollection.apply(this, arguments);
};

mockMeteorCollection();
beforeEach(function () {
  mockMeteorCollection();
});

function mockMeteorCollection() {
  Meteor.Collection.prototype = originalMeteorCollection.prototype;
  // Remove this from the prototype (coming from meteor-stubs)
  delete Meteor.Collection.after;
  delete Meteor.Collection.before;
  delete Meteor.Collection.attachSchema;
  Mongo.Collection = Meteor.Collection;
}

function getCollectionHookContext(collection) {
  return {
    transform: function (document) {
      collection._transform(document);
    }
  };
}

function generateHookRunner(collection, hooks) {
  return function (userId, document) {
    hooks.forEach(function (hook) {
      hook.call(getCollectionHookContext(collection), userId, document);
    })
  };
}
