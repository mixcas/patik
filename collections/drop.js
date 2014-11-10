// declare collections
// this code should be included in both the client and the server
Drops = new Mongo.Collection("drops");
if(Meteor.isServer) {
  Drops._ensureIndex( { loc : "2dsphere" } );
};

DropFiles = new FS.Collection("dropFiles", {
  stores: [new FS.Store.GridFS("dropFiles")],
  filter: {
    maxSize: 5242880,
    allow: {
      contentTypes: ['image/*', 'audio/*']
    },
    onInvalid: function (message) {
      if (Meteor.isClient) {
        alert(message);
      } else {
        console.log(message);
      }
    }
  }
});

// server: populate collections with some initial documents
