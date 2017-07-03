
//factory pattern + Abstract factory pattern

//Client
var BMWDealer = function(series){
  var seriesRequest = series, seriesType = [1, 2, 3, 4], seriesModel;
  var getSeriesModel = function(series, i){
    if(seriesRequest === series){
      seriesModel = Series(series);
      return true;
    }
  };
  seriesType.forEach(getSeriesModel);
  return seriesModel;
};

//Factory: creates new objects as instructed by the client via a factoryMethod() call
var Series = function(sid){
  switch(sid){
    case 1:
      return new OneSeries();
      
    case 2:
      return new TwoSeries();
      
    case 3:
      return new ThreeSeries();
    
    case 4:
      return new FourSeries();
  }
};

//Abstract Factory: Creates objects with properties/methods which are common across all object variants
function AbstractSeries(){
  this._id = Math.floor(Math.random()*11);
}

AbstractSeries.prototype = {
  "getId": function(){
    return this._id;
  },
  "getType": function(){
    return this._type;
  }
};


//Available series -> IProduct
function OneSeries(){
  this._type = "1 Series";
  AbstractSeries.call(this);//OneSeries GETS PROPS/METHODS from AbstractSeries
}

OneSeries.prototype = Object.create(AbstractSeries.prototype);
OneSeries.prototype.constructor = OneSeries;

function TwoSeries(){
  this._type = "2 Series";
  AbstractSeries.call(this);
}

TwoSeries.prototype = Object.create(AbstractSeries.prototype);
TwoSeries.prototype.constructor = TwoSeries;

function ThreeSeries(){
  this._type = "3 Series";
  AbstractSeries.call(this);
}

ThreeSeries.prototype = Object.create(AbstractSeries.prototype);
ThreeSeries.prototype.constructor = ThreeSeries;


function FourSeries(){
  this._type = "4 Series";
  AbstractSeries.call(this);
}

FourSeries.prototype = Object.create(AbstractSeries.prototype);
FourSeries.prototype.constructor = FourSeries;


//As many different customers want different types of bimmers, we wanna
//know what they bought
function Customer(series){
  this.bought = function(){
    return series.getType();
  };
  this.getVehicleId = function(){
    return series.getId();
  };
}

//So, what bmw series did customers 1, 2 and 3 buy at the BMW dealer today???
var James = new Customer(BMWDealer(4)),
    Chrissy = new Customer(BMWDealer(2)),
    Brian = new Customer(BMWDealer(3)),
    Sandy = new Customer(BMWDealer(1));

console.log("James bought " + James.bought()+" vehicle ID: "+James.getVehicleId());
console.log("Chrissy bought " + Chrissy.bought()+" vehicle ID: "+Chrissy.getVehicleId());
console.log("Brian bought " + Brian.bought()+" vehicle ID: "+Brian.getVehicleId());
console.log("Sandy bought " + Sandy.bought()+" vehicle ID: "+Sandy.getVehicleId());
