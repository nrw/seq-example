var level = require('level')
    , assert = require('assert')
    , sublevel = require('level-sublevel')
    , scuttlebutt = require('level-scuttlebutt')
    , Doc = require('crdt').Doc
    , udid = require('udid')('example-app')

// setup db
newDB = function () {
  var db = sublevel(level(__dirname + "/_db"))

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

  doc.on('sync', function(){ console.log('sync') })

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
