
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
        var newFile = new FS.File(file);
        newFile.metadata = {
          loc: {
            type: "Point",
            coordinates: loc
          },
          date: new Date()
        };
        Drops.insert(newFile, function (err, fileObj) {
          if(err) throw(err);
          console.log('success', fileObj);
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
        "metadata.loc": {
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

/* Misc */

// Save location
function saveLocation(loc) {
  console.log("position", loc);
  Session.set("loc", [loc.coords.longitude, loc.coords.latitude]);
}
