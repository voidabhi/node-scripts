var ProtoBuf = require("protobufjs");
var http = require('http');

// Initialize from .proto file
// Requires nyct-subway.proto and gtfs-realtime.proto
var transit = ProtoBuf.loadProtoFile("types.proto").build("SampleType");

var sampleURL = "..."

// HTTP GET the binary feed
http.get(sampleURL, parse);

// process the feed
function parse(res) {
    // gather the data chunks into a list
    var data = [];
    res.on("data", function(chunk) {
        data.push(chunk);
    });
    res.on("end", function() {
        // merge the data to one buffer, since it's in a list
        data = Buffer.concat(data);
        // create a FeedMessage object by decooding the data with the protobuf object
        var msg = transit.FeedMessage.decode(data);
        // do whatever with the object
        console.log(msg);
    });
};
