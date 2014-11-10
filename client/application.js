
// Set location as (0,0)
Session.setDefault('loc', [0,0]);

// Statup function
Meteor.startup(function () {
  navigator.geolocation.getCurrentPosition(saveLocation);
});

// Add new drop
Template.newDrop.events({
  'change .myFileInput': function(event, template) {
    var loc = Session.get('loc');
    if( 0 != loc[0] && 0 != loc[1] ) {
      console.log('uploading');
      FS.Utility.eachFile(event, function(file) {
        DropFiles.insert(file, function (err, fileObj) {
          if(err) throw(err);
          console.log('success', fileObj);
          Drops.insert({
            loc: {
              type: "Point",
              coordinates: loc
            },
            file: fileObj._id,
            date: new Date()
          });
        });
      });
    } else {
      alert("Plz, allow us to know your location");
    }
  }
});

// Get all drops
Template.allDrops.helpers({
  drops: function() {
    var loc = Session.get('loc');
    if( 0 != loc[0] && 0 != loc[1] ) {
      navigator.geolocation.getCurrentPosition(saveLocation);
      return Drops.find({
        loc: {
          $near: {
            $geometry: { type: "Point",  coordinates: Session.get('loc') }
          }
        }
      }, {
        limit: 5,
      });
    }
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
