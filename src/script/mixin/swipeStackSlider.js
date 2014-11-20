// Libs
var swipeStack = require('../../lib/swipe-stack-0.1.js');

var SwipeStackSliderMixin = {
  sliderInit: function (window, document, btnNext, btnPrev, undefined) {
    'use strict';

    var that = this;

    // Feature Test
    if ( 'querySelector' in document && 'addEventListener' in window && Array.prototype.forEach ) {

      // SELECTORS
      var sliders = document.querySelectorAll('[data-slider]');
      var mySwipe = Array;


      // EVENTS, LISTENERS, AND INITS

      // Activate all sliders
      Array.prototype.forEach.call(sliders, function (slider, index) {

        // METHODS

        // Handle next button
        var handleNextBtn = function (event) {
          event.preventDefault();
          mySwipe[index].nextRight();
        };

        // Handle previous button
        var handlePrevBtn = function (event) {
          event.preventDefault();
          mySwipe[index].nextLeft();
        };

        that.handleSliderPause = function(){
          mySwipe[index].pause();
        };

        that.handleSliderUnpause = function(){
          mySwipe[index].unpause();
        };

        // EVENTS, LISTENERS, AND INITS

        // Activate Slider
        mySwipe[index] = swipeStack(slider, {
          callback: that.swipeStackCallback
        });

        // Toggle Previous & Next Buttons
        if (btnNext) {
          btnNext.addEventListener('click', handleNextBtn, false);
        }
        if (btnPrev) {
          btnPrev.addEventListener('click', handlePrevBtn, false);
        }
      });

      // Add class to HTML element to activate conditional CSS
      window.setTimeout(function(){
        document.documentElement.className += ' js-slider';
      }, 10);
    }
  }
};

module.exports = SwipeStackSliderMixin;