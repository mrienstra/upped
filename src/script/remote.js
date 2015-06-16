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
        remote.firebase.auth.init();
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
    dispatchCustomEvent: function (eventName, detail) {
      var customEvent = new CustomEvent(eventName, {'detail': detail});
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

    remote.firebase.auth.logOut();

    remote.resetUser();
  },
  firebase: {
    auth: {
      getRef: function(){
        if (!this.ref) {
          this.ref = new Firebase('https://' + settings.firebase.name + '.firebaseio.com');
        }

        return this.ref;
      },
      onAuth: function (authData) {
        console.log('remote.firebase.auth.onAuth', authData);

        if (remote.firebase.auth.temporarilyIgnoreAuthChanges === true) {
          return;
        }

        if (!authData) {
          var matches = document.location.search.match(/^\?email=(.+)&token=(.+)$/);
          if (matches && matches.length === 3) {
            remote.firebase.auth.temporarilyIgnoreAuthChanges = true;
            var then = function(){
              remote.firebase.auth.temporarilyIgnoreAuthChanges = false;
            };
            remote.firebase.auth.passwordLogin(matches[1], matches[2], function(){
              _remote.utils.dispatchCustomEvent('fbLoginNeeded', {
                'errorMessage': 'Expired password reset token',
              });
              then();
            }, function(){
              remote.firebase.auth.logOut();
              _remote.utils.dispatchCustomEvent('fbLoginNeeded', {
                'initialScreen': 'resetPasswordScreen',
              });
              _.delay(then);
            });
          } else {
            remote.login = remote.firebase.auth.loginWithFB.bind(remote.firebase.auth);
            _remote.utils.dispatchCustomEvent('fbLoginNeeded');
          }
        } else {
          if (_.isEqual(authData, remote.firebase.auth.authData)) {
            return;
          }

          console.log('remote.firebase.auth.init good to go!', authData);
          remote.firebase.auth.postLogin(authData);
        }
      },
      init: function(){
        console.log('remote.firebase.auth.init');

        var ref = this.getRef();

        ref.onAuth(this.onAuth);

        _.delay(function(){
          remote.firebase.auth.onAuth(ref.getAuth());
        }, 5000);
      },
      changePassword: function (email, oldPassword, newPassword, onError, onSuccess) {
        var ref = this.getRef();

        ref.changePassword({
          email       : email,
          oldPassword : oldPassword,
          newPassword : newPassword,
        }, function (error) {
          if (error === null) {
            console.log('Password changed successfully');
            onSuccess && onSuccess(newPassword);
          } else {
            console.warn('Error changing password:', error);
            onError && onError(error.message || error);
          }
        });
      },
      resetPassword: function (newPassword, onError) {
        var matches = document.location.search.match(/^\?email=(.+)&token=(.+)$/);
        var email = matches[1];
        var token = matches[2];

        var onSuccess = function (newPassword) {
          remote.firebase.auth.passwordLogin(email, newPassword, onError);
        };

        this.changePassword(email, token, newPassword, onError, onSuccess);
      },
      postLogin2: function (uid) {
        var ref = remote.firebase.userData.getById(uid);

        ref.on('value', function(snapshot) {
          var val = snapshot.val();

          if (val === null) {
            console.warn('Unknown user!');
          } else {
            console.log('Known user!', val);
            remote.user.userData = val;
            remote.user.userData.id = uid;

            _remote.utils.dispatchCustomEvent('fbAndParseLoginSuccess');
            ga('send', 'event', 'session', 'login', 'fbAndParseLoginSuccess');
          }
        }, function (errorObject) {
          // todo: handle
          console.warn('The read failed', errorObject);
          ga('send', 'event', 'userData', 'get ' + user.uid, 'error: ' + errorObject.code);
        });
      },
      postLogin: function (authData) {
        remote.firebase.auth.authData = authData;

        var that = this;

        var ref = this.getRef();

        ref.child('users/' + authData.uid).on('value', function (snapshot) {
          var user = snapshot.val();
          if (user === null) {
            if (document.location.search.substring(0, 6) === '?udid=') {
              var uid = document.location.search.substring(6);
              ref.child('users/' + authData.uid).set({
                'uid': uid,
              });
              that.postLogin2(uid);
            } else {
              // Unknown user!
              // Todo: get name from FB and use it to guess?

              alert('Hmm, we weren\'t able to figure out who you are...');
            }
          } else {
            that.postLogin2(user.uid);
          }
        }, function (errorObject) {
          // todo: handle
          console.warn('The read failed', errorObject);
          ga('send', 'event', 'users', 'get ' + authData.uid, 'error: ' + errorObject.code);
        });
      },
      loginWithFB: function(){
        var ref = this.getRef();

        ref.authWithOAuthRedirect('facebook', function (error) {
          // Todo: handle
          console.warn('Login Failed!', error);
        });
      },
      loginWithFBAuthResponse: function (authResponse, attemptCount) {
        console.log('remote.firebase.auth.loginWithFBAuthResponse', arguments);

        var that = this;

        var ref = this.getRef();

        ref.authWithOAuthToken('facebook', authResponse.accessToken, function (error, authData) {
          if (error) {
            console.warn('Login Failed!', error);
          } else {
            console.log('Authenticated successfully with payload:', authData);
            that.postLogin(authData);
          }
        });
      },
      passwordLogin: function (email, password, onError, onSuccess) {
        console.log('remote.firebase.auth.passwordLogin', this, arguments);

        var that = this;

        var ref = this.getRef();

        ref.authWithPassword({
          email: email,
          password: password,
        }, function (error, authData) {
          if (error) {
            console.log('Login Failed!', error);
            onError && onError(error.message || error);
          } else {
            console.log('Authenticated successfully with payload:', authData);
            if (onSuccess) {
              onSuccess();
            } else {
              that.postLogin(authData);
            }
          }
        });
      },
      passwordSignup: function (data, onError) {
        console.log('remote.firebase.auth.passwordSignup', this, arguments);

        var that = this;

        var ref = this.getRef();

        ref.createUser({
          email: data.email,
          password: data.password,
        }, function (error, userData) {
          if (error) {
            console.log('Error creating user:', error);
            onError && onError(error.message || error);
          } else {
            console.log('Successfully created user account with uid:', userData.uid);
            that.passwordLogin(data.email, data.password);
          }
        });
      },
      passwordForgot: function (email, onError, onSuccess) {
        var ref = this.getRef();

        console.log('remote.firebase.auth.passwordForgot', this, arguments);

        ref.resetPassword({
          email : email
        }, function (error) {
          if (error === null) {
            console.log("Password reset email sent successfully");
            onSuccess && onSuccess();
          } else {
            console.warn("Error sending password reset email:", error);
            onError && onError(error.message || error);
          }
        });
      },
      logOut: function(){
        var ref = this.getRef();

        ref.unauth();
      },
    },
    balance: {
      getByUID: function (userDataId) {
        console.log('remote.firebase.balance.getByUID', this, arguments);

        var ref = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/balances');

        return ref.orderByChild(userDataId).equalTo(1);
      },
      get: function (balanceID) {
        console.log('remote.firebase.balance.get', this, arguments);

        return new Firebase('https://' + settings.firebase.name + '.firebaseio.com/balances/' + balanceID);
      },
      getHistory: function (historyID) {
        console.log('remote.firebase.balance.getHistory', this, arguments);

        return new Firebase('https://' + settings.firebase.name + '.firebaseio.com/histories/' + historyID);
      },
      deductAndOrAddNote: function (balanceID, note, uid, currentAmount, amount) {
        console.log('remote.firebase.balance.deductAndOrAddNote', this, arguments);

        var balanceRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/balances/' + balanceID);
        var balanceHalfRef = balanceRef.child(uid + '_data');
        var historyRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/histories/' + balanceID);

        var history = {
          uid: remote.user.userData.id,
          timestamp: Firebase.ServerValue.TIMESTAMP,
        };

        if (currentAmount > 0 && amount > 0 && amount <= currentAmount) {
          balanceHalfRef.update({ // todo: consider switching to `transaction` for atomicity
            currentAmount: currentAmount - amount,
          });

          history.action = 'subtracted';
          history.amount = amount;
        }

        if (note) history.note = note;

        balanceRef.update({
          updated: Firebase.ServerValue.TIMESTAMP,
        });

        historyRef.push(history);
      },
      confirmDeduction: function (balanceID, deductionID) {
        var deductionRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/histories/' + balanceID + '/' + deductionID);

        deductionRef.update({
          confirmed: 1,
        });
      },
    },
    userData: {
      getById: function (udid) {
        return new Firebase('https://' + settings.firebase.name + '.firebaseio.com/userData/' + udid);
      },
    },
  },
  resetUser: function(){
    remote.user = {
      location: {},
      fb: {}
    };
  }
};

module.exports = remote;