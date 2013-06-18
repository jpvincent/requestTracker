(function(){
	PT = window.PT || {};
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

    var addEvent = function(el, ev, fn) {
        if (el.addEventListener) {
            el.addEventListener(ev, fn, false);
        }
    };

})();
