/* globals performance */
!(function (namespace) {
  'use strict'
  var timers = {}
  /*
  * Collect a timing value you calculated yourself (1.2s = 1200 milliseconds) :
  * namespace.tracktime(
      { category:'page name',
        subcategory:'display first image',
        timing: 1200
      });
  *
  * mark an important moment, like the loading of an image
  * <img src="xxx" onload="namespace.tracktime(
      { category:'Page article',
        subcategory:'image principale', label:this.src)" />
  */
  namespace.trackTime = function (args) {
    // defaults
    var {
      category = 'Global', // {string} in GA, the category name
      subcategory = '', // {string} in GA, the variable
      timing = 0, // {number}, milliseconds  = performance.now() by default
      label = '-', // {string} very optional, allows for more details in the tracking (like the name of the resource tracked)
      probability = 10, // {number}, percentage, between 0 and 100  = will limit the number of reports sent back to your backend
      once = true // {boolean}: set to false if you want to allow tracking multiple time the same triplet (cat/subcat/label)
    } = args

    // no value given, let's ask that to the browser
    if (!timing && 'performance' in window && 'now' in performance) {
      // call performance.mark() - standard way to track time (for ex by WPT)
      if ('mark' in performance) {
        performance.mark(category + ' - ' + subcategory)
      }

      timing = performance.now()
      // more than 1 hour ? some weird browsers (maxthon, some versions of IE 11) report crazy times ( > 10 hours)
      // let ignore them
      if (timing > 3600000) {
        return false
      }
    }

    if (!category || !subcategory) {
      throw 'mandatory parameters : "category" and "subcategory"'
    }

    if (once && category + subcategory + label in timers)
      return false
    timers[category + subcategory + label] = true

    timing = Math.round(timing)
    if (timing) {
      // log
      'console' in window && console.info('Timings', category, subcategory, timing)
      // threshold
      if (Math.random() * 100 > probability)
        return true
      // send to google analytics universal (https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings)
      // dont forget to set a siteSpeedSampleRate to 100% https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#siteSpeedSampleRate
      if ('ga' in window && timing) {
          ga('send', 'timing', category, subcategory, timing, label)
      }
      // uncomment this line if you need ALL the stats, even if GA is not there yet
      // window._gaq = window._gaq || [];
      // send to google analytics, legacy version (https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiUserTiming)
      if ('_gaq' in window && timing) {
        _gaq.push(["_trackTiming", category, subcategory, timing, label, 100]);
      }

      // Send to webperf.io (basilic) http://support.basilic.io/getting_started/user-timings.html
      if ('FOGLIO' in window) {
        var name = category + ' ' + subcategory + ' ' + label
        name = name.replace(/^[a-zA-Z0-9_-]/g, '_')
        FOGLIO.q('mark', {
        // console.log('mark', {
          name: name,
          value: performance.timing.navigationStart + timing
        })
      }
    }
  }

  // auto-execute collecting the first paint time (only if requestTracker library is there : https://github.com/jpvincent/requestTracker )
  'WPERF' in window && namespace.getFirstPaintTime(function (timeToFirstPaint) {
    namespace.trackTime(
      {category: 'Page Load', subcategory: 'First Paint', timing: timeToFirstPaint})
  })
  // auto-record the page connection time (mainly latency of the user)
  'performance' in window &&
    'timing' in window.performance &&
    performance.timing.connectEnd > 0 &&
    performance.timing.connectStart > 0 &&
    performance.timing.connectEnd - performance.timing.connectStart > 0 &&
    namespace.trackTime({category: 'Page Load', subcategory: 'connection time',
      timing: (performance.timing.connectEnd - performance.timing.connectStart)})
})(window.WPERF = window.WPERF || {})

// for this lib to work in commonJS environments
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = window.WPERF.trackTime
}
