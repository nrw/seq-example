var level = require('level')
  , assert = require('assert')
  , sublevel = require('level-sublevel')
  , scuttlebutt = require('level-scuttlebutt')
  , Doc = require('crdt').Doc
  , udid = require('udid')('example-app')
  , test = require('tape')
  , rimraf = require('rimraf')

// setup db
newDB = function () {
  var db = sublevel(level(__dirname + "/_db"))
  scuttlebutt(db, udid, function(name) {return new Doc;});
  return db
}

// rm -rf database
test('setup', function(t){
  rimraf(__dirname + "/_db", function(){ t.end() })
})

test('modifying a sequence persists correctly', function(t) {
  t.plan(1)
  var DB = newDB()

  DB.open('one-doc', function(err, doc1) {
    var seq = doc1.createSeq('session', 'one');

    seq.push({id: 'a'});
    seq.push({id: 'b'});
    seq.push({id: 'c'});
    seq.after('a', 'b');

    var firstOutput = seq.toJSON()

    // is 'drain' the right event to listen for here?
    DB.on('drain', function(){

      DB.close(function(err){
        if (err) console.log('err', err);

        // reopen DB
        var anotherDB = newDB()

        anotherDB.open('one-doc', function(err, doc2) {
          var seq = doc2.createSeq('session', 'one');

          var secondOutput = seq.toJSON()

          // console.log(firstOutput)
          // console.log(secondOutput)
          t.same(firstOutput, secondOutput)
        })
      })
    })
  })
})
