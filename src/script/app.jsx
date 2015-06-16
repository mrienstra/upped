var React = require('react');

// Libs
var _ = require('lodash');

// Mixins
var ScreensMixin = require('./mixin/screens.js');

var remote = require('./remote.js');

var reactDomRoot = document.querySelector('.container');

var appInit = function () {
  var SideMenu = require('./component/sideMenu.jsx');

  var WalletScreen = require('./screen/wallet.jsx');

    var WalletDetailScreen = require('./screen/walletDetail.jsx');

      var RedeemScreen = require('./screen/redeem.jsx');

      var FulfillScreen = require('./screen/fulfill.jsx');

  var ProfileScreen = require('./screen/profile.jsx');

  var FeedbackScreen = require('./screen/feedback.jsx');

  var App = React.createClass({
    mixins: [ScreensMixin],
    getInitialState: function(){
      return {
        screens: {
          stack: ['walletScreen'],
          i: 0,
        },
        sideMenuVisible: false,
        walletScreen: {
          visible: true,
        },
        walletDetailScreen: {
          visible: false,
          balance: void 0,
          balanceID: void 0,
        },
        redeemScreen: {
          visible: false,
          balance: void 0,
        },
        fulfillScreen: {
          visible: false,
          balance: void 0,
          balanceID: void 0,
        },
        profileScreen: {
          visible: false,
          uid: void 0,
          viewingSelf: void 0,
          fromMenu: void 0,
          matched: void 0,
          cssClass: 'profileScreen',
        },
        feedbackScreen: {
          visible: false,
        },
      }
    },
    render: function(){
      /*window.t = this;
      window.remote = remote;*/

      console.log('App.render', this, this.state.screens);

      return (
        <div className={this.state.sideMenuVisible ? ' sideMenuVisible' : ''}>
          <SideMenu changeScreen={this.changeScreen} handleLogOut={handleLogOut} />

          <div className="screens">
            <WalletScreen getBalances={remote.firebase.balance.getByUID.bind(remote.firebase.balance, remote.user.userData.id)} selfUID={remote.user.userData.id} showSideMenu={this.showSideMenu} changeScreen={this.changeScreen} {...this.state.walletScreen}/>

              <WalletDetailScreen selfUID={remote.user.userData.id} get={remote.firebase.balance.get} getHistory={remote.firebase.balance.getHistory} addNote={remote.firebase.balance.deductAndOrAddNote} confirmDeduction={remote.firebase.balance.confirmDeduction} changeScreen={this.changeScreen} handleBack={this.backToPreviousScreen} {...this.state.walletDetailScreen}/>

                <RedeemScreen selfUID={remote.user.userData.id} handleBack={this.backToPreviousScreen} handleProfileChange={this.changeScreen.bind(null, 'profileScreen')} {...this.state.redeemScreen}/>

                <FulfillScreen selfUID={remote.user.userData.id} get={remote.firebase.balance.get} doDeduct={remote.firebase.balance.deductAndOrAddNote} handleBack={this.backToPreviousScreen} {...this.state.fulfillScreen}/>

            <ProfileScreen selfUserData={remote.user.userData} get={remote.firebase.userData.getById} showSideMenu={this.showSideMenu} handleBack={this.backToPreviousScreen} {...this.state.profileScreen}/>

            <FeedbackScreen showSideMenu={this.showSideMenu} {...this.state.feedbackScreen}/>
          </div>

          <div className="sideMenuBlockerCloser" onTouchEnd={this.hideSideMenu}/>
        </div>
      );
    }
  });

  React.render(
    <App/>
    ,
    reactDomRoot
  );
};

