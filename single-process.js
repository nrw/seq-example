var assert = require('assert')
// setup db
newDB = function () {
  var level = require('level')
    , sublevel = require('level-sublevel')
    , scuttlebutt = require('level-scuttlebutt')
    , Doc = require('crdt').Doc
    , udid = require('udid')('example-app')
    , db = sublevel(level("" + __dirname + "/_db"))

  scuttlebutt(db, udid, function(name) {return new Doc;});

  return db
}

var DB = newDB()

DB.open('one-doc', function(err, doc) {
  var seq = doc.createSeq('session', 'one');

  seq.push({id: 'a'});
  seq.push({id: 'b'});
  seq.push({id: 'c'});
  seq.after('a', 'b');

  var firstOutput = JSON.stringify(seq.asArray())
  console.log(firstOutput)

  DB.close(function(err){
    if (err) console.log('err', err);

    var anotherDB = newDB()

    anotherDB.open('one-doc', function(err, doc) {
      var seq = doc.createSeq('session', 'one');

      setTimeout(function() {
        var secondOutput = JSON.stringify(seq.asArray())
        console.log(secondOutput)
        assert.equal(firstOutput, secondOutput)
      }, 300);
    })
  })
});
