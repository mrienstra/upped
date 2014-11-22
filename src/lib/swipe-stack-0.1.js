/* =============================================================

    Swipe Stack v0.1
    Forked from https://github.com/cferdinandi/slider/commit/ca84cb4eff61e4aa13f17ed59b027280e497fdfd

    Licensed under the MIT license.
    http://gomakethings.com/mit/

 * ============================================================= */

if ( 'querySelector' in document && 'addEventListener' in window ) {

  var Swipe = function (container, options) {

    "use strict";

    // utilities
    var noop = function() {}; // simple no operation function
    var offloadFn = function(fn) { setTimeout(fn || noop, 0); }; // offload a functions execution

    // check browser capabilities
    var browser = {
      addEventListener: !!window.addEventListener,
      pointer: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
      touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
      transitions: (function(temp) {
        var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
        for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
        return false;
      })(document.createElement('swipe'))
    };

    var eventNames = {
      START: 'touchstart',
      MOVE: 'touchmove',
      END: 'touchend'
    };

    var pointerType = 'touch';

    if (window.navigator.pointerEnabled) {
      eventNames.START = "pointerdown";
      eventNames.MOVE = "pointermove";
      eventNames.END = "pointerup";
    } else if (window.navigator.msPointerEnabled) {
      eventNames.START = "MSPointerDown";
      eventNames.MOVE = "MSPointerMove";
      eventNames.END = "MSPointerUp";
      pointerType = 2;
    }

    // quit if no root element
    if (!container) return;
    var element = container.children[0];
    var slides, slidePos, width, length; //, sliderSideMargin;
    options = options || {};
    var index = parseInt(options.startSlide - 1, 10) || 0;
    var speed = options.speed !== undefined ? options.speed : 300;
    var paused = false;

    var setup = function () {

      // cache slides
      slides = element.children;
      length = slides.length;

      // create an array to store current positions of each slide
      slidePos = new Array(slides.length);

      // determine width of each slide
      /* container.style.width = '';
      sliderSideMargin = container.getBoundingClientRect().left || 0;
      width = (container.getBoundingClientRect().width || container.offsetWidth) - sliderSideMargin * 2; */
      width = container.getBoundingClientRect().width || container.offsetWidth;

      container.style.width = width + 'px';
      element.style.width = width + 'px';

      // stack elements
      var pos = slides.length;
      while(pos--) {

        var slide = slides[pos];

        slide.style.width = width + 'px';
        slide.setAttribute('data-index', pos);
        slide.style.zIndex = slides.length - pos; // stack using z-index (alternative: move from last to first)

        if (browser.transitions) {
          // don't arrange in a row
          move(pos, 0, 0); // don't arrange in a row, leave in a stack
        }

      }

      // reposition elements before and after index
      if (browser.transitions) {
        move(circle(index-1), 0, 0); // don't arrange in a row, leave in a stack
        move(circle(index+1), 0, 0); // don't arrange in a row, leave in a stack
      }

      if (!browser.transitions) element.style.left = (index * -width) + 'px';

      visibleThree(index, slides);

      container.style.display = 'block'; // use display to hide / show

    };

    var prev = function () {

      slide(index-1);

    };

    var next = function () {

      slide(index+1);

    };

    var nextLeft = function () {

      if (index < slides.length) {
        move(index, slidePos[index] - width - 20, speed); // 20 so shadow can clear viewport before disappearing. if side margin: - sliderSideMargin
        
        offloadFn(options.callback && options.callback(index, 'left'));

        index = circle(index+1);
      }

    };

    var nextRight = function () {

      if (index < slides.length) {
        move(index, slidePos[index] + width + 20, speed); // 20 so shadow can clear viewport before disappearing. if side margin: + sliderSideMargin

        offloadFn(options.callback && options.callback(index, 'right'));

        index = circle(index+1);
      }

    };

    var pause = function () {
      paused = true;
    };

    var unpause = function () {
      paused = false;
    };

    var circle = function (index) {

      // a simple positive modulo using slides.length
      return (slides.length + (index % slides.length)) % slides.length;

    };

    var slide = function (to, slideSpeed) {
      // Called by public API only (slide, prev, next), no internal calls

      // do nothing if already on requested slide
      if (index == to) return;

      if (browser.transitions) {

        var direction = Math.abs(index-to) / (index-to); // 1: backward, -1: forward

        // get the actual position of the slide
        var natural_direction = direction;
        direction = -slidePos[circle(to)] / width;

        // if going forward but to < index, use to = slides.length + to
        // if going backward but to > index, use to = -slides.length + to
        if (direction !== natural_direction) to =  -direction * slides.length + to;

        var diff = Math.abs(index-to) - 1;

        // move all the slides between index and to in the right direction
        while (diff--) move( circle((to > index ? to : index) - diff - 1), width * direction, 0);

        to = circle(to);

        move(index, width * direction, slideSpeed || speed);
        move(to, 0, slideSpeed || speed);

        move(circle(to - direction), -(width * direction), 0); // we need to get the next in place

      } else {

        to = circle(to);
        animate(index * -width, to * -width, slideSpeed || speed);
        //no fallback for a circular continuous if the browser does not accept transitions
      }

      index = to;
    };

    var move = function (index, dist, speed) {

      translate(index, dist, speed);
      slidePos[index] = dist;

    };

    var translate = function (index, dist, speed) {

      var slide = slides[index];
      var style = slide && slide.style;

      if (!style) return;

      style.webkitTransitionDuration =
      style.MozTransitionDuration =
      style.msTransitionDuration =
      style.OTransitionDuration =
      style.transitionDuration = (speed || 1) + 'ms';

      style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
      style.msTransform =
      style.MozTransform =
      style.OTransform = 'translateX(' + dist + 'px)';

    };

    var animate = function (from, to, speed) {

      // if not an animation, just reposition
      if (!speed) {

        element.style.left = to + 'px';

        visibleThree(index, slides);
        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

        return;

      }

      var start = +new Date;

      var timer = setInterval(function() {

        var timeElap = +new Date - start;

        if (timeElap > speed) {

          element.style.left = to + 'px';

          if (delay) begin();

          visibleThree(index, slides);
          options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

          clearInterval(timer);
          return;

        }

        element.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';

      }, 4);

    };

    // hide all slides other than current one
    function visibleThree(index, slides) {

      var pos = slides.length;

      // first make this one visible
      slides[index].style.display = 'block'; // use display to hide / show

      // then check all others for hiding
      while(pos--) {

        /*
        if(pos === circle(index) || pos === circle(index-1) || pos === circle(index+1)){
          slides[pos].style.visibility = 'visible';
        } else {
          slides[pos].style.visibility = 'hidden';
        }
        */

        if (pos === index) {
          // Do nothing, already made visible
        } else if (pos === index + 1 || pos === index + 2) { // show current and next 2, not current and adjacent
          slides[pos].style.display = 'block'; // use display to hide / show
        } else {
          slides[pos].style.display = 'none'; // use display to hide / show
        }

      }

    }

    // setup auto slideshow
    var delay = options.auto || 0;
    var interval;

    var begin = function () {

      interval = setTimeout(next, delay);

    };

    var stop = function () {

      delay = 0;
      clearTimeout(interval);

    };


    // setup initial vars
    var start = {};
    var delta = {};
    var isScrolling;

    // setup event capturing
    var events = {

      handleEvent: function(event) {

        switch (event.type) {
          case eventNames.START: this.start(event); break;
          case eventNames.MOVE: this.move(event); break;
          case eventNames.END: offloadFn(this.end(event)); break;
          case 'webkitTransitionEnd':
          case 'msTransitionEnd':
          case 'oTransitionEnd':
          case 'otransitionend':
          case 'transitionend': offloadFn(this.transitionEnd(event)); break;
          case 'resize': offloadFn(setup.call()); break;
        }

        if (options.stopPropagation) event.stopPropagation();

      },
      start: function(event) {

        var touches = browser.touch ? event.touches[0] : event;

        // measure start values
        start = {

          // get initial touch coords
          x: touches.pageX,
          y: touches.pageY,

          // store time to determine touch duration
          time: +new Date

        };

        // used for testing first move event
        isScrolling = undefined;

        // reset delta and end measurements
        delta = {};

        // attach touchmove and touchend listeners
        element.addEventListener(eventNames.MOVE, this, false);
        element.addEventListener(eventNames.END, this, false);

      },
      move: function(event) {

        if (paused) return;

        if ( browser.pointer && (event.pointerType !== pointerType) ) return;

        // ensure swiping with one touch and not pinching
        if ( browser.touch && event.touches.length > 1 || event.scale && event.scale !== 1) return;

        if (options.disableScroll) event.preventDefault();
        if ( browser.pointer && (event.pointerType !== pointerType) ) return;
        var touches = browser.touch ? event.touches[0] : event;

        // measure change in x and y
        delta = {
          x: touches.pageX - start.x,
          y: touches.pageY - start.y
        };

        // determine if scrolling test has run - one time test
        if ( typeof isScrolling == 'undefined') {
          isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
        }

        // if user is not trying to scroll vertically
        if (!isScrolling) {

          // prevent native scrolling
          event.preventDefault();

          // stop slideshow
          stop();

          // deleted line: don't move other slides
          translate(index, delta.x + slidePos[index], 0);
          // deleted line: don't move other slides

        }

      },
      end: function(event) {

        // measure duration
        var duration = +new Date - start.time;

        // determine if slide attempt triggers next/prev slide
        var isValidSlide =
              Number(duration) < 250               // if slide duration is less than 250ms
              && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
              || Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

        // determine direction of swipe (true:right, false:left)
        var direction = delta.x < 0;

        // if not scrolling vertically
        if (!isScrolling) {

          if (isValidSlide) {

            if (direction) { // direction: forward

              // deleted lines: don't move other slides

              move(index, slidePos[index] - width - 20, speed); // 20 so shadow can clear viewport before disappearing. if side margin: - sliderSideMargin
              // deleted line: don't move other slides

              offloadFn(options.callback && options.callback(index, 'left'));

              index = circle(index+1);

            } else { // direction: backward
              // deleted lines: don't move other slides

              move(index, slidePos[index] + width + 20, speed); // 20 so shadow can clear viewport before disappearing. if side margin: + sliderSideMargin
              // deleted line: don't move other slides

              offloadFn(options.callback && options.callback(index, 'right'));

              index = circle(index+1); //index = circle(index-1);

            }

          } else { // return to previous position

            // deleted line: don't move other slides
            move(index, 0, speed);
            // deleted line: don't move other slides

          }

        }

        // kill touchmove and touchend event listeners until touchstart called again
        element.removeEventListener(eventNames.MOVE, events, false);
        element.removeEventListener(eventNames.END, events, false);

      },
      transitionEnd: function(event) {

        visibleThree(index, slides);

        if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

          if (delay) begin();

          options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

        }

      }

    };

    // trigger setup
    setup();

    // start auto slideshow if applicable
    if (delay) begin();


    // add event listeners
    if (browser.addEventListener) {

      // set touchstart event on element
      if (browser.touch || browser.pointer) element.addEventListener(eventNames.START, events, false);

      if (browser.transitions) {
        element.addEventListener('webkitTransitionEnd', events, false);
        element.addEventListener('msTransitionEnd', events, false);
        element.addEventListener('oTransitionEnd', events, false);
        element.addEventListener('otransitionend', events, false);
        element.addEventListener('transitionend', events, false);
      }

      // set resize event on window
      window.addEventListener('resize', events, false);

    } else {

      window.onresize = function () { setup() }; // to play nice with old IE

    }

    // expose the Swipe API
    return {
      setup: function() {

        setup();

      },
      slide: function(to, speed) {

        // cancel slideshow
        stop();

        slide(to, speed);

      },
      prev: function() {

        // cancel slideshow
        stop();

        prev();

      },
      next: function() {

        // cancel slideshow
        stop();

        next();

      },
      nextLeft: function() {

        // cancel slideshow
        stop();

        nextLeft();

      },
      nextRight: function() {

        // cancel slideshow
        stop();

        nextRight();

      },
      getPos: function() {

        // return current index position
        return index + 1;

      },
      getNumSlides: function() {

        // return total number of slides
        return length;
      },
      pause: function() {

        // Temporarily disable slideshow (will not respond to drags)
        pause();

      },
      unpause: function() {

        // Unpause slideshow (will respond to drags again)
        unpause();

      },
      kill: function() {

        // cancel slideshow
        stop();

        // reset element
        element.style.width = 'auto';
        element.style.left = 0;

        // reset slides
        var pos = slides.length;
        while(pos--) {

          var slide = slides[pos];
          slide.style.width = '100%';
          slide.style.left = 0;

          if (browser.transitions) translate(pos, 0, 0);

        }

        // removed event listeners
        if (browser.addEventListener) {

          // remove current event listeners
          element.removeEventListener(eventNames.START, events, false);
          element.removeEventListener('webkitTransitionEnd', events, false);
          element.removeEventListener('msTransitionEnd', events, false);
          element.removeEventListener('oTransitionEnd', events, false);
          element.removeEventListener('otransitionend', events, false);
          element.removeEventListener('transitionend', events, false);
          window.removeEventListener('resize', events, false);

        }
        else {

          window.onresize = null;

        }

      }
    };

  };

}

module.exports = Swipe;