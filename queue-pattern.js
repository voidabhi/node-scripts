(function(){
    var util = (function(){
        var  Queue = function Queue(){
            var  methods = [],
                 flushed = false,
                 add = function( fn ){
                     if( flushed ) {
                          fn( response );
                     } else {
                          methods.push( fn );
                     }
                 },
                 flush = function(){
                     if( flushed ) {
                          return;
                     }
                     flushed = true;
                     while ( methods[0] ) {
                         methods.shift().apply( this, arguments );
                     }
                 }, 
                    step = function(){
                    var fn = methods.shift();
                    if ( fn ) { fn.apply( this, arguments ); }
                 };     
                 Queue.prototype.add = add;
                 Queue.prototype.flush = flush;
                 Queue.prototype.step = step;
              },
              queue = new Queue();
         return {
              queue: function( q ){
                   if ( q != null ){
                        if ( typeof( q ) === 'function' ) {
                             queue.add( q );
                        } else {
                             queue.flush();
                        }
                   } else {
                        queue.step();
                   }
                   return this;
              }
         };
    }(   function( target, node ) { return target.appendChild( node ); },
         function( tag ) { return document.createElement( tag ); } ));
    util
    .queue( function(){ document.body.innerHTML = 'One<br>' } )
    .queue( function(){ document.body.innerHTML += 'Two<br>' } )
    .queue( function(){ document.body.innerHTML += 'Three<br>' } )
    .queue( true ); 
}());
