# marker.js

**marker.js** is a javascript library that adds annotation 
support to functions, it does this in a natural way without 
introducing additional syntax or requiring compilation-time. 
This library aims to be small, extensible and framework
independent. Out of the box it just features a few helper
functions ready to declare your own set of uniques markers.

This library is inspired by the (commonly known) `"use strict";` 
directive. Thus, markers are to be declared as String-literals, 
surrounded by double quotes and are only processed when 
detected at the start of a function. Multiple markers should be 
separated with one or more whitespace characters (\r\n\s\t) 
or by a semi-colon (;).  

```
incr_by_one = proc_markers ( n => {
    "add +1" ; // <------- 
    return n  ;
}) ;
```

### Writing marker logic

To make the above sample work we have to write some logic that adds 
the specified number in the marker with the result. This can be 
achieved by writing a processor by using the `def_marker` registerer.
By providing a marker *matcher regexp*
and a *processing function* we can manipulate the input function
returning a wrapper that adds the specified number to the
result.

```
// Rexgep matcher for: 'add +n'
const matcher = /add\s+(\+|\-)?\s*(\d+)/ ;

// Register the matcher and its logic 
def_marker ( matcher, ( matcher, marker_text, orignal_function ) => {
    const groups = matcher.exec (marker_text) ;
    const sign   = groups[1] || '+'           ; // positive or negative number
    const num    = Number(sign + groups[2])   ; // numeric value
    
    return function () { 
        return orignal_function.apply (this, arguments) + num; 
    }
});
```

Make sure your function with the `add`-marker is defined after 
registering the marker definition. Invoking this function should now be
processed and returns the desired result (+1):

```
const the_meaning_of_life = incr_by_one (41) ; // 42
```

### Processing context

Internally this library scans for markers and processes this function
in order of the declarations. Therefor you might want to pass down 
information in the processing-chain. The *context* argument in the 
`def_marker` can  be utilized for that.

```
def_marker ( <regexp> , <function> ( matcher , marker , fn , context ) ) ;
                                                             ^^^^^^^
```

Out of the box it already contains properties related to processing.
```
{
    origin  : <fn>,              // Original function
    markers : [<string>],        // List of detected markers
    it      : <num>              // Position in the process-chain
}
```

### Examples
For more examples you might want to take a look in the [examples](examples) directory.