var authInit = function (e, afterLogOut) {
  window.removeEventListener('fbLoginNeeded', authInit);

  var WelcomeScreen = require('./screen/welcome.jsx');

  var EmailSignupScreen = require('./screen/emailSignup.jsx');

  var EmailLoginScreen = require('./screen/emailLogin.jsx');

  var EmailForgotScreen = require('./screen/emailForgot.jsx');

  var ResetPasswordScreen = require('./screen/resetPassword.jsx');

  var App = React.createClass({
    mixins: [ScreensMixin],
    getInitialState: function(){
      var initialScreen;
      if (e && e.detail && e.detail.initialScreen) {
        initialScreen = e.detail.initialScreen;
      } else {
        initialScreen = 'welcomeScreen';
      }

      return {
        screens: {
          stack: [initialScreen],
          i: 0,
        },
        welcomeScreen: {
          visible: (initialScreen === 'welcomeScreen') ? true : false,
          errorMessage: (e && e.detail && e.detail.errorMessage) ? e.detail.errorMessage : void 0
        },
        emailSignupScreen: {
          visible: false,
        },
        emailLoginScreen: {
          visible: false,
        },
        emailForgotScreen: {
          visible: false,
        },
        resetPasswordScreen: {
          visible: (initialScreen === 'resetPasswordScreen') ? true : false,
        },
      }
    },
    render: function(){
      /*window.t = this;
      window.remote = remote;*/

      console.log('App.render', this, this.state.screens);

      var doEmailLogin = function (data, onError) {
        console.log('doEmailLogin', this, arguments);

        window.addEventListener('fbAndParseLoginSuccess', continuePastWelcomeScreen);

        remote.firebase.auth.passwordLogin(data.email, data.password, onError);
      };

      var doEmailForgot = function (email, onError, onSuccess) {
        console.log('doEmailForgot', this, arguments);

        remote.firebase.auth.passwordForgot(email, onError, onSuccess);
      };

      var handleEmailSignupButton = function (data, onError) {
        console.log('handleEmailSignupButton', this, arguments);

        window.addEventListener('fbAndParseLoginSuccess', continuePastWelcomeScreen);

        remote.firebase.auth.passwordSignup(data, onError);
      };

      var handleFBLoginButton = function(){
        // Todo: visual indicator that things are happening

        if (afterLogOut) {
          var doFbLogin = function(){
            console.log('authInit (afterLogOut) doFbLogin');

            window.removeEventListener('fbLoginNeeded', doFbLogin);
            remote.login();
          };
          window.addEventListener('fbLoginNeeded', doFbLogin);
          window.addEventListener('fbAndParseLoginSuccess', continuePastWelcomeScreen);

          remote.init();
        } else {
          remote.login();
        }
      };

      return (
        <div>
          <div className="screens">
            <WelcomeScreen handleEmailSignupChange={this.changeScreen.bind(null, 'emailSignupScreen')} handleEmailLoginChange={this.changeScreen.bind(null, 'emailLoginScreen')} handleFBLoginButton={handleFBLoginButton} {...this.state.welcomeScreen}/>

              <EmailSignupScreen handleEmailSignupButton={handleEmailSignupButton} handleEmailLoginChange={this.changeScreen.bind(null, 'emailLoginScreen')} handleBack={this.backToPreviousScreen} {...this.state.emailSignupScreen}/>

              <EmailLoginScreen handleEmailForgotChange={this.changeScreen.bind(null, 'emailForgotScreen')} doEmailLogin={doEmailLogin} handleFBLoginButton={handleFBLoginButton} handleEmailSignupChange={this.changeScreen.bind(null, 'emailSignupScreen')} handleBack={this.backToPreviousScreen} {...this.state.emailLoginScreen}/>

              <EmailForgotScreen doEmailForgot={doEmailForgot} handleEmailSignupChange={this.changeScreen.bind(null, 'emailSignupScreen')} handleBack={this.backToPreviousScreen} {...this.state.emailForgotScreen}/>

              <ResetPasswordScreen doResetPassword={remote.firebase.auth.resetPassword.bind(remote.firebase.auth)} {...this.state.resetPasswordScreen}/>
          </div>
        </div>
      );
    }
  });

  React.render(
    <App/>
    ,
    reactDomRoot
  );
};

// Todo: seems to be a small memory leak when repeatedly logging out then back in
var handleLogOut = function(){
  console.log('handleLogOut');

  remote.logOut();
  authInit(void 0, true);
};



var continuePastWelcomeScreen = function(){
  console.log('continuePastWelcomeScreen');

  window.removeEventListener('fbLoginNeeded', authInit);
  window.removeEventListener('fbAndParseLoginSuccess', continuePastWelcomeScreen);

  // todo: remove below testing code; make FTU experience more "welcoming"!
  if (remote.user.ftu) console.log ('new user!');
  else console.log ('returning user!')

  appInit();
};

var showFirstScreen = function(){
  console.log('showFirstScreen');

  window.addEventListener('fbLoginNeeded', authInit);
  window.addEventListener('fbAndParseLoginSuccess', continuePastWelcomeScreen);

  remote.init();
}

// Init

// if (window.location.protocol === 'file:') alert('Calling showFirstScreen'); // Helpful when testing on phone (pauses init so you can open console viewer)

showFirstScreen();