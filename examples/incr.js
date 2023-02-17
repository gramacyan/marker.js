const { proc_markers, def_marker } = require ('../marker.js') ;

function assert ( expected, actual ) {
    if ( expected != actual ) throw new Error( "Assertion error " + expected + " != " + actual  ) ;
}

let incr = ( num ) => {
   "use strict";
   "incr +1";

   return num ;
}  ;

assert ( 41 , incr ( 41 ) ) ;

def_marker ( /incr\s+(\+|\-)?\s*(\d+)/, ( regex, marker, fn, ctx ) => {
    const groups = regex.exec ( marker ) ;
    const sign = groups[1] || '+' ;
    const num  = Number( groups[2] ) * ( sign === '-' ? -1 : 1 ) ;
    return function() {
        return fn.apply ( this, arguments ) + num ;
    }
});

incr = proc_markers ( incr ) ;

assert ( 42 , incr(41) ) ;