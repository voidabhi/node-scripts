var myModule = require('myModule');
var webservice = myModule({someOptions: ''});

webservice.run(data, function(err, res){
   //Do something
});

function MyModule(options) {
   this.options = options || options;
};

MyModule.prototype.myFunc = function() {

};

module.exports = exports = function(options) {
   return new MyModule(options);
}
