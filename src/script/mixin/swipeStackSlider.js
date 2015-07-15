// Libs
var swipeStack = require('../../lib/swipe-stack-0.1.js');

var SwipeStackSliderMixin = {
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.buttonsToTop && !this.props.buttonsToTop) {
      this.handleSliderPause();
    } else if (!nextProps.buttonsToTop && this.props.buttonsToTop) {
      this.handleSliderUnpause();
    }
  },
  sliderInit: function (window, document, slider, btnPrev, btnNext, undefined) {
    'use strict';

    var that = this;

    var i, l;

    // Feature Test
    if ( 'querySelector' in document && 'addEventListener' in window && Array.prototype.forEach ) {

      // EVENTS, LISTENERS, AND INITS

      // METHODS

      // Handle next button
      var handleNextBtn = function (event) {
        event.preventDefault();
        mySwipe.nextRight();
      };

      // Handle previous button
      var handlePrevBtn = function (event) {
        event.preventDefault();
        mySwipe.nextLeft();
      };

      that.handleSliderPause = function(){
        mySwipe.pause();
      };

      that.handleSliderUnpause = function(){
        mySwipe.unpause();
      };

      // EVENTS, LISTENERS, AND INITS

      // Activate Slider
      var mySwipe = swipeStack(slider, {
        callback: that.swipeStackCallback
      });

      // Toggle Previous & Next Buttons
      if (btnNext) {
        if (btnNext.length) {
          for (i = 0, l = btnNext.length; i < l; i++) {
            btnNext[i].addEventListener('click', handleNextBtn, false);
          }
        } else {
          btnNext.addEventListener('click', handleNextBtn, false);
        }
      }
      if (btnPrev) {
        if (btnPrev.length) {
          for (i = 0, l = btnPrev.length; i < l; i++) {
            btnPrev[i].addEventListener('click', handlePrevBtn, false);
          }
        } else {
          btnPrev.addEventListener('click', handlePrevBtn, false);
        }
      }

      // Add class to HTML element to activate conditional CSS
      window.setTimeout(function(){
        document.documentElement.classList.add('js-slider');
      }, 10);
    }
  }
};

module.exports = SwipeStackSliderMixin;