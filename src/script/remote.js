var when = require('when');

var remote = {
  init: function (successCallback, failureCallback) {
    var fbLoginSuccessRan;

    var fbLoginSuccess = function (session) {
      if (fbLoginSuccessRan) {
        return; // only run once
      } else {
        fbLoginSuccessRan = true;
      }

      remote.user = {};
      FB.api('/me', function(response) {
        remote.user.name = response.name;
      });
      FB.api('/me/picture', function(response) {
        remote.user.picture = response.data.url;
      });

      var myExpDate = new Date();
      myExpDate.setMonth( myExpDate.getMonth( ) + 2 );
      myExpDate = myExpDate.toISOString();

      var facebookAuthData = {
        'id': session.authResponse.userID,
        'access_token': session.authResponse.accessToken,
        'expiration_date': myExpDate 
      }

      /* Parse.FacebookUtils.init({
        appId      : '637656759644763',
        status     : false, // check login status
        cookie     : true, // enable cookies to allow Parse to access the session
        xfbml      : false  // parse XFBML
      }); */

      Parse.FacebookUtils.logIn(facebookAuthData, {
        success: function(_user) {
          remote.parse.user = _user;
          remote.parse.user.ftu = _user.existed() ? false : true;

          successCallback();
        },
        error: function(error1, error2){
          console.log('Unable to create/login to as Facebook user.\n' +
                      'ERROR1 = ' + JSON.stringify(error1) + '\n' +
                      'ERROR2 = ' + JSON.stringify(error2));
          failureCallback();
        }
      });
    }

    var fbLogin = function(){
      FB.init({appId: '637656759644763'});
      FB.login(
        fbLoginSuccess,
        {scope: 'basic_info,email,user_likes,publish_actions,publish_stream'}
      );
    };

    Parse.initialize('LoWKxsvTNtpAOKqOiPE6PjfdYomvLqBRskF299s1', 'mdKlkB65pfc2CGipijGnRQMuQycXKHCS6ij5TetM');

    if (window.facebookConnectPlugin) {
      facebookConnectPlugin.login(['basic_info'],
        fbLoginSuccess,
        function (error) { alert('' + error) }
      );
    } else {
      if (window.FB) {
        fbLogin();
      } else {
        window.fbAsyncInit = fbLogin;
      }
    }
  },
  fb: {
    init: function(aCallback){
      Parse.FacebookUtils.init({
        appId     : '637656759644763',
        cookie    : true, // enable cookies to allow Parse to access the session
        xfbml     : true  // parse XFBML
      });

      aCallback();

      // TODO: fix this code
      // var handleFirstStatusChange = function(response) {
      //   FB.Event.unsubscribe('auth.statusChange', handleFirstStatusChange);
      //   remote.fb.status = response.status;
      //   remote.fb.authResponse = response.authResponse;
      //   var event = new CustomEvent('fbInitialized');
      //   window.dispatchEvent(event);
      // };
      // 
      // FB.Event.subscribe('auth.statusChange', handleFirstStatusChange);
    },
    // login: function (successCallback, failureCallback) { // note: this function is deprecated and has been replaced by parse.login
    //   FB.login(function(response) {
    //     console.log('FB.login', response);
    //     if (response.authResponse) {
    //       remote.fb.status = response.status;
    //       remote.fb.authResponse = response.authResponse;
    //       successCallback();
    //     } else {
    //       failureCallback();
    //     }
    //   }, {scope: 'basic_info,email,user_likes,publish_actions,publish_stream'}); // todo: we probably only need `publish_stream`
    // },
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
                likes: post.likes && post.likes.data.length,
                comments: (!post.comments || !post.comments.data.length) ? [] : post.comments.data.map(function (comment) {
                  return {
                    from: {
                      picture: post.from.picture.data.url,
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
  parse: {
    getUser: function(){
      return Parse.User.current();
    },
    init: function(aCallback) {
      Parse.initialize('LoWKxsvTNtpAOKqOiPE6PjfdYomvLqBRskF299s1', 'mdKlkB65pfc2CGipijGnRQMuQycXKHCS6ij5TetM');

      if (window.FB) {
        remote.fb.init(aCallback);
      } else {
        window.fbAsyncInit = function(){
          remote.fb.init(aCallback);
        }
      }
    },
    login: function(successCallback, failureCallback) {
      Parse.FacebookUtils.logIn('basic_info,email,user_likes,publish_actions,publish_stream', { // todo: is publish_actions necessary?
        success: function(user) {
          remote.parse.user = user;
          remote.parse.user.ftu = user.existed() ? false : true;
          successCallback();
        },
        error: function(user, error) {
          failureCallback();
        }
      });
    },
    userExists: function(){
      if (typeof(parse.getUser()) != 'null') return true;
      else return false;
    }
  }
};

module.exports = remote;