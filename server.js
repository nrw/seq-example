var DB, Doc, db, ecstatic, http, level, scuttlebutt, server, shoe, sock, sublevel, through, udid;

shoe = require('shoe');
ecstatic = require('ecstatic');
through = require('through');
http = require('http');
level = require('level');
sublevel = require('level-sublevel');
scuttlebutt = require('level-scuttlebutt');
Doc = require('crdt').Doc;
udid = require('udid')('example-app');

// setup db
DB = sublevel(level("" + __dirname + "/_db"));
db = DB.sublevel('one-store');
scuttlebutt(db, udid, function(name) {return new Doc;});

sock = shoe(function(stream) {
  // must pause to open
  var pauser = through();
  stream.pipe(pauser.pause()).pipe(stream);

  db.open('one-doc', function(err, doc) {
    var ds;
    if (err) {console.log('ERR', err);}

    // pipe data
    ds = doc.createStream();
    pauser.pipe(ds).pipe(pauser);
    pauser.resume();

    // show errors
    ds.on('error', function(err) {
      console.log('ERR', err);
    });
  });
  stream.on('error', function() {
    console.log('ERR');
    return pauser.destroy();
  });
  return pauser.on('error', function() {
    console.log('ERR');
    return stream.destroy();
  });
});

// install and listen
server = http.createServer(ecstatic({root: __dirname}));
sock.install(server, '/stream');
server.listen(8080, function() {
  console.log('http://localhost:8080');
});
