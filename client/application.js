
// Set location as (0,0)
Session.setDefault('loc', [0,0]);

// Statup function
Meteor.startup(function () {
  navigator.geolocation.getCurrentPosition(saveLocation);
});

// Add drop button
Template.addDrop.events({
  'click #addDrop' : function() {
    $('.newDrop').toggleClass('active');
  }
});

// Add new drop
Template.newDrop.events({
  'change .dropFileInput': function(event, template) {
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
          $('.dropFileInput').fadeOut();
          $('.newDrop form').prepend('<p class="check">Drop is done &#10004;</p>');
          $('.dropCaptionInput').data('drop', fileObj._id);
        });
      });
    } else {
      alert("Plz, allow us to know your location");
    }
  },
  'click .submitCaption': function (event) {
    event.preventDefault();
    event.stopPropagation();
    var fileID = $('.dropCaptionInput').data('drop'),
      caption = $('.dropCaptionInput').val();
    Drops.update({ _id: fileID }, { $set: {'metadata.caption': caption} } );
    $('.newDrop').toggleClass('active');
    $('.dropFileInput').fadeIn();
    $('.check').remove();
  },
  'click .closeNewDrop': function() {
    var fileID = $('.dropCaptionInput').data('drop');
    Drops.remove({ _id: fileID } );
    $('.newDrop').toggleClass('active');
    $('.check').remove();
    $('.dropCaptionInput').val('').data('drop','');
    $('.dropFileInput').fadeIn();
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
