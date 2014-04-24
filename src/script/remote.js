var remote = {
  fb: {
    login: function (successCallback, failureCallback) {
      FB.login(function(response) {
        console.log('FB.login', response);
        if (response.authResponse) {
          remote.fb.status = response.status;
          remote.fb.authResponse = response.authResponse;
          successCallback();
        } else {
          failureCallback();
        }
      }, {scope: 'basic_info,publish_actions,publish_stream'}); // todo: we probably only need `publish_stream`
    }
  }
};

var initFB = function() {
  FB.init({
    appId: '197721303747805',
    status: true
  });

  var handleFirstStatusChange = function(response) {
    FB.Event.unsubscribe('auth.statusChange', handleFirstStatusChange);
    remote.fb.status = response.status;
    remote.fb.authResponse = response.authResponse;
    var event = new CustomEvent('fbInitialized');
    window.dispatchEvent(event);
  };

  FB.Event.subscribe('auth.statusChange', handleFirstStatusChange);
};

if (window.FB) {
  initFB();
} else {
  // Will be Called automatically by Facebook Javascript SDK
  window.fbAsyncInit = initFB;
}

module.exports = remote;