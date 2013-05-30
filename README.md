Why ?
-

requestTracker allows you to know the time your real users spend on some strategical HTTP requests. That's useful for :
* know when your tracking beacon is really executed (aka, how much users your marketing team misses)
* know when important images are finally downloaded (aka, when is this images slideshow really seen)
* know when .swf files are there (aka, when does my ad or video really start)

How ?
-

Using the [Performance timeline API](http://www.w3.org/TR/performance-timeline/) to retrieve HTTP requests from the browser. Information given in the callback are a merge of [PerformanceEntry](http://www.w3.org/TR/performance-timeline/#sec-PerformanceEntry-interface) and [PerformanceResourceTiming](http://www.w3.org/TR/resource-timing/#performanceresourcetiming).


Compatibility
-

Compatible with more than 2 thirds of your desktop and mobile users, enough to have realistic data :
* IE10
* Chrome (mobile included)
* Firefox (mobile included)

On incompatible browsers, that simply does nothing.

Usage
-

For a demo or to test on browsers, execute index.html

Basic usage : starts monitoring of the main homepage image.

```javascript
PT.startResourceMonitoring(
	/main-content\.png/, // give a RegexP object
	function(timingCollection){ // receive a collection of PerformanceTiming objects
		console.log(
			timingCollection[0].name
			+' arrived after '
			+timingCollection[0].responseEnd +' ms'
		);
		PT.stopResourceMonitoring();
	});
```

Decide when you need to know the timing of the requests

```javascript
PT.analyzeEntries(
	/main-content\.png/, // give a RegexP object
	function(timingCollection){ // receive a collection of PerformanceTiming objects
		console.log(
			timingCollection[0].name
			+' arrived after '
			+timingCollection[0].responseEnd +' ms'
		);
	});

```