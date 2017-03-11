/*

schema.proto

enum VehicleType {
  SEDAN = 0;
  COUPE = 1;
  VAN = 2;
}

message Vehicle {
  required int32 price = 0;
  required string make = null;
  optional VehicleType type;
}

message Garage {
  repeated Vehicle vehicles;
}

*/


var protobuf = require('protocol-buffers/require');
var schema = protobuf('schema.proto');

var vehicle = {
  price: 120000,
  make: 'Cadillac',
  type: schema.VehicleType.COUPE
};

var garage = {
  vehicles: [vehicle]
};

console.log(JSON.stringify(garage, null, 2));
console.log(schema.Vehicle.encode(vehicle).toString('hex'));
console.log(schema.Garage.encode(garage).toString('hex'));
