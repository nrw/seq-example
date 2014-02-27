
var DB, Doc, db, domready, leveljs, levelup, reconnect, scuttlebutt, sublevel, udid, widget;

domready = require('domready');
levelup = require('levelup');
sublevel = require('level-sublevel');
scuttlebutt = require('level-scuttlebutt');
leveljs = require('level-js');
widget = require('reconnect-widget');
reconnect = require('reconnect-core')(require('shoe'));
Doc = require('crdt').Doc;
udid = require('udid')('example-app');

// setup db
DB = sublevel(levelup('store', {db: leveljs}));
db = DB.sublevel('one-store');
scuttlebutt(db, udid, function(name) {return new Doc;});

domready(function() {
  var target = document.getElementById('doc');

  // open local copy
  db.open('one-doc', function(err, doc) {
    var draw, r, seq;
    if (err) {console.log('ERR', err)}

    // make a sequence
    seq = doc.createSeq('session', 'one');

    // connect to server
    r = reconnect({}, function(stream) {
      var ds;

      // replicate with server crdt
      ds = doc.createStream();
      stream.pipe(ds).pipe(stream);
      // show any errors
      stream.on('error', function() {
        console.log('ERR');
        return ds.destroy();
      });
      return ds.on('error', function() {
        console.log('ERR');
        return stream.destroy();
      });
    }).connect('/stream');

    // show connection status
    document.body.appendChild(widget(r));
    // overkill drawing code
    window.draw = draw = function() {
      target.textContent = JSON.stringify(seq.asArray(), null, 2);
    };
    doc.on('create', draw);
    doc.on('row_update', draw);
    setInterval(draw, 1000);

    // ----------------------------------------------------------
    // ----------------------------------------------------------
    // Load Page. Wait 5 seconds. comment out this block. Reload.
    // 'a' is missing from the sequence
    // ----------------------------------------------------------
    seq.push({id: 'a'});
    seq.push({id: 'b'});
    seq.push({id: 'c'});
    seq.after('a', 'b');
    // ----------------------------------------------------------
    // ----------------------------------------------------------
  });
});


