/* globals performance, chrome */
(function (namespace) {
  'use strict'
  var resourceAnalyzeNames = {}
  var isMonitoring = false
  if (!('performance' in window)) {
    namespace.analyzeEntries = function () {}
  } else {
    var getEntries = performance.getEntriesByType || performance.webkitGetEntriesByType || performance.msGetEntriesByType || performance.mozGetEntriesByType || null
    if (!getEntries) {
      namespace.analyzeEntries = function () {}
    }
  }
  var analyzeEntries = function (search, callback) {
    // Checks
    if (typeof search !== 'string' && !(search instanceof RegExp)) {
      throw 'Please enter a regex or a string in analyzeEntries function'
    }

    var res = []
    var perfEntries = getEntries.call(performance, 'resource')

    for (var i = 0, max = perfEntries.length; i < max; i++) { // Cross entries tab
      var name = perfEntries[i].name
      if (encodeURI(search) === name || name.match(search) != null) {
        if (!(name in resourceAnalyzeNames)) {
          res.push(perfEntries[i]) // If 'search' is found we stock the entries tab in results tab for callback
          resourceAnalyzeNames[name] = true
        }
      }
    }

    if (res.length === 0) {
      return false
    }
    setTimeout(function () {
      callback(res)
    }, 0) // Callback all results tab for 'search'
    return true
  }

  namespace.analyzeEntries = namespace.analyzeEntries || analyzeEntries
  namespace.startResourceMonitoring = function (search, callback) {
    if(!search || !callback)
      return false
/*        if ( typeof search !== 'string' && !( search instanceof RegExp) ) {
      throw "Please enter a regex or a string in analyzeEntries function";
    }*/

    // once every 4 seconds after that
    if (!isMonitoring) {
      startPeriodicAnalysis()
    }
    isMonitoring = true
    addToQueue(search, callback)
  }

  const interval = 2000

  function startPeriodicAnalysis () {
    // check what has been downloaded at 2 important moments
    addEvent(document, 'DOMContentLoaded', readQueue)
    addEvent(window, 'load', readQueue)

    setTimeout(function me () {
      if (!isMonitoring) {
        return false
      }
      readQueue()
      setTimeout(me, interval)
    }, interval)
  }

  const queue = [] // a Set would have been better, but it does not support retrieval of a key composed from 2 objects
  function addToQueue (search, callback) {
    queue.push({search, callback})
  }
  function removeFromQueue (search, callback) {
    // first find
    const index = queue.findIndex((item, index) => {
      if (search === item.search && callback === item.callback)
        return true
      return false
    })
    // then remove
    if (index > -1)
      queue.splice(index, 1)
  }
  function readQueue() {
    queue.forEach( item => {
      if (namespace.analyzeEntries(item.search, item.callback) === true)
        removeFromQueue(item.search, item.callback)
    })

    // console.info(queue)
    // when queue is empty, we can stop monitoring
    if (queue.length === 0)
      namespace.stopResourceMonitoring()
  }

  namespace.stopResourceMonitoring = function () {
    isMonitoring = false
  }

  /**
   *  uses non standard methods of IE9 (not 10) and Chrome to get the first paint time
   *  @param callback : browsers that implemented this wait some time before calculating
   *  time to first paint. The argument given back to the callback will be
   *  the number of milliseconds between navigationStart and first pixel displayed
   *  Plan for cases when the callback is never executed
   */
  var iNumberOfTries = 0,
    iDelay = 500,
    iMaxTries = 10,
    // let's be positive some time, we'll feature detect later
    bIsFeatureSupported = true;
  // Edge Case : chrome frame is giving insane time (years…)
  if ('externalHost' in window) {
    bIsFeatureSupported = false
  }

  namespace.getFirstPaintTime = function getFirstPaintTime (callback) {
    if (bIsFeatureSupported === false) {
      return false
    }
    var firstPaintTime
    if ('chrome' in window && 'loadTimes' in chrome) {
      // chrome gives the time with timestamp = seconds.millisecond
      firstPaintTime = chrome.loadTimes().firstPaintTime
      firstPaintTime = Math.round(firstPaintTime * 1000)
    } else if ('performance' in window && 'timing' in performance && 'msFirstPaint' in performance.timing) {
      // IE9 has an expected format : timestamp in milliseconds
      firstPaintTime = performance.timing.msFirstPaint
    } else {
      bIsFeatureSupported = false
    }

    if (bIsFeatureSupported === true) {
      // console.log(firstPaintTime+' '+performance.timing.navigationStart);
      firstPaintTime -= performance.timing.navigationStart
      if (firstPaintTime > 0) {
        // bugs found in productin : an IE user agent saying the page displayed after more than one year
        // did not found the reason, so preventing here crazy times (more than 10 minutes)
        if (firstPaintTime > 600000) {
          return false
        }
        setTimeout(function () {
          callback(firstPaintTime)
        }, 0)
      } else if (iMaxTries > iNumberOfTries) {
        setTimeout(function () {
          iNumberOfTries++
          getFirstPaintTime(callback)
        }, iDelay)
      }
    }
  }

  var addEvent = function (el, ev, fn) {
    if (el.addEventListener) {
      el.addEventListener(ev, fn, false)
    }
  }
})(window.WPERF = window.WPERF || {})

// for this lib to work in commonJS environments
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = window.WPERF
}
