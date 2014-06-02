var when = require('when');

var openFB = require('../lib/openfb-32c04deef7-mod.js');

var asyncToggle = require('./asyncToggle');

var settings = {
  fb: {
    appId: '637656759644763',
    permissions: {
      initial: ['basic_info', 'email', 'user_likes'],
      // Asking for publish_* permissions initially using fcp (at least in iOS Simulator) throws an error: "You can only ask for read permissions initially"
      publish: ['publish_actions', 'publish_stream'] // todo: both needed?
    },
    postFields: 'from.fields(name,picture),message,story,picture,link,application.id,likes,comments.fields(from.name,from.picture,attachment,message,like_count,user_likes)'
  },
  parse: {
   appId: '5UaFlVS828jdsC9cCTYeXQpP9PXs3XUaeo7cye4q',
   jsKey: 'm7ebrHb7gg3DBlZlUewO9NFrCzNj8EjuXEla9T9p'
 }
};

var _remote = {
  fb: {
    init: function(){
      if (!_remote.fb.initialized) {
        _remote.fb.initialized = true;

        FB.init({
          appId: settings.fb.appId,
          status: true
        });

        FB.getLoginStatus(_remote.fb.getLoginStatusCallback);
      } else {
        FB.getLoginStatus(_remote.fb.getLoginStatusCallback, true);
      }
    },
    initialized: false,
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
          var formattedComment = {
            id: comment.id,
            from: {
              picture: comment.from.picture.data.url,
              name: comment.from.name,
            },
            time: comment.created_time,
            message: comment.message,
            likeCount: comment.like_count,
            userLikes: comment.user_likes
          };
          if (comment.attachment && comment.attachment.type === 'photo') {
            formattedComment.picture = comment.attachment.media.image.src;
          }
          // todo: support other types of attachments?
          return formattedComment;
        })
      };
    },
    getLoginStatusCallback: function (response) {
      if (response.status === 'connected') {
        _remote.parse.loginWithFBAuthResponse(response.authResponse);
      } else {
        remote.login = _remote.fb.login;

        _remote.utils.dispatchCustomEvent('fbLoginNeeded');
      }
    },
    getPostOrPosts: function(fbId, justOne) {
      var deferred = when.defer();

      var fbURL = '/' + fbId;
      if (!justOne) {
        fbURL += '/tagged';
      }

      var fbParams = {fields: settings.fb.postFields};

      openFB.api({
        path: fbURL,
        params: fbParams,
        success: function(response){
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
        },
        error: function (response) {
          deferred.reject(response);
        }
      });

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

      if (response.status === 'connected') {
        if (response.authResponse.grantedScopes) {
          _remote.fb.updatePermissions({grantedScopes: response.authResponse.grantedScopes});
        }

        _remote.parse.loginWithFBAuthResponse(response.authResponse);
      } else {
        console.log('Game over!'); // Todo?
      }
    },
    requestPublishPermissions: function (continueCallback, failureCallback) {
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

      if (window.facebookConnectPlugin) {
        facebookConnectPlugin.login(
          settings.fb.permissions.publish,
          _remote.fb.requestPublishPermissionsCallback,
          function(){ console.error('requestPublishPermissions', this, arguments); }
        );
      } else {
        FB.login(
          _remote.fb.requestPublishPermissionsCallback,
          {
            scope: settings.fb.permissions.publish.join(','),
            return_scopes: true
          }
        );
      }
    },
    requestPublishPermissionsCallback: function (response) {
      console.log('_remote.fb.requestPublishPermissionsCallback:', response);

      var then = function(){
        var eventName = remote.user.fb.publishPermissionsGranted ? 'fbPublishPermissionsGranted' : 'fbPublishPermissionsDenied';
        _remote.utils.dispatchCustomEvent(eventName);
      };

      if (response.authResponse.grantedScopes) {
        _remote.fb.updatePermissions({grantedScopes: response.authResponse.grantedScopes});
      } else {
        _remote.fb.updatePermissions({refresh: true, callback: then});
        return;
      }

      then();
    },
    updatePermissions: function (options) {
      options = options || {};

      if (options.grantedScopes) {
        remote.user.fb.permissions = {};

        options.grantedScopes.split(',').forEach(function (perm) {
          remote.user.fb.permissions[perm] = 1;
        });
      } else if (options.refresh) {
        openFB.api({
          path: '/me',
          params: {fields: 'permissions'},
          success: function (response) {
            console.log('_remote.fb.updatePermissions openFB.api "/me"', this, arguments);

            remote.user.fb.permissions = response.permissions.data[0];

            _remote.fb.updatePermissions();

            options.callback && options.callback();
          },
          failure: function(){
            console.error('_remote.fb.updatePermissions openFB.api "/me"', this, arguments);
          }
        });

        return;
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

      StatusBar.overlaysWebView(false); // Todo: put this somewhere else, doesn't really belong here. org.apache.cordova.statusbar
    },
    getLoginStatusCallback: function (response) {
      if (response.status === 'connected') {
        _remote.parse.loginWithFBAuthResponse(response.authResponse);
      } else {
        remote.login = _remote.fcp.login;

        _remote.utils.dispatchCustomEvent('fbLoginNeeded');
      
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
      console.error('_remote.fcp.loginFailureCallback', this, arguments);
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

      openFB.setFbToken(authResponse.accessToken);

      Parse.FacebookUtils.logIn(facebookAuthData, {
        success: function(_user) {
          remote.user.parse = _user;
          remote.user.ftu = _user.existed() ? false : true;

          var meFields = 'name,first_name,picture,cover';
          if (!remote.user.fb.permissions) {
            meFields += ',permissions';
          }
          openFB.api({
            path: '/me',
            params: {fields: meFields},
            success: function (response) {
              console.log('_remote.parse.loginWithFBAuthResponse openFB.api "/me"', this, arguments);

              remote.user.fb.id = response.id;
              remote.user.name = response.name;
              remote.user.firstName = response.first_name;
              remote.user.picture = response.picture.data.url;
              remote.user.cover = response.cover.source;

              if (response.permissions) {
                remote.user.fb.permissions = response.permissions.data[0];

                _remote.fb.updatePermissions();
              }
            },
            failure: function(){
              console.error('_remote.parse.loginWithFBAuthResponse openFB.api "/me"', this, arguments);
            }
          });
          openFB.api({
            path: '/me/likes',
            params: {fields: 'name,picture'},
            success: function (response) {
              console.log('_remote.parse.loginWithFBAuthResponse openFB.api "/me/likes"', this, arguments);

              remote.user.fb.likes = response.data.map(function (like) {
                return {
                  id: like.id,
                  name: like.name,
                  picture: like.picture.data.url
                };
              });
            },
            failure: function(){
              console.error('_remote.parse.loginWithFBAuthResponse openFB.api "/me/likes"', this, arguments);
            }
          });

          _remote.utils.dispatchCustomEvent('fbAndParseLoginSuccess');
        },
        error: function(){
          console.error('_remote.parse.loginWithFBAuthResponse Parse.FacebookUtils.logIn', this, arguments);
        }
      });
    }
  },
  pending: {},
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
    },
    dispatchCustomEvent: function (eventName) {
      var customEvent = new CustomEvent(eventName);
      window.dispatchEvent(customEvent);
    }
  }
};



