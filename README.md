# Why ?

requestTracker allows you to :
* know the time your real users spend on some strategical HTTP requests.
* know when the user really starts to see important areas of the page

That's useful for :
* determine the browser time to first paint
* know when your tracking beacon is really executed (aka, how much users your marketing team misses)
* know when important images are finally downloaded (aka, when is this images slideshow really seen)
* know when your styled text is readable, by checking the Font download time

# How ?

Using the [Performance timeline API](http://www.w3.org/TR/performance-timeline/) to retrieve HTTP requests from the browser. Information given in the callback are a merge of [PerformanceEntry](http://www.w3.org/TR/performance-timeline/#sec-PerformanceEntry-interface) and [PerformanceResourceTiming](http://www.w3.org/TR/resource-timing/#performanceresourcetiming).

The information are retrieved every few seconds, at DOM ready and when the page is loaded.

For Time to First Paint, we are using two non-standard methods :
* [performance.timing.msFirstPaint](http://msdn.microsoft.com/en-us/library/ie/ff974719(v=vs.85).aspx) (IE9 +)
* chrome.loadTimes().firstPaintTime (Chrome)

# Compatibility

[Compatible](http://caniuse.com/#feat=resource-timing) with more than 70% of your users, enough to have realistic data :
* IE10 and Edge (mobile included)
* Firefox (mobile included)
* Chrome (mobile included) and Opera
* Some versons of the android stock browser

On incompatible browsers, that simply does nothing.

# Test

For a demo or to test on your browsers, point to ```demo/index.html``` on localhost (not from disk). If you have NodeJS, run ```npm install``` then ```npm test``` to have a static server mounted on http://localhost:2888/demo.html and open the browser on it (MacOS).

# Usage

## Installation

Include ```measuretime.js``` in your page. It will expose three methods :
* ```WPERF.analyzeEntries( RegExp|String , callback)```
* ```WPERF.startResourceMonitoring( RegExp|String , callback)```
* ```WPERF.stopResourceMonitoring()```

NPM user ? Do this : ```npm install https://github.com/jpvincent/requestTracker/archive/v2.0.0.tar.gz --save```, then the file is in ```node_modules/request-tracker/measuretime.js```.

## Examples

Wait for the onload event and know when a certain request has finally arrived.

```javascript
WPERF.analyzeEntries(
	/main-content\.png/, // give a RegexP object or a string
	function(timingsCollection){ // receive a collection of PerformanceTiming PerformanceResourceTiming objects
		console.log(
			timingsCollection[0].name,
			' arrived after ',
			timingsCollection[0].responseEnd, ' ms'
		);
	});
```

You know that most of your visitors dont wait for the onload event, so we provide a way to monitor the requests. Eg: Monitor when the main homepage image finally arrives, this time

```javascript
WPERF.startResourceMonitoring(
	'http://my-host.fr/static/main-content.png', // if a String, must be the exact location
	function(timingsCollection){
		console.log(
			timingsCollection[0].name,
			' arrived after ',
			timingsCollection[0].responseEnd, ' ms'
		);
		WPERF.stopResourceMonitoring();
	});
```

Don't like the idea of infinite loops running in the browser ? When there is nothing left to monitor, we stop resource monitoring anyway but you can stop monitoring manually, say after onload.

```javascript
window.addEventListener('load', WPERF.stopResourceMonitoring, false);
```

On Chrome and IE9+, get the number of milliseconds between the page request and first pixels displayed by using ```WPERF.getFirstPaintTime(callback)```. You can then use this number to send it to Google Analytics like that :

```javascript
WPERF.getFirstPaintTime(function(firstPaintTime) {
	ga('send', 'timing', 'Global figures', 'Time to paint first pixels', firstPaintTime)
})
```


# What to do with those numbers ?

```measuretime.js``` get the HTTP request details : where to send those informations ?
```tracktime.js``` is the other script I use by my customers from RUM (Hi, I'm webperf freelancer, why not [hire me](mailto:jp@braincracking.fr)?). It sends the performance details to a visualization and storage backend, like [Google Analytics User Timings](https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings) or [Basilic](http://basilic.io/).

It provides the ```trackTime()``` method, with the following arguments and defaults values

```javascript
trackTime({
  category = 'Global', // {string} in GA, the category name
  subcategory = '', // {string} in GA, the variable
  timing = 0, // {number}, milliseconds  = performance.now() by default
  label = '-', // {string} very optional, allows for more details in the tracking (like the name of the resource tracked)
  probability = 10, // {number}, percentage, between 0 and 100  = will limit the number of reports sent back to your backend
  once = true // {boolean}: set to false if you want to allow tracking multiple time the same triplet (cat/subcat/label)
})
```

Now you can send the time to first paint value to your backend :

```javascript
WPERF.getFirstPaintTime(function(firstPaintTime) {
	WPERF.trackTime({
		  category:'Global figures',
		 	subcategory:'Time to paint first pixels', 
		 	timing: firstPaintTime
	})
})
```

Say you want to know when you users see a styled text, you can monitor the font file and grah times with your backend:

```javascript
WPERF.startResourceMonitoring(
	/myfont\.woff/,
	function(timingCollection) {
    WPERF.trackTime({
      category: 'Page Load',
      subcategory: 'Main font file',
      label: timingCollection[0].name,
      timing: timingCollection[0].responseEnd
    })
  }
)
```

If you do not provide the ```timing``` argument, we use ```performance.now()```: that is the time since the page has been requested. Additionally we use the standard method ```performance.mark()``` who can be catched by powerful tools like WebPageTest.

Say you have a JS video player that provides you an event when the preroll ads starts, you can monitor that simply :

```javascript
player.addEventListener('ad_start', function(event) {
  WPERF.trackTime({
    category: 'Video',
    subcategory: 'Preroll ads start'
  })
})
```

You can know when your logo becomes visible, with simply HTML :

```html
 <img src="our-proud-logo.svg" onload="WPERF.trackTime(
        { category: 'Navigation',
          subcategory: 'Logo loaded',
          label: this.src
        })"
  />
```
