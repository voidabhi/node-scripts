var n = 3;
var b = 0;
// Try block denotes the area where exception can be raised
 try{ 
	var c = n/b;
	if(c==Infinity) 
		throw new Error('this error is caused by invalid operation');  // Throwing exception object for raising exception
	}catch (err){	// Blocks get executed if any exception occurs, err object catches thrown exception object
		console.log(err);
	}