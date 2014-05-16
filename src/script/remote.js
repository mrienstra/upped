var when = require('when');

var settings = {
  fbAppId: '637656759644763',
  parse: {
    appId: 'LoWKxsvTNtpAOKqOiPE6PjfdYomvLqBRskF299s1',
    jsKey: 'mdKlkB65pfc2CGipijGnRQMuQycXKHCS6ij5TetM'
  },
  fbInitialPermissions: [
    'basic_info', 'email', 'user_likes' //, 'publish_actions', 'publish_stream'
    // Asking for 'publish_actions' and/or 'publish_stream' using fcp (at least in iOS Simulator) throws an error: "You can only ask for read permissions initially"
  ]
};

var _remote = {
  fb: {
    init: function(){
      FB.init({
        appId: settings.fbAppId,
        status: true
      });

      FB.getLoginStatus(_remote.fb.getLoginStatusCallback);
    },
    getLoginStatusCallback: function (response) {
      if (response.status === 'connected') {
        _remote.parse.loginWithFBAuthResponse(response.authResponse);
      } else {
        remote.login = _remote.fb.login;

        var event = new CustomEvent('fbLoginNeeded');
        window.dispatchEvent(event);
      }
    },
    login: function(){
      FB.login(
        _remote.fb.loginCallback,
        {scope: settings.fbInitialPermissions.join(',')}
      );
    },
    loginCallback: function (response) {
      console.log('_remote.fb.loginCallback:', response);

      if (response.status === 'connected') {
        _remote.parse.loginWithFBAuthResponse(response.authResponse);
      } else {
        console.log('Game over!'); // Todo?
      }
    }
  },
  fcp: {
    init: function(){
      facebookConnectPlugin.getLoginStatus(_remote.fcp.getLoginStatusCallback);
    },
    getLoginStatusCallback: function (response) {
      if (response.status === 'connected') {
        _remote.parse.loginWithFBAuthResponse(response.authResponse);
      } else {
        remote.login = _remote.fcp.login;

        var event = new CustomEvent('fbLoginNeeded');
        window.dispatchEvent(event);
      }
    },
    login: function(){
      facebookConnectPlugin.login(
        settings.fbInitialPermissions,
        _remote.fb.loginCallback, // Done with `fcp`-specific code, switching to `fb`
        _remote.fcp.loginFailureCallback
        // Todo: neither callback is invoked when "saying no" to FB login in iOS Simulator.
      );
    },
    loginFailureCallback: function (err) {
      console.log('_remote.fcp.loginFailureCallback', this, arguments);
      alert('Todo: _remote.fcp.loginFailureCallback: ' + err);
    }
  },
  parse: {
    loginWithFBAuthResponse: function (authResponse) {
      Parse.initialize(settings.parse.appId, settings.parse.jsKey);

      var myExpDate = new Date();
      myExpDate.setMonth(myExpDate.getMonth() + 2);
      myExpDate = myExpDate.toISOString();

      var facebookAuthData = {
        'id': authResponse.userID,
        'access_token': authResponse.accessToken,
        'expiration_date': myExpDate
      }

      Parse.FacebookUtils.logIn(facebookAuthData, {
        success: function(_user) {
          remote.parse.user = _user;
          remote.parse.user.ftu = _user.existed() ? false : true;

          remote.user = {};
          FB.api('/me', function(response) {
            remote.user.fbId = response.id;
            remote.user.name = response.name;
          });
          FB.api('/me/picture', function(response) {
            remote.user.picture = response.data.url;
          });

          var event = new CustomEvent('fbAndParseLoginSuccess');
          window.dispatchEvent(event);
        },
        error: function(){
          console.error('_remote.parse.loginWithFBAuthResponse Parse.FacebookUtils.logIn', this, arguments);
        }
      });
    }
  }
};



var remote = {
  init: function (successCallback, failureCallback) {
    if (window.cordova) {
      document.addEventListener('deviceready', _remote.fcp.init, false);
    } else {
      if (window.FB) {
        _remote.fb.init();
      } else {
        window.fbAsyncInit = _remote.fb.init;
      }
    }
  },
  fb: {
    getPosts: function(fbId) {
      console.log('remote.getPosts', this, arguments);
      var deferred = when.defer();
      FB.api(
        fbId + '/tagged?fields=from.fields(name,picture),message,story,picture,link,application.id,likes,comments.fields(from.name,from.picture,message,like_count,user_likes)',
        'GET',
        function(response){
          console.log('remote.getPosts response', response);
          if (response && !response.error) {
            var posts = response.data.map(function (post) {
              return {
                id: post.id,
                from: {
                  picture: post.from.picture.data.url,
                  name: post.from.name
                },
                time: post.created_time,
                post: {
                  message: post.message,
                  story: post.story,
                  picture: post.picture,
                  link: post.link
                },
                likes: post.likes && post.likes.data,
                comments: (!post.comments || !post.comments.data.length) ? [] : post.comments.data.map(function (comment) {
                  return {
                    from: {
                      picture: comment.from.picture.data.url,
                      name: comment.from.name,
                    },
                    time: comment.created_time,
                    message: comment.message,
                    likes: comment.like_count,
                    liked: comment.user_likes
                  }
                })
              };
            });

            deferred.resolve(posts);
          } else {
            deferred.reject(response);
          }
        }
      );

      return deferred.promise;
    },
    createPost: function (post, successCallback, failureCallback) {
      FB.api(
        '/' + post.fbId + '/feed',
        'POST',
        {
          'message': post.message
        },
        function (response) {
          if (response && !response.error) {
            successCallback(response);
          } else {
            failureCallback(response);
          }
        }
      );
    }
  },
  login: void 0, // Search for "remote.login" to see usage
  parse: {
    getUser: function(){
      return Parse.User.current();
    },
    user: void 0, // Search for "remote.parse.user" to see usage
    userExists: function(){
      if (typeof(parse.getUser()) != 'null') return true;
      else return false;
    }
  },
  user: void 0 // Search for "remote.user" to see usage
};

module.exports = remote;