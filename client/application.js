
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
        processFiles(file);
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
        limit: 10,
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

processFiles = function(file) {
  var reader = new FileReader();

  // Lorsque le fichier aura été entièrement lu, la fonction resizeImage sera lancée
  reader.onloadend = function(evt) {
    // reader.result représente notre fichier encodé en base64
    resizeImage(reader.result, file);
  };

  // Permet de lancer la lecture du fichier
  reader.readAsDataURL(file);
};

resizeImage = function(data, file) {
  var fileType = file.type,
    maxWidth = 550,
    maxHeight = 760;
  

  // On charge le fichier dans une balise <img>
  var image = new Image();
  image.src = data;

  // Une fois l'image chargée, on effectue les opérations suivantes
  image.onload = function() {
    // La fonction imageSize permet de calculer la taille finale du fichier en conservant les proportions
    var size = imageSize(image.width, image.height, maxWidth, maxHeight),
      imageWidth = size.width,
      imageHeight = size.height,

      // On créé un élément canvas 
      canvas = document.createElement('canvas');
        
    canvas.width = imageWidth;
    canvas.height = imageHeight;

    var ctx = canvas.getContext("2d");

    // drawImage va permettre le redimensionnement de l'image
    // this représente ici notre image
    ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

    // Permet d'exporter le contenu de l'élément canvas (notre image redimensionnée) au format base64
    data = canvas.toDataURL(fileType);
    
    // On supprime tous les éléments utilisés pour le redimensionnement
    delete image;
    delete canvas;
    

    var loc = Session.get('loc');
    var newFile = new FS.File(data);
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
  }
};


// Fonction permettant de redimensionner une image en conservant les proportions
imageSize = function(width, height, maxWidth, maxHeight) {
  var newWidth = width, 
      newHeight = height;
  
  if (width > height) {
    if (width > maxWidth) {
      newHeight *= maxWidth / width;
      newWidth = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      newWidth *= maxHeight / height;
      newHeight = maxHeight;
    }
  }

  return { width: newWidth, height: newHeight };
};

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}
