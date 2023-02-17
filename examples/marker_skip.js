const { proc_markers, def_marker } = require ('../marker.js') ;

function assert ( expected, actual ) {
    if ( expected != actual ) throw new Error( "Assertion error " + expected + " != " + actual  ) ;
}


// Definition of a marker that puts a skipping property to
// the context object.
def_marker ( /say\s+(.*)+/, ( regex, marker, fn, context ) => {
    if ( context['skip-future-say-markers'] )
        return fn ;
    context['skip-future-say-markers'] = true ;
    const groups  = regex.exec ( marker ) ;
    const message = groups[1] ;
    return function() {
        fn.apply ( this, arguments ) ;
        return message ;
    }
} ) ;


const test1 = proc_markers ( () => {
   "say hi";
   return void(0) ;
}) ;

const test2 = proc_markers ( () => {
    "say hello"
    return void(0);
}) ;

const test3 = proc_markers ( () => {
    "say hi";
    "say hello";
    return void(0) ;
} ) ;

assert ( 'hi', test1() ) ;
assert ( 'hello', test2() ) ;
assert ( 'hi', test3() ) ;