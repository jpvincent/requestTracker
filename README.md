Why ?
-

requestTracker allows you to :
* know the time your real users spend on some strategical HTTP requests.
* know when the user really starts to see the page

That's useful for :
* know when your tracking beacon is really executed (aka, how much users your marketing team misses)
* know when important images are finally downloaded (aka, when is this images slideshow really seen)
* know when .swf files are there (aka, when does my ad or video really start)
* determine the browser time to first paint

How ?
-

Using the [Performance timeline API](http://www.w3.org/TR/performance-timeline/) to retrieve HTTP requests from the browser. Information given in the callback are a merge of [PerformanceEntry](http://www.w3.org/TR/performance-timeline/#sec-PerformanceEntry-interface) and [PerformanceResourceTiming](http://www.w3.org/TR/resource-timing/#performanceresourcetiming).

The information are retrieved at DOM ready, at onload, then there is a check every second.

For Time to First Paint, we are using two non-standard methods :
* [performance.timing.msFirstPaint](http://msdn.microsoft.com/en-us/library/ie/ff974719(v=vs.85).aspx) (IE9 +)
* chrome.loadTimes().firstPaintTime (Chrome)

Compatibility
-

Compatible with more than one third of your desktop users, enough to have realistic data :
* IE10 (mobile included)
* Chrome (mobile included)
* Opera (mobile include)

On incompatible browsers, that simply does nothing.

Usage
-

For a demo or to test on browsers, execute demo.html

Basic example : starts monitoring of the main homepage image.

```javascript
PT.startResourceMonitoring(
	/main-content\.png/, // give a RegexP object
	function(timingCollection){ // receive a collection of PerformanceEntry + PerformanceResourceTiming objects
		console.log(
			timingCollection[0].name
			+' arrived after '
			+timingCollection[0].responseEnd +' ms'
		);
		PT.stopResourceMonitoring();
	});
```

Don't like infinite loops ? Stop monitoring after onload

```javascript
window.addEventListener('load', PT.stopResourceMonitoring, false);
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

On Chrome and IE 9, get the number of milliseconds between page request and first pixels displayed

```javascript
_gaq.push(['_trackTiming', 'Global figures', 'Time to paint first pixels', PT.getFirstPaintTime() ]);
```
