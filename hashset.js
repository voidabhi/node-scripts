HashSet = function HashSet(){
  if(!(this instanceof HashSet)) return;

  var _data = {};
  var _length = 0;
  var _DEFAULT = new Date();
  
  this.contains = function(val){
    val = val.toString();
    return (!!_data[val] && _data.hasOwnProperty(val));
  };

  this.add = function(val){
    if(!this.contains(val.toString())){
      _length++;
    }
    _data[val.toString()] = val; 
  };
  
  this.remove = function(val){
    val = val.toString();
    if(!this.contains(val)){
      return false;
    }else{
      delete _data[val.toString()];
      _length--;
      return true;
    }
  };
  
  this.clear = function(){
    for(var val in _data){
      if(_data.hasOwnProperty(val)){
        delete _data[val];
      }
    }
    _length = 0;
  };
  
  this.isEmpty = function(){
    return (_length === 0);
  };
  
  this.size = function(){
    return _length;
  };
  
  this.toArray = function(){
    _data.length = _length;
    var arr = Array.prototype.slice.call(_data);
    delete _data.length;
    return arr;
  };
}
exports.HashSet = HashSet;
