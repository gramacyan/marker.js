/*
 * marker.js v0.1 - Javascript annotation markers
 *

 Copyright (c) 2022 by Benny Bangels
 https://github.com/gramacyan/marker.js

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.

*/
( function ( global ) {

    /** @private */
    let processors = [] ;

    /*
     def_marker ( <regexp>, <prio>, <fn> )  ;
       This method is used to register a marker.
     # Parameters
     1. regex <required>
        A regular expression to match markers against.
     2. fn <required>
         A function that applies the marker logic.
    # Returns
        A boolean declaring the method's success.
    */
    function def_marker ( regex, fn ) {
        if ( ! ( regex instanceof RegExp ) ) {
            // Let also support strings
            if ( 'string' === typeof regex ) {
                regex = RegExp ( regex ) ;
            }
            else {
                throw 'Unable to register marker, % is no valid regular expression'.replace( '%' , regex ) ;
            }
        }
        processors.push ( {
            regex : regex,
            fn    : fn
        } ) ;
        return true ;
    } ;

    /*
     proc_marker ( <fn> )  ;
       This method is used to construct a function enhanced
       with marker logic.
       marker.
     # Parameters
     1. fn <required>
        A function containing one or more markers.
    # Returns
        The original provided or a newly marker-enhanced function.
    */
    function proc_markers ( fn ) {
        if ( fn['__marker_context'] ) {
            return fn ; // Check if already enhanced, no need to double process
        }

        const markers = [] ;
        const s       = String (fn) ;
        let i         = 0  ;
        let buf       = ''  ;
        let in_b      = false ;
        let in_m      = false  ;

        // Read markers
        while ( i++ < s.length ) {
            const c = s.charAt( i ) ;
            if ( ! in_b ) {
                if ( c === '{' ) {
                    in_b = true ;
                }
                continue ;
            }
            if ( in_m ) {
                if ( c === '"' ) {
                    in_m = false ;
                    markers.push( buf.trim () ) ;
                    buf = '' ;
                }
                else buf += s.charAt( i ) ;
            }
            else {
                if ( c === '"' ) in_m = true ;
                else if ( !(c === '\n' || c === '\t' || c === '\n' || c === ' ' || c === ';' ) ) break ;
            }
        }
        if ( ! markers.length ) {
            return fn ;
        }

        // Init context
        const context = {
          origin     : fn,
          markers    : markers,
          it         : 0
        } ;
        fn['__marker_context'] = context ;

        // Processing
        markers.forEach( marker => {
            if ( 'use strict' == marker ) return ; // skip
            for ( var i = 0, l = processors.length ; i < l ; i++ )
            {
                const processor = processors[i] ;
                const regex     = processor['regex'] ;
                if ( regex.test ( marker ) )
                {
                    context.iteration++ ;
                    fn = processor['fn'].call ( marker, regex, marker, fn, context ) || fn ; // original fn if undefined result
                    fn['__marker_context'] = context ;
                }
            }
        });
        return fn ;
    } ;

    // Export
    const export_obj =
    {
       proc_markers : proc_markers ,
       def_marker   : def_marker,
       globalize    : function () { Object.assign( global, export_obj ) ; }
    } ;
    if ( typeof exports === 'object' && typeof module === 'object' )
    /* CommonJS*/ { module.exports = export_obj ; }
    else
    {
        if ( typeof define === "function" && define.amd )
        /* AMD */ { define( [], export_obj ) ; }
        else
        /* Browser */ { global["marker_js"] = export_obj ; }
    }

})( Function( 'return this' )() ) ;

