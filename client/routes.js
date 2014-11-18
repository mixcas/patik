Router.configure({
  layoutTemplate: 'Layout'
});

Router.route('/', function () {
  this.render('allDrops');
});

Router.route('/drop/:_id', function () {
  var params = this.params;
  this.render('Drop', {
    data: {
      drops: function () { return Drops.findOne({ _id: params._id}) }
    }
  });
});

