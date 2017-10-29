var repl = require('repl');
var ffi = require('ffi');
var ref = require('ref');
var ArrayType = require('ref-array');
var int = ref.types.int;
var IntArray = ArrayType(int);

var lib = ffi.Library('mylib', {
  'createMatrix': [IntArray, [int, IntArray, int] ]
});

var a = [0, 1, 2, 3, 4];
var array = new IntArray(a);

var result = lib.createMatrix(100, array, array.length);
repl.start('> ').context.r = result;
