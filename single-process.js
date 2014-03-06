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
  t.plan(2)
  var DB = newDB()

  DB.open('one-doc', function(err, doc1) {
    var seq = doc1.createSeq('session', 'one');

    seq.push({id: 'a'});
    seq.push({id: 'b'});
    seq.push({id: 'c'});
    seq.after('a', 'b');

    // get id order from array
    var firstOutput = seq.asArray().map(function(one){
      return one.get('id')
    })

    // is 'drain' the right event to listen for here?
    console.log(doc1.history())
    DB.on('drain', function(){

      DB.close(function(err){
        if (err) console.log('err', err);

        // reopen DB
        var anotherDB = newDB()

        anotherDB.open('one-doc', function(err, doc2) {
          var seq = doc2.createSeq('session', 'one');

          // get id order from array
          var secondOutput = seq.asArray().map(function(one){
            return one.get('id')
          })


          t.same(doc2.history(), doc1.history())
          t.same(firstOutput, secondOutput)
        })
      })
    })
  })
})
