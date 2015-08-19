Slingshot.createDirective("imgUploads", Slingshot.S3Storage, {
  bucket: Meteor.settings.S3Bucket,
  acl: "public-read",
  authorize: function() {
    //Deny uploads if user is not logged in.
    if (!this.userId) {
      var message = "Please login before posting files";
      throw new Meteor.Error("Login Required", message);
    }

    return true;
  },
  key: function(file, metaContext) {
    var ext = (file.type)?file.type.substr(file.type.lastIndexOf("/")+1):'jpg';
    return this.userId + "/" + Meteor.uuid() + "." + ext;
  }
});
