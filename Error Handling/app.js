var n = 3;
var b = 0;

 try{ 
	var c = n/b;
	if(c==Infinity) 
		throw new Error('this error is caused by invalid operation');  
	}catch (err){	
		console.log(err);
	}