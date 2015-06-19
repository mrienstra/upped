/* == No `touchend` after `touchmove`
 *
 * Prevents propagation of `touchend` above the BODY if `touchmove` was fired after `touchstart`
 *
 * To use with jQuery, attach all events to `document`, see http://api.jquery.com/on/#direct-and-delegated-events
 * Works as-is with React, see http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html#under-the-hood-autobinding-and-event-delegation
 */

var dragging = false;

var body = document.querySelector('body');

var ongoingTouches = {};

body.addEventListener('touchstart', function (e) {
  var i, l, touch;
  for (i = 0, l = e.changedTouches.length; i < l; i++) {
    touch = e.changedTouches[i];
    ongoingTouches[touch.identifier] = {x: touch.pageX, y: touch.pageY};
  };
}, false);

body.addEventListener('touchend', function (e) {
  var i, l, touch, distance;
  for (i = 0, l = e.changedTouches.length; i < l; i++) {
    touch = e.changedTouches[i];
    distance = Math.sqrt(Math.pow(touch.pageX - ongoingTouches[touch.identifier].x, 2) + Math.pow(touch.pageY - ongoingTouches[touch.identifier].y, 2));
    if (distance > 15) {
      console.log('Ignoring drag', distance);
      e.stopPropagation();
    }
    delete ongoingTouches[touch.identifier];
  };
}, false);