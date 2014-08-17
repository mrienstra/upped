var when = require('when');

var openFB = require('../lib/openfb-32c04deef7-mod.js');

var asyncToggle = require('./asyncToggle');

var settings = {
  fb: {
    appId: '637656759644763',
    permissions: {
      initial: ['public_profile'],
      // Asking for publish_* permissions initially using fcp (at least in iOS Simulator) throws an error: "You can only ask for read permissions initially"
      publish: ['publish_actions']
    },
    postFields: 'from.fields(name,picture),message,story,picture,link,application.id,likes,comments.fields(from.name,from.picture,attachment,message,like_count,user_likes)'
  },
  parse: {
    appId: 'wiH0dm2K766KFaLdMBQ3DWFHuQExkXBmmsBh9NYF',
    jsKey: 'npZirjJx5ofr7GQiqrl7lrf6gca6Ag5IUUWhJ3Jr'
  },
  points: {
    posts: 20,
    comments: 15,
    likes: 5
  },
  useOpenFBLogin: true
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

      if (window.facebookConnectPlugin && settings.useOpenFBLogin) {
        openFB.login(
          settings.fb.permissions.publish.join(','),
          _remote.fb.requestPublishPermissionsCallback,
          function(){ console.error('requestPublishPermissions', this, arguments); }
        );
      } else if (window.facebookConnectPlugin) {
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

      if (settings.useOpenFBLogin) {
        openFB.init(settings.fb.appId);
        openFB.login(
          settings.fb.permissions.initial.join(','),
          function (response) {
            openFB.api({
            path: '/me',
            params: {fields: 'id'},
            success: function (response2) {
              console.log('remote.fcp.login openFB.api "/me"', this, arguments);

              response.authResponse.userID = response2.id;

              _remote.fb.loginCallback(response);
            },
            failure: _remote.fcp.loginFailureCallback
          });
          },
          _remote.fcp.loginFailureCallback
        );

        return;
      }

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
        alert('Todo: _remote.fcp.loginFailureCallback (' + (settings.useOpenFBLogin  ? 't' : 'f') + '): ' +  err);

        settings.useOpenFBLogin = !settings.useOpenFBLogin;
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

          var userDataId = (_user.get('data') && _user.get('data').id) || void 0;

          if (!userDataId) {
            if (document.location.search.substring(0, 6) === '?udid=') {
              userDataId = document.location.search.substring(6);
              var udPointer = new (Parse.Object.extend('UserData'))({id: userDataId});
              _user.set({'data': udPointer});
            } else {
              // Unknown user!
              // Todo: get name from FB and use it to guess?

              if (remote.user.ftu) {
                alert('Hmm, we weren\'t able to figure out who you are...');
              } else {
                alert('Hmm, we weren\'t able to figure out who you are... Please contact us so we can help!');
              }

              return;
            }
          }

          remote.user.userData = {
            id: userDataId
          };

          _remote.utils.dispatchCustomEvent('fbAndParseLoginSuccess');
          ga('send', 'event', 'session', 'login', 'fbAndParseLoginSuccess');

          _user.get('data').fetch({
            success: function (userData) {
              _user.save({'data': userData});

              remote.user.userData = {
                id: userData.id,
                age: userData.get('age'),
                distance: userData.get('distance'),
                linkedinURL: userData.get('linkedinURL'),
                location: userData.get('location'),
                name: userData.get('name'),
                nominations: userData.get('nominations'),
                photoURL: userData.get('photoURL'),
                skills: userData.get('skills'),
                statement: userData.get('statement')
              };
            },
            error: function(){
              // Todo: handle!
              console.error('_user.get(\'data\').fetch', this, arguments);
              alert('Whoops! We have no idea who you are. Here be monsters.');
            }
          });

          if (remote.user.ftu) {
            remote.user.choices = [];
          } else {
            remote.parse.choice.getByChooser(remote.user.userData.id).then(
              function (choices) {
                remote.user.choices = choices;
                // todo: trigger custom event for interested parties?
              }
            );
          }
        },
        error: function(){
          console.error('_remote.parse.loginWithFBAuthResponse Parse.FacebookUtils.logIn', this, arguments);

          if (attemptCount < 2) {
            attemptCount++;
            _remote.parse.loginWithFBAuthResponse(authResponse, attemptCount);
            ga('send', 'event', 'session', 'login', 'fbAndParseLogin Error');
          } else {
            window.setTimeout(function(){
              alert('Unable to log you in at this time');
            }, 0);
            ga('send', 'event', 'session', 'login', 'fbAndParseLogin Error 3 times');
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
    choice: {
      set: function (chosenId, choiceId) {
        console.log('remote.parse.choice.set', this, arguments, remote.user.userData.id);

        if (!remote.user.userData.id || !chosenId) return;

        var chooser = new (Parse.Object.extend('UserData'))({id: remote.user.userData.id});

        var chosen = new (Parse.Object.extend('UserData'))({id: chosenId});

        var choice = new (Parse.Object.extend('Choice'))();

        choice.save({
          chooser: chooser,
          chosen: chosen,
          choice: choiceId
        }).then(
          function(){
            console.log('remote.parse.choice.set save success', this, arguments);
            ga('send', 'event', 'person', 'choice ' + choiceId, 'successfully submitted to Parse');
          },
          function(){
            console.error('remote.parse.choice.set save failure', this, arguments);
            ga('send', 'event', 'person', 'choice ' + choiceId, 'unable to submit to Parse');
          }
        );
      },
      getByChooser: function (chooserId) {
        console.log('remote.parse.choice.getByChooser', this, arguments);

        var deferred = when.defer();

        var chooser = new (Parse.Object.extend('UserData'))({id: chooserId});

        var query = new Parse.Query(Parse.Object.extend('Choice'));
        query.equalTo('chooser', chooser);
        query.find({
          success: function (response) {
            console.log('remote.parse.choice.getByChooser success', this, arguments);

            var choices = [];
            response.forEach(function (aChoice) {
              choices.push({
                chosen: aChoice.get('object'),
                parseId: aChoice.id,
                choice: aChoice.get('choice')
              });
            });

            deferred.resolve(choices);
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
      get: function(){
        console.log('remote.parse.activity.get');

        var deferred = when.defer();

        var query = new Parse.Query(Parse.Object.extend('Activity'));
        query.descending('createdAt');
        query.find({
          success: function (response) {
            console.log('remote.parse.activity.get success', this, arguments);

            var responseMapped = response.map(function (activity) {
              return {
                actor: activity.get('actor'),
                fbId: activity.get('fbId'),
                id: activity.id,
                story: activity.get('story'),
                subject: activity.get('subject'),
                time: activity.createdAt,
                type: activity.get('type')
              };
            });

            deferred.resolve(responseMapped);
          },
          error: deferred.reject
        });

        return deferred.promise;
      },
      getCount: function (subject) {
        console.log('remote.parse.activity.getCount');

        var deferred = when.defer();

        var query = new Parse.Query(Parse.Object.extend('Activity'));

        if (subject) {
          query.equalTo('subject', subject);
        }

        query.count({
          success: deferred.resolve,
          error: deferred.reject
        });

        return deferred.promise;
      },
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
            // <Actor Name> likes their own <post or comment>.
            story = data.actor.name + ' likes their own ' + data.postOrComment + '.';
          } else {
            // <Actor Name> likes <Subject Name>'s <post or comment>.
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
    userData: {
      getAll: function(){
        console.log('remote.parse.userData.getAll', this, arguments, remote.parse.userData.id);

        var deferred = when.defer();

        var query = new Parse.Query(Parse.Object.extend('UserData'));
        //query.notEqualTo('id', remote.user.userData.id);
        query.find({
          success: function (response) {
            console.log('remote.parse.userData.getAll success', this, arguments);

            if (response.length) {
              if (remote.user.userData.id) {
                response = response.filter(function (aUserData) {
                  return aUserData.id !== remote.user.userData.id;
                });
              }

              var allUserData = response.map(function (aUserData) {
                return {
                  id: aUserData.id,
                  age: aUserData.get('age'),
                  distance: aUserData.get('distance'),
                  linkedinURL: aUserData.get('linkedinURL'),
                  location: aUserData.get('location'),
                  name: aUserData.get('name'),
                  nominations: aUserData.get('nominations'),
                  photoURL: aUserData.get('photoURL'),
                  skills: aUserData.get('skills'),
                  statement: aUserData.get('statement')
                };
              });
              deferred.resolve(allUserData);
            } else {
              // Nothing returned by Parse, let's assume they aren't using our app
              deferred.resolve([]);
            }
          },
          error: deferred.reject
        });

        return deferred.promise;
      },
      getById: function(id) {
        console.log('remote.parse.userData.getById', this, arguments);

        var deferred = when.defer();

        var user = new Parse.User({id: parseUserId});

        var query = new Parse.Query(Parse.Object.extend('UserData'));
        query.get(id, {
          success: function (response) {
            console.log('remote.parse.userData.getById success', this, arguments);

            if (response.length) {
              var userData = {
                id: response[0].id,
                age: response[0].get('age'),
                distance: response[0].get('distance'),
                linkedinURL: response[0].get('linkedinURL'),
                location: response[0].get('location'),
                name: response[0].get('name'),
                nominations: response[0].get('nominations'),
                photoURL: response[0].get('photoURL'),
                skills: response[0].get('skills'),
                statement: response[0].get('statement')
              };
              deferred.resolve(userData);
            } else {
              // Nothing returned by Parse, let's assume they aren't using our app
              deferred.resolve();
            }
          },
          error: deferred.reject
        });

        return deferred.promise;
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