var assert, first, one, second, spawn;

assert = require('assert');
spawn = require('child_process').spawn;

// output from each program
first = null;
second = null;

// first program sets
one = spawn('node', ["" + __dirname + "/drop-one.js", 'set']);

one.stdout.on('data', function(data) {
  first = JSON.parse(data.toString());
  one.kill('SIGHUP');
});

one.on('exit', function() {
  var two = spawn('node', ["" + __dirname + "/drop-one.js"]);

  two.stdout.once('data', function(data) {
    second = JSON.parse(data.toString());
    console.log('first', JSON.stringify(first, null, 2));
    console.log('second', JSON.stringify(second, null, 2));
    assert.deepEqual(first, second);
  });
});
