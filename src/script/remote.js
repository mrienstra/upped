var _ = require('lodash');

var when = require('when');

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
    name: (window.location.hostname === 'app.paywithsushi.com') ? 'paywithsushi' : 'glaring-torch-1823',
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
        remote.firebase.auth.loginWithFB();
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

    remote.firebase.auth.init();
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
        console.log(
          'remote.firebase.auth.onAuth',
          authData,
          remote.firebase.auth.temporarilyIgnoreAuthChanges,
          (authData && _.isEqual(authData, remote.firebase.auth.authData))
        );

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
            }, 'resetPassword A');
          } else {
            remote.login = remote.firebase.auth.loginWithFB.bind(remote.firebase.auth);
            _remote.utils.dispatchCustomEvent('fbLoginNeeded');
          }
        } else {
          if (_.isEqual(authData, remote.firebase.auth.authData)) {
            return;
          }

          console.log('remote.firebase.auth.init good to go!', authData);
          remote.firebase.auth.postLogin(authData, 'existingSession');
        }
      },
      init: function(){
        console.log('remote.firebase.auth.init');

        var ref = this.getRef();

        ref.onAuth(this.onAuth);
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
          remote.firebase.auth.passwordLogin(email, newPassword, onError, void 0, 'resetPassword B');
        };

        this.changePassword(email, token, newPassword, onError, onSuccess);
      },
      postLogin2: function (uid, authFlow) {
        var userDataRef = remote.firebase.userData.getById(uid);

        userDataRef.on('value', function(snapshot) {
          var val = snapshot.val();

          if (val === null) {
            console.warn('Unknown user!');
          } else {
            console.log('Known user!', val);
            remote.user.userData = val;
            remote.user.userData.id = uid;

            if (!val.hasLoggedIn) {
              userDataRef.update({
                hasLoggedIn: 1
              });
            }

            _remote.utils.dispatchCustomEvent('firebaseLoginSuccess');
            ga('send', 'event', 'session', 'firebaseLoginSuccess: ' + authFlow);
          }
        }, function (errorObject) {
          // todo: handle
          console.warn('The read failed', errorObject);
          ga('send', 'event', 'userData', 'get ' + user.uid, 'error: ' + errorObject.code);
        });
      },
      postLogin: function (authData, authFlow) {
        remote.firebase.auth.authData = authData;

        var that = this;

        var ref = this.getRef();

        ref.child('users/' + authData.uid).on('value', function (snapshot) {
          var val = snapshot.val();
          var uid;
          if (val === null) {
            if (document.location.search.substring(0, 3) === '?u=') {
              uid = document.location.search.substring(3);
            } else if (document.location.search.substring(0, 6) === '?udid=') {
              uid = document.location.search.substring(6);
            }
            if (uid) {
              ref.child('users/' + authData.uid).set({
                'uid': uid,
              });
              that.postLogin2(uid, authFlow);
            } else {
              // Unknown user!
              // Todo: get name from FB and use it to guess?

              alert('Hmm, we weren\'t able to figure out who you are...');
            }
          } else {
            that.postLogin2(val.uid, authFlow);
          }
        }, function (errorObject) {
          // todo: handle
          console.warn('The read failed', errorObject);
          ga('send', 'event', 'users', 'get ' + authData.uid, 'error: ' + errorObject.code);
        });
      },
      loginWithFB: function(){
        var that = this;

        var ref = this.getRef();

        ref.authWithOAuthPopup('facebook', function(error, authData) {
          if (error) {
            if (error.code === 'TRANSPORT_UNAVAILABLE') {
              ref.authWithOAuthRedirect('facebook', function (error) {
                // Todo: handle
                console.warn('Login Failed!', error);
              });
            } else {
              console.warn('Login Failed', error);
            }
          } else {
            that.postLogin(authData, 'facebookPopup');
          }
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
            that.postLogin(authData, 'facebookToken');
          }
        });
      },
      passwordLogin: function (email, password, onError, onSuccess, authFlow) {
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
              that.postLogin(authData, authFlow);
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
            that.passwordLogin(data.email, data.password, void 0, void 0, 'passwordSignup');
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
      deductAndOrAddNote: function (balanceID, note, otherUID, currentAmount, amount) {
        console.log('remote.firebase.balance.deductAndOrAddNote', this, arguments);

        var balanceRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/balances/' + balanceID);
        var balanceOtherDataRef = balanceRef.child(otherUID + '_data');
        var balanceOtherUnreadRef = balanceOtherDataRef.child('unread');
        var historyRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/histories/' + balanceID);

        var history = {
          uid: remote.user.userData.id,
          timestamp: Firebase.ServerValue.TIMESTAMP,
        };

        if (currentAmount > 0 && amount > 0 && amount <= currentAmount) {
          balanceOtherDataRef.update({
            currentAmount: currentAmount - amount,
          });

          history.action = 'subtracted';
          history.amount = amount;

          ga('send', 'event', 'deductAndOrAddNote', 'deduct', void 0, amount);
        } else {
          ga('send', 'event', 'deductAndOrAddNote', 'note');
        }

        if (note) history.note = note;

        balanceRef.update({
          updated: Firebase.ServerValue.TIMESTAMP,
        });

        balanceOtherUnreadRef.transaction(function(currentValue) {
          return currentValue + 1;
        });

        historyRef.push(history);
      },
      confirmDeduction: function (balanceID, deductionID) {
        var deductionRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/histories/' + balanceID + '/' + deductionID);

        deductionRef.update({
          confirmed: 1,
        });

        ga('send', 'event', 'confirm', 'confirmDeduction');
      },
      markHistoryItemRead: function (selfUID, balanceID, historyItemID) {
        var historyItemRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/histories/' + balanceID + '/' + historyItemID);

        historyItemRef.update({
          read: 1,
        });

        var balanceSelfUnreadRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/balances/' + balanceID + '/' + selfUID + '_data/unread');

        balanceSelfUnreadRef.transaction(function(currentValue) {
          var newValue = currentValue - 1;
          if (newValue < 0) newValue = 0; // just in case

          return newValue;
        });
      },
    },
    userData: {
      getById: function (udid) {
        return new Firebase('https://' + settings.firebase.name + '.firebaseio.com/userData/' + udid);
      },
      saveChanges: function (changedData) {
        var userDataRef = new Firebase('https://' + settings.firebase.name + '.firebaseio.com/userData/' + remote.user.userData.id);

        userDataRef.update(changedData);
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