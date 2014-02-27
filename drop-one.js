var DB, Doc, db, level, scuttlebutt, sublevel, udid;

level = require('level');
sublevel = require('level-sublevel');
scuttlebutt = require('level-scuttlebutt');
Doc = require('crdt').Doc;
udid = require('udid')('example-app');

// setup db
DB = sublevel(level("" + __dirname + "/_db"));
db = DB.sublevel('one-store');
scuttlebutt(db, udid, function(name) {return new Doc;});

db.open('one-doc', function(err, doc) {
  var seq = doc.createSeq('session', 'one');

  // only first process sets
  if (process.argv[2] === 'set') {
    seq.push({id: 'a'});
    seq.push({id: 'b'});
    seq.push({id: 'c'});
    seq.after('a', 'b');
  }
  return setTimeout(function() {
    return process.stdout.write(JSON.stringify(seq.asArray()));
  }, 300);
});
