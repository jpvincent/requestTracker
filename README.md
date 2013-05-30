+ Why ?

requestTracker allows you to know the time your real users spend on some strategical HTTP requests. That's useful for :
* know when your tracking beacon is really executed (aka, how much users your marketing team misses)
* know when important images are finally downloaded (aka, when is this images slideshow really seen)
* know when .swf files are there (aka, when does my ad or video really start)

+ How ?

Using the "Resource Timing API" and 
http://w3c-test.org/webperf/specs/ResourceTiming/#performanceresourcetiming

+ Compatibility

Compatible with more than 2 thirds of your desktop and mobile users, enough to have realistic data :
* IE10
* Chrome (mobile included)
* Firefox (mobile included)

On incompatible browsers, that simply does nothing.