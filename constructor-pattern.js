
function Constructor(){
  this.foo = 'foo';
  
  // Needed for Private methods
  var self = this;
  
  // Private methods need to be placed inside the Constructor.
  // Doesn't perform as well as prototype methods (as not shared across instances)
  function private(){
    console.log('I am private');
    console.log(self.foo);
  }

  // Privileged methods need to be placed inside the Constructor.
  // This is so they can get access to the Private methods.
  this.privileged = function(){
    private();
  };
}

Constructor.prototype.public = function(){
  console.log('I am public');
};

constructor = new Constructor;

console.log(constructor.foo);


constructor.public();     // will work
constructor.privileged(); // will work
constructor.private();    // won't work (can't be accessed directly)
