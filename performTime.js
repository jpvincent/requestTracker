!(function(namespace) {
	'use strict';
	var $ = window.$ || require('jquery');
	var timers = {};
	/*
	*	Collect a timing value you calculated yourself (1.2s = 1200 milliseconds) :
	*	namespace.tracktime(
			{	category:'page name',
				subcategory:'display first image',
				timing: 1200
			});
	*
	*	mark an important moment, like the loading of an image
	*	<img src="xxx" onload="namespace.tracktime(
			{	category:'Page article',
				subcategory:'image principale', label:this.src)" />
	*/
	namespace.trackTime = function(params) {
		// defaults
		var defaults = {
			category: 'Global', // {string} in GA, the category name
			subcategory: '', // {string} in GA, the variable
			timing: 0, // {number}, milliseconds : performance.now() by default
			label: '-', // {string} very optional, allows for more details in the tracking (like the name of the resource tracked)
			probability: 15, // {number}, percentage, between 0 and 100 : will limit the number of reports sent back to your backend
			once: true,	// {boolean}: set to false if you want to allow tracking multiple time the same triplet (cat/subcat/label)
		};
		params = $.extend(defaults, params);

		// no value given, let's ask that to the browser
		if (!params.timing && 'performance' in window && 'now' in performance) {
			// call performance.mark() - standard way to track time (for ex by WPT)
			if ('mark' in performance) {
				performance.mark(params.category + ' - ' + params.subcategory);
			}

			params.timing = performance.now();
			// more than 1 hour ? some weird browsers (maxthon, some versions of IE 11) report crazy times ( > 10 hours)
			// let ignore them
			if (params.timing > 3600000) {
				return false;
			}
		}

		if (!params.category || !params.subcategory) {
			throw 'mandatory parameters : "category" and "subcategory"';
		}

		if (params.once && params.category + params.subcategory + params.label in timers)
			return false;
		timers[params.category + params.subcategory + params.label] = true;

		params.timing = Math.round(params.timing);
		if (params.timing) {
			// log
			"console" in window && console.log('timings', params.category, params.subcategory, params.timing);
			// threshold
			if(Math.random()*100 < params.probability)
				return true;
			// send to google analytics universal (https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings)
			if ('ga' in window && params.timing) {
					ga('send', 'timing', params.category, params.subcategory, params.timing, params.label);
			}
			// send to google analytics, legacy version (https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiUserTiming)
			if ('_gaq' in window && params.timing) {
				_gaq.push(["_trackTiming", params.category, params.subcategory, params.timing, params.label]);
			}
		}

	};

	// auto-execute collecting the first paint time (only if requestTracker library is there : https://github.com/jpvincent/requestTracker )
	"PT" in window && PT.getFirstPaintTime(function(timeToFirstPaint) {
		namespace.trackTime(
			{category:"Page Load", subcategory:"First Paint", timing:timeToFirstPaint});

	});
	// auto-record the page connection time (mainly latency of the user)
	"performance" in window 
		&& "timing" in window.performance 
		&& performance.timing.connectEnd > 0 
		&& performance.timing.connectStart > 0 
		&& performance.timing.connectEnd - performance.timing.connectStart > 0 
		&& namespace.trackTime({category :"Page Load", subcategory:"connection time", 
				timing: (performance.timing.connectEnd - performance.timing.connectStart)} );

})(window);


// for this lib to work in commonJS environments (like nodeJS)
if (typeof module === "object" && typeof module.exports === "object") {
	module.exports = window.trackTime;
}
