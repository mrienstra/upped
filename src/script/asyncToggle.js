var toggles = {};

var asyncToggle = {
  getStatusAndCallbacks: function (name, continueCallback, successCallback, failureCallback, beNoisy) {
    var statusAndCallbacks = {};
    var toggle = toggles[name];

    if (!toggle) {
      // Clean slate, good to go
      if (beNoisy) console.log('asyncToggle.getStatusAndCallbacks: Clean slate, good to go');

      toggle = toggles[name] = {
        pending: true,
        toggleBackCallback: void 0
      };

      statusAndCallbacks = {
        successCallback: function(){
          if (toggle && toggle.toggleBackCallback) {
            // There's a toggleBackCallback, call it
            if (beNoisy) console.log('asyncToggle successCallback: There\'s a toggleBackCallback, call it');
            var toggleBackCallback = toggle.toggleBackCallback;
            toggles[name] = void 0;
            toggleBackCallback();
          } else {
            // Success!
            if (beNoisy) console.log('asyncToggle successCallback: success!');
            toggles[name] = void 0;
            successCallback.apply(null, arguments);
          }
        },
        failureCallback: function(){
          if (toggle.toggleBackCallback) {
            // There's a toggleBackCallback, do nothing (no point saying "hey we couldn't do that thing you cancelled")
            if (beNoisy) console.log('asyncToggle failureCallback: There\'s a toggleBackCallback, do nothing (no point saying "hey we couldn\'t do that thing you cancelled")');
            toggles[name] = void 0;
          } else {
            // Call failureCallback
            if (beNoisy) console.log('asyncToggle failureCallback: Call failureCallback');
            toggles[name] = void 0;
            failureCallback.apply(null, arguments);
          }
        },
        continue: true
      };
    } else if (toggle.toggleBackCallback) {
      // 2 pending "toggle backs" make a "Do nothing"
      if (beNoisy) console.log('asyncToggle.getStatusAndCallbacks: 2 pending "toggle backs" make a "Do nothing"');

      toggles[name] = void 0;
      statusAndCallbacks.continue = false;
    } else if (toggle.pending) {
      // There's something pending, we want to "toggle back" when it's done
      if (beNoisy) console.log('asyncToggle.getStatusAndCallbacks: There\'s something pending, we want to "toggle back" when it\'s done');

      toggle.toggleBackCallback = continueCallback;
      statusAndCallbacks.continue = false;
    }

    return statusAndCallbacks;
  }
};

module.exports = asyncToggle;