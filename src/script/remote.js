var when = require('when');

var openFB = require('../lib/openfb-32c04deef7-mod.js');

var asyncToggle = require('./asyncToggle');

var settings = {
  fb: {
    appId: '637656759644763',
    permissions: {
      initial: ['public_profile', 'email', 'user_likes'],
      // Asking for publish_* permissions initially using fcp (at least in iOS Simulator) throws an error: "You can only ask for read permissions initially"
      publish: ['publish_actions']
    },
    postFields: 'from.fields(name,picture),message,story,picture,link,application.id,likes,comments.fields(from.name,from.picture,attachment,message,like_count,user_likes)'
  },
  parse: {
    appId: 'fGL4H9M5JTIZPsJrLKflSPpl0XV6NbJQYaHpgPzN',
    jsKey: 'a5sGHg7mZkdkksgJBkv6BlUxM26HpoQEaEt2FHlt'
  },
  points: {
    posts: 20,
    comments: 10,
    likes: 5
  }
};

var _remote = {
  fb: {
    init: function(){
      console.log('_remote.fb.init');

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
          id: post.from.id,
          name: post.from.name,
          picture: post.from.picture && post.from.picture.data.url
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
              id: comment.from.id,
              name: comment.from.name,
              picture: comment.from.picture && comment.from.picture.data.url
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
      console.log('_remote.fb.getLoginStatusCallback', response);

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
      console.log('_remote.fcp.init');

      facebookConnectPlugin.getLoginStatus(_remote.fcp.getLoginStatusCallback);

      StatusBar.overlaysWebView(false); // Todo: put this somewhere else, doesn't really belong here. org.apache.cordova.statusbar
    },
    getLoginStatusCallback: function (response) {
      console.log('_remote.fcp.getLoginStatusCallback', response);

      if (response.status === 'connected') {
        _remote.parse.loginWithFBAuthResponse(response.authResponse);
      } else {
        remote.login = _remote.fcp.login;

        _remote.utils.dispatchCustomEvent('fbLoginNeeded');
      
      }
    },
    login: function(){
      console.log('remote.fcp.login');
      facebookConnectPlugin.login(
        settings.fb.permissions.initial,
        _remote.fb.loginCallback, // Done with `fcp`-specific code, switching to `fb`
        _remote.fcp.loginFailureCallback
        // Todo: neither callback is invoked when "saying no" to FB login in iOS Simulator.
      );
    },
    loginFailureCallback: function (err) {
      if (err === 'To use your Facebook account with this app, open Settings > Facebook and make sure this app is turned on.') {
        // Todo: this error can also mean that there is a problem with the Settings > Facebook account, sometimes deleting it will fix this issue
        alert(err);
      } else {
        console.error('_remote.fcp.loginFailureCallback', this, arguments);
        alert('Todo: _remote.fcp.loginFailureCallback: ' + err);
      }
    }
  },
  parse: {
    loginWithFBAuthResponse: function (authResponse, attemptCount) {
      attemptCount = attemptCount || 0;
      console.log('_remote.parse.loginWithFBAuthResponse', arguments);

      if (!Parse.applicationId) {
        Parse.initialize(settings.parse.appId, settings.parse.jsKey);
      }

      // Hack, see http://blog.reddeadserver.com/phonegap-facebook-and-parse-android/
      var myExpDate = new Date();
      myExpDate.setMonth(myExpDate.getMonth() + 2);
      myExpDate = myExpDate.toISOString();

      var facebookAuthData = {
        'id': authResponse.userID,
        'access_token': authResponse.accessToken,
        'expiration_date': myExpDate
      }

      remote.user.fb.accessToken = authResponse.accessToken;
      remote.user.fb.id = authResponse.userID;

      openFB.init(settings.fb.appId, {accessToken: authResponse.accessToken});

      console.log('Calling Parse.FacebookUtils.logIn', facebookAuthData);

      Parse.FacebookUtils.logIn(facebookAuthData, {
        success: function(_user) {
          remote.user.parse = _user;
          remote.user.ftu = _user.existed() ? false : true;

          var locationParseId = _user.get('locationParseId');
          if (locationParseId) {
            var locationFbId = _user.get('locationFbId');
            remote.user.location = {
              checkedIn: true,
              fbId: locationFbId,
              parseId: locationParseId
            }
          }

          _remote.utils.dispatchCustomEvent('fbAndParseLoginSuccess');

          var meFields = 'cover,first_name,likes.fields(name,picture),name,picture';
          if (!remote.user.fb.permissions) {
            meFields += ',permissions';
          }
          openFB.api({
            path: '/me',
            params: {fields: meFields},
            success: function (response) {
              console.log('_remote.parse.loginWithFBAuthResponse openFB.api "/me"', this, arguments);

              remote.user.name = response.name;
              remote.user.firstName = response.first_name;
              remote.user.picture = response.picture && response.picture.data.url;
              remote.user.cover = response.cover && response.cover.source;

              remote.user.fb.likes = response.likes && response.likes.data.map(function (like) {
                return {
                  id: like.id,
                  name: like.name,
                  picture: like.picture.data.url
                };
              });

              if (response.permissions) {
                remote.user.fb.permissions = response.permissions.data[0];

                _remote.fb.updatePermissions();
              }
            },
            failure: function(){
              console.error('_remote.parse.loginWithFBAuthResponse openFB.api "/me"', this, arguments);
            }
          });

          remote.user.points = {};
          remote.parse.points.getByFbId(remote.user.fb.id, true).then(
            function (pointsObj) {
              console.log('pointsObj', pointsObj);
              
              if (pointsObj) {
                remote.user.points = {
                  parseId: pointsObj.id,
                  points: pointsObj.get('points')
                };
              } else {
                // New user
                remote.user.points.points = 0;

                var pointsObj = new (Parse.Object.extend('Points'))();
                pointsObj.save({
                  fbId: remote.user.fb.id,
                  points: 0
                }).then(function (pointsObj) {
                  remote.user.points.parseId = pointsObj && pointsObj.id;
                }, function(){
                  console.error('error while saving new Parse points obj', this, arguments); // todo: handle
                });
              }
            }
          );
        },
        error: function(){
          console.error('_remote.parse.loginWithFBAuthResponse Parse.FacebookUtils.logIn', this, arguments);

          if (attemptCount < 2) {
            attemptCount++;
            _remote.parse.loginWithFBAuthResponse(authResponse, attemptCount);
          } else {
            window.setTimeout(function(){
              alert('Unable to log you in at this time');
            }, 0);
            throw '_remote.parse.loginWithFBAuthResponse Parse.FacebookUtils.logIn failed 3 times';
          }
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
    },
    dispatchCustomEvent: function (eventName) {
      var customEvent = new CustomEvent(eventName);
      window.dispatchEvent(customEvent);
    }
  }
};



var remote = {
  init: function () {
    remote.resetUser();

    if (window.cordova) {
      console.log('remote.init: waiting for "deviceready"');
      document.addEventListener('deviceready', _remote.fcp.init, false);
    } else {
      if (window.FB) {
        console.log('remote.init: calling _remote.fb.init');
        _remote.fb.init();
      } else {
        console.log('remote.init: waiting for FB');
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
    getProfile: function (fbId, isPage, deferred) {
      console.log('remote.fb.getProfile', arguments);

      if (!deferred) deferred = when.defer();

      var fbURL = '/' + fbId;

      var fbParams;
      if (isPage) {
        fbParams = {fields: 'cover,likes.fields(name,picture)'};
      } else {
        fbParams = {fields: 'cover,first_name,likes.fields(name,picture)'};
      }

      openFB.api({
        path: fbURL,
        params: fbParams,
        success: function(response){
          console.log('remote.fb.getProfile response', response);
          var output = {
            cover: response.cover && response.cover.source,
            firstName: response.first_name
          }

          if (response.likes && response.likes.data) {
            output.likes = response.likes.data.map(function (like) {
              return {
                id: like.id,
                name: like.name,
                picture: like.picture.data.url
              };
            });
          } else if (response.likes !== void 0) {
            output.likes = response.likes;
          }

          if (isPage) {
            output.isPage = true;
          }

          deferred.resolve(output);
        },
        error: function (response) {
          var message = response.message.toLocaleLowerCase();
          if (!isPage && message.indexOf('first_name') !== -1 && message.indexOf('page') !== -1) {
            // Error message was something like "(#100) Tried accessing unexisting field (first_name) on node type (Page)"
            // We're trying to view a page, not a user
            remote.fb.getProfile(fbId, true, deferred);
          } else {
            console.error('remote.fb.getProfile response', response);
            deferred.reject(response);
          }
        }
      });

      return deferred.promise;
    },
    createPostOrComment: function (isPostsOrComments, postOrComment, successCallback, failureCallback) {
      console.log('remote.fb.createPostOrComment', this, arguments, Date.now());

      if (!remote.user.fb.publishPermissionsGranted) {
        var continueCallback = remote.fb.createPostOrComment.bind(null, isPostsOrComments, postOrComment, successCallback, failureCallback);

        _remote.fb.requestPublishPermissions(continueCallback, failureCallback);

        return;
      }

      var isPostOrComment = isPostsOrComments.substring(0, isPostsOrComments.length - 1);

      var activityLogObj = {
        actor: {
          fbId: remote.user.fb.id,
          name: remote.user.name
        },
        hasPhoto: !!postOrComment.pictureDataURI,
        subject: {
          fbId: postOrComment.subjectFbId,
          name: postOrComment.subjectName
        },
        type: isPostOrComment
      };

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
              remote.parse.points.increaseByFbId(remote.user.fb.id, settings.points[isPostsOrComments]);
              remote.parse.activity.log(responseText.post_id, activityLogObj);
            } else {
              openFB.api({
                method: 'POST',
                path: '/' + postOrComment.subjectFbId + '/comments',
                params: {
                  'attachment_id': responseText.id,
                  'message': postOrComment.message
                },
                success: function (response) {
                  successCallback(response.id, deferred.promise);
                  remote.parse.points.increaseByFbId(remote.user.fb.id, settings.points[isPostsOrComments]);
                  remote.parse.activity.log(response.id, activityLogObj);
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

        var photoPostId = isPostsOrComments === 'posts' ? postOrComment.subjectFbId : remote.user.fb.id;

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
          path: '/' + postOrComment.subjectFbId + '/' + endpoint,
          params: {
            'message': postOrComment.message
          },
          success: function (response) {
            successCallback(response.id);
            remote.parse.points.increaseByFbId(remote.user.fb.id, settings.points[isPostsOrComments]);
            remote.parse.activity.log(response.id, activityLogObj);
          },
          failure: function(){
            failureCallback.apply(this, arguments);
          }
        });
      }
    },
    like: function (id, postOrComment, name, isLike, successCallback, failureCallback) {
      var continueCallback = remote.fb.like.bind(null, id, postOrComment, name, isLike, successCallback, failureCallback);

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
        success: function(){
          statusAndCallbacks.successCallback();
          remote.parse.points.increaseByFbId(remote.user.fb.id, settings.points.likes * (isLike ? 1 : -1));
          console.log('remote.fb.like success', this, arguments);
          if (isLike) {
            remote.parse.activity.log(void 0, {
              actor: {
                fbId: remote.user.fb.id,
                name: remote.user.name
              },
              postOrComment: postOrComment,
              subject: {
                fbId: id,
                name: name
              },
              type: 'like'
            });
          } else {
            // todo: remove "like" from activity log
          }
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

    if (remote.user.location.checkedIn) {
      remote.parse.checkin.checkInOut(remote.user.location.parseId, remote.user.location.fbId, false);
    }

    Parse.User.logOut();
    remote.resetUser();
  },
  parse: {
    checkin: {
      checkInOut: function (parseId, fbId, isIn) {
        console.log('remote.parse.checkin.checkInOut', this, arguments, JSON.stringify(remote.user.location));

        var checkedIn = new (Parse.Object.extend('Checkin'))();

        if (isIn && remote.user.location.checkedIn) {
          // Check out of previous location
          var checkedIn2 = new (Parse.Object.extend('Checkin'))();
          checkedIn2.save({
            checkedIn: {'__op': 'Increment', 'amount': -1},
            'id': remote.user.location.parseId
          });
        }

        checkedIn.set('checkedIn', {'__op': 'Increment', 'amount': isIn ? 1 : -1});

        if (isIn) {
          remote.user.location = {
            checkedIn: true,
            fbId: fbId,
            parseId: parseId
          };

          remote.user.parse.save({
            locationFbId: fbId,
            locationParseId: parseId
          });
        } else {
          remote.user.location = {
            checkedIn: false
          };

          remote.user.parse.save({
            locationFbId: null,
            locationParseId: null
          });
        }

        if (parseId) {
          // Existing
          checkedIn.set('id', parseId);
        } else {
          // New
          // Todo: this is not fully supported
          checkedIn.set({
            fbId: fbId,
            region: '0'
          });
        }

        checkedIn.save();
      },
      getByRegion: function (region) {
        console.log('remote.parse.checkin.getByRegion', this, arguments);

        var deferred = when.defer();

        var query = new Parse.Query(Parse.Object.extend('Checkin'));
        query.equalTo('region', region);
        query.find({
          success: function (response) {
            console.log('remote.parse.checkin.getByRegion success', this, arguments);

            var checkins = [];
            response.forEach(function (aCheckin) {
              checkins.push({
                count: aCheckin.get('checkedIn'),
                parseId: aCheckin.id,
                fbId: aCheckin.get('fbId')
              });
            });

            deferred.resolve(checkins);
          },
          error: deferred.reject
        });

        return deferred.promise;
      }
    },
    getUser: function(){
      return Parse.User.current();
    },
    activity: {
      log: function (fbId, data) {
        console.log('remote.parse.activity.log', data);

        var activityObj = new (Parse.Object.extend('Activity'))();

        var story;
        if (data.type === 'post') {
          if (data.hasPhoto) {
            // <Actor Name> shared a photo on <Subject Name>'s timeline.
            story = data.actor.name + ' shared a photo on ' + data.subject.name + '\'s timeline.';
          } else {
            // <Actor Name> wrote on <Subject Name>'s timeline.
            story = data.actor.name + ' wrote on ' + data.subject.name + '\'s timeline.';
          }
        } else if (data.type === 'comment') {
          if (data.actor.name === data.subject.name) {
            // <Actor Name> commented on their own post.
            story = data.actor.name + ' commented on their own post.';
          } else {
            // <Actor Name> commented on a post.
            story = data.actor.name + ' commented on a post.';
          }
        } else if (data.type === 'like') {
          var postOrComment = data.subject.fbId.indexOf('_') === -1 ? 'post' : 'comment';

          if (data.actor.name === data.subject.name) {
            // <Actor Name> likes their own <post or comment>. // Todo!
            story = data.actor.name + ' likes their own ' + data.postOrComment + '.';
          } else {
            // <Actor Name> likes <Subject Name>'s <post or comment>. // Todo!
            story = data.actor.name + ' likes ' + data.subject.name + '\'s ' + data.postOrComment + '.';
          }
        }

        activityObj.save({
          fbId: fbId + '',
          actor: {
            fbId: data.actor.fbId,
            name: data.actor.name,
            //offset: ,
            //length: 
          },
          subject: {
            fbId: data.subject.fbId,
            name: data.subject.name,
            //offset: ,
            //length: 
          },
          story: story,
          type: data.type,
        }).then(
          function(){ console.log('remote.parse.activity.log save success', this, arguments); },
          function(){ console.log('remote.parse.activity.log save failure', this, arguments); }
        );
      }
    },
    points: {
      getByFbId: function(fbId, returnAnObject) {
        console.log('remote.parse.points.getByFbId', this, arguments);

        var deferred = when.defer();

        var query = new Parse.Query(Parse.Object.extend('Points'));
        query.equalTo('fbId', fbId);
        query.find({
          success: function (response) {
            console.log('remote.parse.points.getByFbId success', this, arguments);

            if (response.length) {
              deferred.resolve(returnAnObject ? response[0] : response[0].get('points'));
            } else {
              // Nothing returned by Parse, let's assume they aren't using our app
              deferred.resolve();
            }
          },
          error: deferred.reject
        });

        return deferred.promise;
      },
      increaseByFbId: function(fbId, pointsIncrease) {
        // Todo: consider moving this to Parse "Cloud Code"
        // Todo: add error handling
        console.log('remote.parse.points.increaseByFbId', arguments);

        if (fbId === remote.user.fb.id) {
          remote.user.points.points += pointsIncrease;

          var pointsObj = new (Parse.Object.extend('Points'))();
          pointsObj.save({
            id: remote.user.points.parseId,
            points: {'__op': 'Increment', 'amount': pointsIncrease}
          }, {error: function(){ console.error('remote.parse.points.increaseByFbId save (self) error', this, arguments); }});
        } else {
          remote.parse.points.getByFbId(fbId, true).then(
            function (pointsObj) {
              if (pointsObj) {
                pointsObj.save({
                  points: {'__op': 'Increment', 'amount': pointsIncrease}
                }, {error: function(){ console.error('remote.parse.points.increaseByFbId save (other) error', this, arguments); }});
              }
            },
            function(){ console.error('remote.parse.points.increaseByFbId getByFbId error', this, arguments); }
          );
        }
      }
    },
    userExists: function(){
      if (typeof(parse.getUser()) != 'null') return true;
      else return false;
    }
  },
  resetUser: function(){
    remote.user = {
      location: {},
      fb: {}
    };
  }
};

module.exports = remote;