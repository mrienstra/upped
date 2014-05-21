var when = require('when');

var settings = {
  fb: {
    appId: '637656759644763',
    permissions: {
      initial: ['basic_info', 'email', 'user_likes'],
      // Asking for publish_* permissions initially using fcp (at least in iOS Simulator) throws an error: "You can only ask for read permissions initially"
      publish: ['publish_actions', 'publish_stream'] // todo: both needed?
    },
    postFields: 'from.fields(name,picture),message,story,picture,link,application.id,likes,comments.fields(from.name,from.picture,message,like_count,user_likes)'
  },
  parse: {
    appId: 'LoWKxsvTNtpAOKqOiPE6PjfdYomvLqBRskF299s1',
    jsKey: 'mdKlkB65pfc2CGipijGnRQMuQycXKHCS6ij5TetM'
  }
};

var _remote = {
  fb: {
    init: function(){
      FB.init({
        appId: settings.fb.appId,
        status: true
      });

      FB.getLoginStatus(_remote.fb.getLoginStatusCallback);
    },
    formatPost: function (post) {
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
    },
    getLoginStatusCallback: function (response) {
      if (response.authResponse) {
        _remote.parse.loginWithFBAuthResponse(response.authResponse);
      } else {
        remote.login = _remote.fb.login;

        var customEvent = new CustomEvent('fbLoginNeeded');
        window.dispatchEvent(customEvent);
      }
    },
    getPostOrPosts: function(fbId, justOne) {
      var deferred = when.defer();

      var fbURL;
      if (justOne) {
        fbURL = fbId + '?fields=' + settings.fb.postFields
      } else {
        fbURL = fbId + '/tagged?fields=' + settings.fb.postFields
      }

      FB.api(
        fbURL,
        'GET',
        function(response){
          console.log('_remote.fb.getPostOrPosts response', response);
          if (response && !response.error) {
            var output;

            if (justOne) {
              output = _remote.fb.formatPost(response);
            } else {
              output = response.data.map(function (post) {
                return _remote.fb.formatPost(post);
              });
            }

            deferred.resolve(output);
          } else {
            deferred.reject(response);
          }
        }
      );

      return deferred.promise;
    },
    login: function(){
      FB.login(
        _remote.fb.loginCallback,
        {
          scope: settings.fb.permissions.initial.join(','),
          return_scopes: true
        }
      );
    },
    loginCallback: function (response) {
      console.log('_remote.fb.loginCallback:', response);

      if (response.authResponse) {
        _remote.fb.updatePermissions(response.authResponse.grantedScopes);

        _remote.parse.loginWithFBAuthResponse(response.authResponse);
      } else {
        console.log('Game over!'); // Todo?
      }
    },
    requestPublishPermissions: function (continueCallback, failureCallback) {
      // Todo: implement `fcp` counterpart

      var stopListening = function(){
        window.removeEventListener('fbPublishPermissionsGranted', fbPublishPermissionsGranted);
        window.removeEventListener('fbPublishPermissionsDenied', fbPublishPermissionsDenied);
      };

      var fbPublishPermissionsGranted = function(){
        stopListening();

        continueCallback();
      };

      var fbPublishPermissionsDenied = function(){
        stopListening();

        failureCallback('Publish permissions denied');
      };

      window.addEventListener('fbPublishPermissionsGranted', fbPublishPermissionsGranted);
      window.addEventListener('fbPublishPermissionsDenied', fbPublishPermissionsDenied);

      FB.login(
        _remote.fb.requestPublishPermissionsCallback,
        {
          scope: settings.fb.permissions.publish.join(','),
          return_scopes: true
        }
      );
    },
    requestPublishPermissionsCallback: function (response) {
      console.log('_remote.fb.requestPublishPermissionsCallback:', response);

      _remote.fb.updatePermissions(response.authResponse.grantedScopes);

      var eventName = remote.user.fb.publishPermissionsGranted ? 'fbPublishPermissionsGranted' : 'fbPublishPermissionsDenied';
      var customEvent = new CustomEvent(eventName);
      window.dispatchEvent(customEvent);
    },
    updatePermissions: function (grantedScopes) {
      if (grantedScopes) {
        remote.user.fb.permissions = {};

        grantedScopes.split(',').forEach(function (perm) {
          remote.user.fb.permissions[perm] = 1;
        });
      }

      remote.user.fb.initialPermissionsGranted = settings.fb.permissions.initial.every(function (perm) {
        return remote.user.fb.permissions[perm];
      });

      remote.user.fb.publishPermissionsGranted = settings.fb.permissions.publish.every(function (perm) {
        return remote.user.fb.permissions[perm];
      });

      console.log('_remote.fb.updatePermissions', remote.user.fb);
    }
  },
  fcp: {
    init: function(){
      facebookConnectPlugin.getLoginStatus(_remote.fcp.getLoginStatusCallback);
    },
    getLoginStatusCallback: function (response) {
      if (response.authResponse) {
        _remote.parse.loginWithFBAuthResponse(response.authResponse);
      } else {
        remote.login = _remote.fcp.login;

        var customEvent = new CustomEvent('fbLoginNeeded');
        window.dispatchEvent(customEvent);
      }
    },
    login: function(){
      facebookConnectPlugin.login(
        settings.fb.permissions.initial,
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

      remote.user.fb.accessToken = authResponse.accessToken;

      Parse.FacebookUtils.logIn(facebookAuthData, {
        success: function(_user) {
          remote.user.parse = _user;
          remote.user.ftu = _user.existed() ? false : true;

          var meFields = 'name,first_name,picture,cover';
          if (!remote.user.fb.permissions) {
            meFields += ',permissions';
          }
          FB.api('/me?fields=' + meFields, function (response) {
            remote.user.fb.id = response.id;
            remote.user.name = response.name;
            remote.user.firstName = response.first_name;
            remote.user.picture = response.picture.data.url;
            remote.user.cover = response.cover.source;

            if (response.permissions) {
              remote.user.fb.permissions = response.permissions.data[0];

              _remote.fb.updatePermissions();
            }
          });
          FB.api('/me/likes?fields=name,picture', function (response) {
            remote.user.fb.likes = response.data.map(function (like) {
              return {
                id: like.id,
                name: like.name,
                picture: like.picture.data.url
              };
            });
          });

          var customEvent = new CustomEvent('fbAndParseLoginSuccess');
          window.dispatchEvent(customEvent);
        },
        error: function(){
          console.error('_remote.parse.loginWithFBAuthResponse Parse.FacebookUtils.logIn', this, arguments);
        }
      });
    }
  },
  utils: {
    dataURItoBlob: function (dataURI) {
      var mime = dataURI.split(';')[0].split(':')[1];
      var byteString = atob(dataURI.split(',')[1]);
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], {
        type: mime
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
    getPost: function(fbId) {
      console.log('remote.fb.getPost', this, arguments);
      return _remote.fb.getPostOrPosts(fbId, true);
    },
    getPosts: function(fbId) {
      console.log('remote.fb.getPosts', this, arguments);
      return _remote.fb.getPostOrPosts(fbId, false);
    },
    createPost: function (post, successCallback, failureCallback) {
      if (!remote.user.fb.publishPermissionsGranted) {
        var continueCallback = remote.fb.createPost.bind(null, post, successCallback, failureCallback);

        _remote.fb.requestPublishPermissions(continueCallback, failureCallback);

        return;
      }

      if (post.pictureDataURI) {
        blob = _remote.utils.dataURItoBlob(post.pictureDataURI);

        var fd = new FormData();
        fd.append('access_token', remote.user.fb.accessToken);
        fd.append('source', blob);
        fd.append('message', post.message);

        var reqListener = function(){
          try {
            var responseText = JSON.parse(this.responseText);
          } catch (e) {
            failureCallback.call(this, arguments, e);
            return;
          }

          if (responseText.error) {
            console.error('remote.fb.createPost reqListener', this.responseText);
            failureCallback.call(this, arguments);
          } else {
            console.log('remote.fb.createPost reqListener', this.responseText);
            successCallback.call(this, arguments);
          }
        };

        var request = new XMLHttpRequest();
        request.onload = reqListener;
        request.open('POST', 'https://graph.facebook.com/' + post.fbId + '/photos');
        
        try {
          request.send(fd);
        } catch (e) {
          failureCallback.call(this, arguments, e);
        }
      } else {
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
    like: function (id, unlike, successCallback, failureCallback) {
      if (!remote.user.fb.publishPermissionsGranted) {
        var continueCallback = remote.fb.like.bind(null, id, successCallback, failureCallback);

        _remote.fb.requestPublishPermissions(continueCallback, failureCallback);

        return;
      }

      var method = unlike ? 'DELETE' : 'POST';

      FB.api(
        '/' + id + '/likes',
        method,
        function (response) {
          if (response === true) {
            successCallback();
          } else {
            failureCallback(response && response.error && response.error.message);
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
    userExists: function(){
      if (typeof(parse.getUser()) != 'null') return true;
      else return false;
    }
  },
  user: {
    fb: {}
  }
};

module.exports = remote;