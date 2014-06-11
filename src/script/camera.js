// PhoneGap camera plugin docs: https://github.com/apache/cordova-plugin-camera/blob/master/doc/index.md

// Todo: https://github.com/apache/cordova-plugin-camera/blob/master/doc/index.md#navigatorcameracleanup

var _successCallback = function (successCallback, imageData) {
  successCallback('data:image/jpeg;base64,' + imageData);
};

var _failureCallback = function (failureCallback, msg) {
  // Normalize error messages
  if (msg === 'Camera cancelled.') {
    failureCallback('cancelled');
  } else {
    failureCallback(msg);
  }
};

var camera = {
  getPicture: function (successCallback, failureCallback) {
    console.log('camera.getPicture', !!navigator.camera);

    if (!navigator.camera) {
      alert('Todo: Unsupported.');
      return;
    }

    navigator.camera.getPicture(
      _successCallback.bind(null, successCallback),
      _failureCallback.bind(null, failureCallback),
      {
        quality: 50, // Todo: is this desirable? Should we raise/lower if we detect a fast/slow network connection? Supposedly there can be memory errors on older iOS devices, which can be fixed by lowering this value (see plugin docs).
        destinationType: Camera.DestinationType.DATA_URL // Todo: Docs say "To avoid common memory problems, set Camera.destinationType to FILE_URI rather than DATA_URL.".
      }
    );
  }
};

module.exports = camera;