var remote = {
  init: function () {
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
    createPostOrComment: function (isPostsOrComments, postOrComment, successCallback, failureCallback) {
      console.log('remote.fb.createPostOrComment', this, arguments);

      if (!remote.user.fb.publishPermissionsGranted) {
        var continueCallback = remote.fb.createPostOrComment.bind(null, isPostsOrComments, postOrComment, successCallback, failureCallback);

        _remote.fb.requestPublishPermissions(continueCallback, failureCallback);

        return;
      }

      if (postOrComment.pictureDataURI) {
        blob = _remote.utils.dataURItoBlob(postOrComment.pictureDataURI);

        var fd = new FormData();
        fd.append('access_token', remote.user.fb.accessToken);
        fd.append('source', blob);
        if (isPostsOrComments === 'posts') {
          fd.append('message', postOrComment.message);
        } else {
          fd.append('published', false); // At some point we may need to change this to: `fd.append('no_story', 1);`
        }

        var reqListener = function(){
          try {
            var responseText = JSON.parse(this.responseText);
          } catch (e) {
            failureCallback.apply(this, [].concat(arguments, e));
            return;
          }

          if (responseText.error) {
            console.error('remote.fb.createPostOrComment reqListener', this, arguments);
            failureCallback.apply(this, arguments);
          } else {
            console.log('remote.fb.createPostOrComment reqListener', this, arguments);

            var deferred = when.defer();
            openFB.api({
              path: '/' + responseText.id,
              success: function (response) {
                console.log('remote.fb.createPostOrComment reqListener [get photo]', this, arguments);
                var pictureUrl = response.images.length > 1 ? response.images[1].source : response.images[0].source;
                deferred.resolve(pictureUrl);
              },
              error: function (response) {
                console.error('remote.fb.createPostOrComment reqListener [get photo]', this, arguments);
                deferred.reject(response.error.message);
              }
            });

            if (isPostsOrComments === 'posts') {
              successCallback(responseText.post_id, deferred.promise);
            } else {
              openFB.api({
                method: 'POST',
                path: '/' + postOrComment.fbId + '/comments',
                params: {
                  'attachment_id': responseText.id,
                  'message': postOrComment.message
                },
                success: function (response) {
                  successCallback(response.id, deferred.promise);
                },
                error: function(){
                  // Sometimes we get "An unexpected error has occurred. Please retry your request later." (code: 2,type: OAuthException)
                  // But (upon reloading) we see that the comment (with image) was submitted successfully.
                  // Todo: Does this happen on phone, or is it only a desktop issue?
                  // Todo: Will it be fixed when we switch to openFB (coming soon)?
                  // Todo: figure out how to prevent this, or figure out how to detect that it was actually successful.
                  failureCallback.apply(this, arguments);
                }
              });
            }
          }
        };

        var photoPostId = isPostsOrComments === 'posts' ? postOrComment.fbId : remote.user.fb.id;

        var request = new XMLHttpRequest();
        request.onload = reqListener;
        request.open('POST', 'https://graph.facebook.com/' + photoPostId + '/photos');
        
        try {
          request.send(fd);
        } catch (e) {
          failureCallback.apply(this, [].concat(arguments, e));
        }
      } else {
        var endpoint = isPostsOrComments === 'posts' ? 'feed' : 'comments';

        openFB.api({
          method: 'POST',
          path: '/' + postOrComment.fbId + '/' + endpoint,
          params: {
            'message': postOrComment.message
          },
          success: function (response) {
            successCallback(response.id);
          },
          failure: function(){
            failureCallback.apply(this, arguments);
          }
        });
      }
    },
    like: function (id, isLike, successCallback, failureCallback) {
      var continueCallback = remote.fb.like.bind(null, id, isLike, successCallback, failureCallback);

      if (!remote.user.fb.publishPermissionsGranted) {
        _remote.fb.requestPublishPermissions(continueCallback, failureCallback);
        return;
      }

      var statusAndCallbacks = asyncToggle.getStatusAndCallbacks('fbCreatePost' + id, continueCallback, successCallback, failureCallback);

      if (!statusAndCallbacks.continue) {
        return;
      }

      openFB.api({
        method: isLike ? 'POST' : 'DELETE',
        path: '/' + id + '/likes',
        success: function (response) {
          statusAndCallbacks.successCallback();
        },
        failure: function(){
          statusAndCallbacks.failureCallback(response);
        }
      });
    }
  },
  login: void 0, // Search for "remote.login" to see usage
  logOut: function(){
    console.log('remote.logOut');

    Parse.User.logOut();
    remote.user = {fb: {}};
  },
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