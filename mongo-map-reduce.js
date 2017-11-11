var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db_name');

// map function
var map = function(){
  emit(this.field_to_group_by, {
    other_fields: this.other_fields
    // list other fields like above to select them
  })
}

// reduce function
var reduce = function(key, values){
  return {
    other_fields: values[0].other_fields, 
    // list other fields like above to select them
    // here i am returning values[0] because the fields are already sorted
    // write your reduce logic here
  };
}

// condition
var query = { 
  'field_1' : req.body.field_1,
  'field_2' : req.body.field_2,
  'date_field' : new Date(req.body.date_field),
  'field_3' : { $lte : req.body.field_3 },
  'bool_field': true
}

// map-reduce command
var command = {
  mapreduce: "collection_name", // the name of the collection we are map-reducing
  map: map.toString(), // a function for mapping
  reduce: reduce.toString(), // a function  for reducing
  query: query, // filter conditions
  sort: {field_3: 1}, // sorting on field_3 (also makes the reducing process faster)
  out: {inline: 1}  // doesn't create a new collection, includes the result in the output obtained
};

// execute map-reduce command
mongoose.connection.db.executeDbCommand(command, function(err, dbres) {
  if(err) throw err;
  
  // restrict the results to 15 (you can restrict to any number you want)
  dbres.documents[0].results.splice(14, dbres.documents[0].results.length-15)
  
  // sort the map-reduced results on field_3
  var sortedResults = dbres.documents[0].results.sort(function(current, next){
    return current.value.field_3 - next.value.field_3
  })
  
  var finalGroupedResult = [];
  
  // clean up the results returned by mapreduce
  sortedResults.forEach(function(obj, index){
    finalGroupedResult.push(obj.value)
  });
  
  // render results page
  res.render('view/path/to/render', {
    title: 'Title of the page',
    results: finalGroupedResult
  });
});
