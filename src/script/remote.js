var _ = require('lodash');

var when = require('when');

var openFB = require('../lib/openfb-32c04deef7-mod.js');

// Modules
var pubSub = require('./pubSub.js');

var settings = {
  fb: {
    appId: '708399959213691',
    permissions: {
      initial: ['public_profile']
    }
  },
  firebase: {
    name: 'glaring-torch-1823'
  },
  parse: {
    appId: '1xx0YMHyA3nifUNazccdpUm78oOpFXzB3TjM1I7N',
    jsKey: 'WDnOhDjlcrytzGKTVvhconbiG20RmBANvSI0yXq4'
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
    getLoginStatusCallback: function (response) {
      console.log('_remote.fb.getLoginStatusCallback', response);

      if (response.status === 'connected') {
        remote.firebase.auth.loginWithFBAuthResponse(response.authResponse);
      } else {
        remote.login = _remote.fb.login;

        _remote.utils.dispatchCustomEvent('fbLoginNeeded');
      }
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

        remote.firebase.auth.loginWithFBAuthResponse(response.authResponse);
      } else {
        console.log('Game over!'); // Todo?
      }
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
        remote.firebase.auth.loginWithFBAuthResponse(response.authResponse);
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

          remote.parse.choice.getChoicesByUserDataId(remote.user.userData.id).then(
            function (choices) {
              remote.choices = choices;
              _remote.utils.dispatchCustomEvent('getParseChoicesSuccess');
            }
          );

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
                statement: userData.get('statement'),
                gatherings: userData.get('gatherings')
              };
            },
            error: function(){
              // Todo: handle!
              console.error('_user.get(\'data\').fetch', this, arguments);
              alert('Whoops! We have no idea who you are. Here be monsters.');
            }
          });

          _remote.utils.dispatchCustomEvent('fbAndParseLoginSuccess');
          ga('send', 'event', 'session', 'login', 'fbAndParseLoginSuccess');
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
  login: void 0, // Search for "remote.login" to see usage
  logOut: function(){
    console.log('remote.logOut');

    remote.resetUser();
  },
  firebase: {
    auth: {
      loginWithFBAuthResponse: function (authResponse, attemptCount) {
        console.log('remote.firebase.auth.loginWithFBAuthResponse', arguments);

        if (!this.ref) {
          this.ref = new Firebase('https://' + settings.firebase.name + '.firebaseio.com');
        }

        this.ref.authWithOAuthToken('facebook', authResponse.accessToken, function (error, authData) {
          if (error) {
            console.warn('Login Failed!', error);
          } else {
            console.warn('Authenticated successfully with payload:', authData);
            remote.firebase.auth.authData = authData;

            var uid = (authData.uid === 'facebook:10152693261186518') ? 'ypoaKC1xaF' : authData.uid;

            var ref = remote.firebase.userData.getById(uid);

            ref.on('value', function(snapshot) {
              var val = snapshot.val();

              if (val === null) {
                console.warn('Unknown user!');
              } else {
                console.warn('Known user!', val);
                remote.user.userData = val;
                remote.user.userData.id = uid;

                _remote.utils.dispatchCustomEvent('fbAndParseLoginSuccess');
                ga('send', 'event', 'session', 'login', 'fbAndParseLoginSuccess');
              }
            }, function (errorObject) {
              console.log('The read failed: ' + errorObject.code);
            });
          }
        });
      }
    },
    balance: {
      getCreditsByUserDataId: function (userDataId) {
        console.log('remote.firebase.balance.getCreditsByUserDataId', this, arguments);

        var ref = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/balances');

        return ref.orderByChild('receiverID').equalTo(userDataId);
      },
      getDebitsByUserDataId: function (userDataId) {
        console.log('remote.firebase.balance.getDebitsByUserDataId', this, arguments);

        var ref = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/balances');

        return ref.orderByChild('providerID').equalTo(userDataId);
      },
      get: function (balanceID) {
        console.log('remote.firebase.balance.get', this, arguments);

        return new Firebase('https://' + settings.firebase.name + '.firebaseio.com/balances/' + balanceID);
      },
      getHistory: function (historyID) {
        console.log('remote.firebase.balance.getHistory', this, arguments);

        return new Firebase('https://' + settings.firebase.name + '.firebaseio.com/histories/' + historyID);
      },
      deductAndOrAddNote: function (balanceID, balanceCurrentAmount, amount, note) {
        console.log('remote.firebase.balance.deductAndOrAddNote', this, arguments);

        var balanceRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/balances/' + balanceID);

        var historyRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/histories/' + balanceID);

        var newBalanceData = {
          updated: Firebase.ServerValue.TIMESTAMP,
        };

        var history = {
          uid: remote.user.userData.id,
          timestamp: Firebase.ServerValue.TIMESTAMP,
        };

        if (balanceCurrentAmount > 0 && amount > 0) {
          newBalanceData.currentAmount = balanceCurrentAmount - amount;

          history.action = 'subtracted';
          history.amount = amount;
        } else {
          history.action = 'said';
        }

        if (note) history.note = note;

        balanceRef.update(newBalanceData);

        historyRef.push(history);
      },
    },
    userData: {
      getById: function (udid) {
        return new Firebase('https://' + settings.firebase.name + '.firebaseio.com/userData/' + udid);
      },
    },
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

        if (choiceId === 1) {
          remote.choices.chosenOnes.push(chosenId);
          if (remote.parse.choice.isMatch(chosenId)) {
            return _.find(remote.allUserData, {id: chosenId});
          }
        }
      },
      getChoicesByUserDataId: function (userDataId) {
        console.log('remote.parse.choice.getChoicesByUserDataId', this, arguments);

        var deferred = when.defer();

        var userDataPointer = new (Parse.Object.extend('UserData'))({id: userDataId});

        var chooserQuery = new Parse.Query(Parse.Object.extend('Choice'));
        chooserQuery.equalTo('chooser', userDataPointer);

        var chosenQuery = new Parse.Query(Parse.Object.extend('Choice'));
        chosenQuery.equalTo('chosen', userDataPointer);

        var orQuery = Parse.Query.or(chooserQuery, chosenQuery);
        orQuery.find({
          success: function (response) {
            console.log('remote.parse.choice.getChoicesByUserDataId success', this, arguments);

            var choices = {
              chosenOnes: [],
              unchosenOnes: [],
              chosenBy: [],
              unchosenBy: []
            };

            response.forEach(function (aChoice) {
              var chooserId = aChoice.get('chooser').id;
              var chosenId = aChoice.get('chosen').id;
              var choice = aChoice.get('choice');
              if (chooserId === userDataId) {
                if (choice === 1) {
                  choices.chosenOnes.push(chosenId);
                } else if (choice === 0) {
                  choices.unchosenOnes.push(chosenId);
                }
              } else {
                if (choice === 1) {
                  choices.chosenBy.push(chooserId);
                } else if (choice === 0) {
                  choices.unchosenBy.push(chooserId);
                }
              }
            });

            deferred.resolve(choices);
          },
          error: deferred.reject
        });

        return deferred.promise;
      },
      getMatchesByUserDataId: function (userDataId) {
        console.log('remote.parse.choice.getMatchesByUserDataId', this, arguments);

        var deferred = when.defer();

        var userDataPointer = new (Parse.Object.extend('UserData'))({id: userDataId});

        var chooserQuery = new Parse.Query(Parse.Object.extend('Choice'));
        chooserQuery.equalTo('choice', 1);
        chooserQuery.equalTo('chooser', userDataPointer);

        var chosenQuery = new Parse.Query(Parse.Object.extend('Choice'));
        chosenQuery.equalTo('choice', 1);
        chosenQuery.equalTo('chosen', userDataPointer);

        var onSuccess = function (response) {
          console.log('remote.parse.choice.getMatchesByUserDataId success', this, arguments);

          if (!remote.allUserData) {
            when(remote.parse.userData.getAllPromise, onSuccess.bind(null, response));
            return;
          }

          var chosenOnes = [];
          var chosenBy = [];
          response.forEach(function (aChoice) {
            var chooserId = aChoice.get('chooser').id;
            var chosenId = aChoice.get('chosen').id;
            if (chooserId === userDataId) {
              chosenOnes.push(chosenId);
            } else {
              chosenBy.push(chooserId);
            }
          });
          var matches = _.intersection(chosenOnes, chosenBy);
          matches = matches.map(function (match) {
            return _.find(remote.allUserData, {'id': match});
          });

          deferred.resolve(matches);
        };

        var orQuery = Parse.Query.or(chooserQuery, chosenQuery);
        orQuery.find({
          success: onSuccess,
          error: deferred.reject
        });

        return deferred.promise;
      },
      isMatch: function (chosenUdid) {
        return _.contains(remote.choices.chosenBy, chosenUdid);
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
    gatherings: {
      getAll: function(){
        console.log('remote.parse.gatherings.getAll');

        var deferred = when.defer();

        var query = new Parse.Query(Parse.Object.extend('Gathering'));

        query.find({
          success: function (response) {
            console.log('remote.parse.gatherings.getAll success', this, arguments);

            if (response.length) {
              var allGatherings = response.map(function (aGathering) {
                return {
                  id: aGathering.id,
                  location: aGathering.get('location'),
                  photoURL: aGathering.get('photoURL'),
                  blurb: aGathering.get('blurb'),
                  date: aGathering.get('date')
                };
              });
              deferred.resolve(allGatherings);

              remote.allGatherings = allGatherings;
            } else {
              deferred.resolve([]);
            }
          },
          error: deferred.reject
        });

        return deferred.promise;
      },
      rsvp: function (chosenId, choiceId) {
        console.log('remote.parse.gatherings.rsvp', this, arguments);

        var gatherings = remote.user.userData.gatherings || {};
        gatherings[chosenId] = choiceId;

        remote.parse.userData.setCurrent({gatherings: gatherings});
      }
    },
    userData: {
      getAll: function(){
        console.log('remote.parse.userData.getAll', this, arguments, remote.parse.userData.id);

        if (this.getAllPromise && this.getAllPromise.inspect().state === 'pending') {
          return this.getAllPromise;
        }

        var deferred = when.defer();
        this.getAllPromise = deferred.promise;

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

              remote.allUserData = allUserData;
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
      },
      setCurrent: function (modifiedData) {
        var parseUserData = remote.user.parse.get('data');
        parseUserData
          .save(modifiedData)
          .then(
            function(){
              console.log('remote.parse.userData.setCurrent save success', this, arguments);
              ga('send', 'event', 'person', 'userDataEdit', 'successfully submitted to Parse');
            },
            function(){
              console.error('remote.parse.userData.setCurrent save failure', this, arguments);
              ga('send', 'event', 'person', 'userDataEdit', 'unable to submit to Parse');
            }
          );

        _.assign(remote.user.userData, modifiedData);
        pubSub.publish('profileModified.self', {userData: remote.user.userData});
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