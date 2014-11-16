// declare collections
// this code should be included in both the client and the server

Drops = new FS.Collection("drops", {
  stores: [new FS.Store.GridFS("drops")],
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
if(Meteor.isServer) {
  Drops.files._ensureIndex( { "metadata.loc" : "2dsphere" } );
};

// server: populate collections with some initial documents
