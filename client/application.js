
// Set location as (0,0)
Session.setDefault('loc', [0,0]);

// Statup function
Meteor.startup(function () {
});

// Add new drop
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

// Get all drops
Template.allDrops.helpers({
  drops: function() {
    navigator.geolocation.getCurrentPosition(saveLocation);
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

// Get each drop file
Template.dropFile.helpers({
  file: function() {
    return DropFiles.findOne({_id: this.file});
  }
});

/* Misc */

// Save location
function saveLocation(loc) {
  console.log("position", loc);
  Session.set("loc", [loc.coords.longitude, loc.coords.latitude]);
}