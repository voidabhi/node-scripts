var CircularBuffer = require("circular-buffer");
 
var buf = new CircularBuffer(3);
console.log(buf.capacity()); // -> 3
buf.enq(1);
buf.enq(2);
console.log(buf.size()); // -> 2
buf.toarray(); // -> [2,1]
buf.push(3);
buf.toarray(); // -> [2,1,3]
buf.enq(4);
console.log(buf.size()); // -> 3  (despite having added a fourth item!)
buf.toarray(); // -> [4,2,1]
buf.get(0); // -> 4  (last enqueued item is at start of buffer)
buf.get(0,2); // -> [4,2,1]  (2-parameter get takes start and end)
buf.toarray(); // -> [4,2,1]  (equivalent to buf.get(0,buf.size() - 1) )
console.log(buf.deq()); // -> 1
buf.toarray(); // -> [4,2]
buf.pop(); // -> 2  (deq and pop are functionally the same)
buf.deq(); // -> 4
buf.toarray(); // -> []
buf.deq(); // -> throws RangeError("CircularBuffer dequeue on empty buffer"
