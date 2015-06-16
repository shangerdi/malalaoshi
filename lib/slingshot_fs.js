/*
 These file upload restrictions are validated on the client and then appended to
the directive on the server side to enforce them:
 Important: The fileRestrictions must be declared before the the directive is instantiated.
*/
Slingshot.fileRestrictions("myHeadImgUploads", {
  allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
  maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited)
});