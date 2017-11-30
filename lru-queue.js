var lruQueue = require('lru-queue');
var queue = lruQueue(3); // limit size to 3 


queue.hit('dwa');    // undefined, size: 2 
queue.hit('trzy');   // undefined, size: 3 (at max) 
queue.hit('raz');    // undefined, size: 3 (at max) 
queue.hit('dwa');    // undefined, size: 3 (at max) 
queue.hit('cztery'); //  'trzy', size: 3 (at max) 

queue.delete('raz'); // size: 2 
queue.delete('cztery'); // size: 1 

queue.clear(); // size: 0 
