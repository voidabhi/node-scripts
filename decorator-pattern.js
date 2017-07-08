


var Modal = (function(){ // using the javascript module pattern to create pseudo-classes and encapsulated scopes
  "use strict"; // switch compatable browsers into ES5 mode

  return function() { // returning a function which returns an object makes an instanciable class.
    var object = {};
    // insert custom object creation code in here
    return object; // return the class instance
  };
})(); // auto-executing code, ala the javascript module pattern

var MaximiseDecorator = (function(){ // using the javascript module pattern to create pseudo-classes and encapsulated scopes
  "use strict"; // switch compatable browsers into ES5 mode
  function addTo(object){ // module pattern - private scope function which accepts an object to decorate
    object.maximise = function() { // attach a method to the object passed in
      console.log("I'm going to maximise myself!"); // show it's working
    }
  }

  function removeFrom(object){ // module pattern - private scope function which accepts an object to decorate
    object.maximise = undefined; // remove any references to the function we attached originally
  }

  return { // the public API that this class exposes
    addTo : addTo,
    removeFrom : removeFrom
  }
})(); // auto-executing code, ala the javascript module pattern

// ==== Sample implementation

var modal = new Modal();
modal.maximise(); // outputs "Error: undefined is not a method (windowInstance.maximise)"

MaximiseDecorator.addTo(modal);
modal.maximise(); // outputs "I'm going to maximse myself!"

MaximiseDecorator.removeFrom(modal);
modal.maximise(); // outputs "Error: undefined is not a method (windowInstance.maximise)"

if(typeof(modal.maximise) === "function") {
  modal.maximise(); // outputs "I'm going to maximse myself!"
}
