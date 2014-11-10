Session.setDefault('loc', [0,0]);
Meteor.startup(function () {
});

function savePosition(loc) {
  console.log("position", loc);
  Session.set("loc", [loc.coords.longitude, loc.coords.latitude]);
}

// counter starts at 0
Session.setDefault("counter", 0);

Template.hello.helpers({
  counter: function () {
    return Session.get("counter");
  }
});

Template.hello.events({
  'click button': function () {
    // increment the counter when button is clicked
    Session.set("counter", Session.get("counter") + 1);
  }
});


Template.newDrop.events({
  'change .myFileInput': function(event, template) {
    console.log('uploading');
    FS.Utility.eachFile(event, function(file) {
      DropFiles.insert(file, function (err, fileObj) {
        if(err) throw(err);
        console.log('success', fileObj);
        Drops.insert({
          loc: {
            type: "Point",
            coordinates: Session.get('loc') 
          },

          //coordinates: [ -110.8571443, 32.4586858 ]
          //coordinates: [ Session.get('loc')[0], Session.get('loc')[1] ]
          file: fileObj._id,
          date: new Date()
        });
      });
    });
  }
});

Template.allDrops.helpers({
  drops: function() {
    navigator.geolocation.getCurrentPosition(savePosition);
    return Drops.find({
      loc: {
        $near: {
          $geometry: { type: "Point",  coordinates: Session.get('loc') }
        }
      }
    }, {
      limit: 5,
      sort: {
        date: -1
      }
    });
   }
});

Template.dropFile.helpers({
  file: function() {
    return DropFiles.findOne({_id: this.file});
  }
});
