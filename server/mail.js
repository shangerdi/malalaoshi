Meteor.methods({
  sendmail: function(order) {
    var to = 'i@liangsun.org';
    var from = 'service@feichanglaoshi.com';
    var subject = 'New teacher enrolled';
    var text = 'Feichanglaoshi.com has new teacher enrolled, please login to audit.';
    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: to,
      from: from,
      subject: subject,
      text: text
    });
  }
});
