/* == No `touchend` after `touchmove`
 *
 * Prevents propagation of `touchend` above the BODY if `touchmove` was fired after `touchstart`
 *
 * To use with jQuery, attach all events to `document`, see http://api.jquery.com/on/#direct-and-delegated-events
 * Works as-is with React, see http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html#under-the-hood-autobinding-and-event-delegation
 */

var dragging = false;

var body = document.querySelector('body');

body.addEventListener('touchstart', function(){
  dragging = false;
}, false);

body.addEventListener('touchmove', function(){
  dragging = true;
}, false);

body.addEventListener('touchend', function (e) {
  if (dragging) {
    e.stopPropagation();
  }
}, false);