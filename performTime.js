(function(){
	window.PT = window.PT || {};
	var resourceAnalyzeNames={};
	var isMonitoring = true;
	if(!window.performance){
		PT.analyzeEntries = function(){};
	}
	else{
		var getEntries = performance.getEntries || performance.webkitGetEntries || performance.msGetEntries || performance.mozGetEntries || null;
		if(!getEntries){
			PT.analyzeEntries = function(){};
		}
	}
	var	analyzeEntries = function(search, callback) {
		//Checks
		if(!'exec' in search) {
			throw "Please enter a regex in analyzeEntries function";
	    }

		//Variables
		var res=[];
		var perfEntries = getEntries.call(performance);
		//Code

		for (var i = 0, max = perfEntries.length ; i < max ; i++) { //Cross entries tab
			var name = perfEntries[i].name
			if(name.match(search) != null) {
			    if (!(name in resourceAnalyzeNames)){
			    	res.push(perfEntries[i]); //If 'search' is found we stock the entries tab in results tab for callback
			  		resourceAnalyzeNames[name]=true;
			  	}
			}
				
		}
	   	if(res.length == 0){
	    	return true;
		}
		setTimeout(
			function(){
				callback(res)
			}, 0); //Callback all results tab for 'search'
		return false;
	}

	PT.analyzeEntries = PT.analyzeEntries || analyzeEntries;
    PT.startResourceMonitoring = function(regex, callback, interval){
    	if(!interval){
    		interval = 1000;
    	}
		isMonitoring=true;
		// check what has been downloaded at 2 important moments + Infinity : when DOM is ready, on load, and once every second after that
		addEvent(document, 'DOMContentLoaded',function(){
	    	PT.analyzeEntries(regex, callback);
	    });

	    addEvent(window, 'load', function(){
	        PT.analyzeEntries(regex, callback);
	        setTimeout(
		       	function(){
			            if(!isMonitoring){
			            	return false;
			            }
			            PT.analyzeEntries(regex, callback);
			            setTimeout(arguments.callee,interval);
		        },interval);
	    });
    };

    PT.stopResourceMonitoring = function(){
    	isMonitoring = false;
    };

	
    /**
    *	uses non standard methods of IE9 (not 10) and Chrome to get the first paint time
    *	@param callback : browsers that implemented this wait some time before calculating 
    *	time to first paint. The argument given back to the callback will be 
    *	the number of milliseconds between navigationStart and first pixel displayed
    *	Plan for cases when the callback is never executed
    */
	var iNumberOfTries = 0,
		iDelay = 500,
		iMaxTries = 10,
		// let's be positive some time, we'll feature detect later
		bIsFeatureSupported = true;
	// Edge Case : chrome frame is giving insane time (years…)
	if('externalHost' in window)
		bIsFeatureSupported = false;
	
	PT.getFirstPaintTime = function getFirstPaintTime(callback) {
		if(bIsFeatureSupported === false)
			return false;

		if('chrome' in window
			&& 'loadTimes' in chrome) {
			// chrome gives the time with timestamp = seconds.millisecond
			var firstPaintTime = chrome.loadTimes().firstPaintTime;
			firstPaintTime = Math.round(firstPaintTime * 1000);
		} else if('performance' in window
					&& 'timing' in performance
					&& 'msFirstPaint' in performance.timing) {
			// IE9 has an expected format : timestamp in milliseconds
			var firstPaintTime = performance.timing.msFirstPaint;
		} else {
			bIsFeatureSupported = false;
		}

		if(bIsFeatureSupported === true) {
			// console.log(firstPaintTime+' '+performance.timing.navigationStart);
			firstPaintTime -= performance.timing.navigationStart;
			if(firstPaintTime > 0) {
				// bugs found in productin : an IE user agent saying the page displayed after more than one year
				// did not found the reason, so preventing here crazy times (more than 10 minutes)
				if(firstPaintTime > 600000)
					return false;
				setTimeout(function () {
					callback(firstPaintTime);
				}, 0);
			} else if(iMaxTries > iNumberOfTries) {
				setTimeout(function () {
					iNumberOfTries++;
					getFirstPaintTime(callback);
				}, iDelay);
			}
		}
	};

    var addEvent = function(el, ev, fn) {
        if (el.addEventListener) {
            el.addEventListener(ev, fn, false);
        }
    };

})();