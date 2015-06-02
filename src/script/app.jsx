var React = require('react');

// Libs
var _ = require('lodash');

var remote = require('./remote.js');

var reactDomRoot = document.querySelector('.container');

var app = {
  init: function () {
    var SideMenu = require('./component/sideMenu.jsx');

    var CreditsScreen = require('./screen/credits.jsx');

      var CreditScreen = require('./screen/credit.jsx');

    var DebitsScreen = require('./screen/debits.jsx');

      var DebitScreen = require('./screen/debit.jsx');

    var ProfileScreen = require('./screen/profile.jsx');

    var App = React.createClass({
      getInitialState: function(){
        return {
          screens: {
            stack: ['creditsScreen'],
            i: 0,
          },
          sideMenuVisible: false,
          creditsScreen: {
            visible: true,
          },
          creditScreen: {
            visible: false,
            balance: void 0,
          },
          debitsScreen: {
            visible: false,
          },
          debitScreen: {
            visible: false,
            balance: void 0,
          },
          profileScreen: {
            visible: false,
            userData: void 0,
            viewingSelf: void 0,
            fromMenu: void 0,
            matched: void 0,
            cssClass: 'profileScreen',
          },
        }
      },
      changeScreen: function (newScreen, options) {
        console.log('App.changeScreen', this, arguments);

        var back = !!(options && options.back);

        var previousScreen = this.state.screens.stack[this.state.screens.i];

        var modifiedState = {};

        var transition = false;

        var that = this;

        if (back) {
          newScreen = this.state.screens.stack[this.state.screens.i - 1];
        } else if (newScreen === 'myProfileScreen') {
          newScreen = 'profileScreen';
          options = {state: {fromMenu: true, matched: false, userData: void 0, viewingSelf: true}};
        }

        if (newScreen === previousScreen) {
          // No need to change screens...
          if (this.state.sideMenuVisible) {
            // ... but hide the sideMenu if it's visible
            modifiedState.sideMenuVisible = false;
            this.setState(modifiedState);
          }

          return;
        }

        modifiedState[previousScreen] = this.state[previousScreen];

        modifiedState[newScreen] = this.state[newScreen];
        modifiedState[newScreen].visible = true;
        if (options && options.state)
          _.merge(modifiedState[newScreen], options.state);

        if (back) {
          // Simple "back"
          modifiedState.screens = {
            stack: this.state.screens.stack,
            i: this.state.screens.i - 1
          };

          modifiedState[previousScreen].transition = {type: 'depart', direction: 'right'};
          modifiedState[newScreen].transition = {type: 'arrive', direction: 'left'};
          transition = true;
        } else if (options && options.state && options.state.fromMenu) {
          // Clear stack
          modifiedState.screens = {
            stack: [newScreen],
            i: 0
          };

          modifiedState[previousScreen].visible = false;
        } else if (this.state.screens.stack.length > this.state.screens.i + 1) {
          // Discard "forward" stack
          modifiedState.screens = {
            stack: this.state.screens.stack.concat().splice(0, this.state.screens.i + 1).concat(newScreen),
            i: this.state.screens.i + 1
          };

          modifiedState[previousScreen].transition = {type: 'depart', direction: 'left'};
          modifiedState[newScreen].transition = {type: 'arrive', direction: 'right'};
          transition = true;
        } else {
          // Simple "forward"
          modifiedState.screens = {
            stack: this.state.screens.stack.concat(newScreen),
            i: this.state.screens.i + 1
          };

          modifiedState[previousScreen].transition = {type: 'depart', direction: 'left'};
          modifiedState[newScreen].transition = {type: 'arrive', direction: 'right'};
          transition = true;
        }

        if (this.state.sideMenuVisible)
          modifiedState.sideMenuVisible = false;

        console.log('App.changeScreen modifiedState:', modifiedState);
        this.setState(modifiedState);

        if (transition) {
          _.defer(function(){
            modifiedState[previousScreen].transition.inProgress = true;
            modifiedState[newScreen].transition.inProgress = true;
            that.setState(modifiedState);

            _.delay(function(){
              modifiedState[previousScreen].transition = void 0;
              modifiedState[previousScreen].visible = false;
              modifiedState[newScreen].transition = void 0;
              that.setState(modifiedState);
            }, 250); // Important: keep this delay in sync with `.rs-transition` duration
          });
        }
      },
      backToPreviousScreen: function(){
        console.log('backToPreviousScreen');
        this.changeScreen(void 0, {back: true});
      },
      showSideMenu: function(){
        this.setState({sideMenuVisible: true});
      },
      hideSideMenu: function (e) {
        e.preventDefault();

        this.setState({sideMenuVisible: false});
      },
      render: function(){
        /*window.t = this;
        window.remote = remote;*/

        console.log('App.render', this, this.state.screens);

        return (
          <div className={this.state.sideMenuVisible ? ' sideMenuVisible' : ''}>
            <SideMenu changeScreen={this.changeScreen} handleLogOut={handleLogOut} />

            <div className="screens">
              <CreditsScreen getBalances={remote.firebase.balance.getAllByUserDataId.bind(remote.firebase.balance, remote.user.userData.id)} showSideMenu={this.showSideMenu} handleBalanceChange={this.changeScreen.bind(null, 'creditScreen')} {...this.state.creditsScreen}/>

                <CreditScreen get={remote.firebase.balance.get} getHistory={remote.firebase.balance.getHistory} deduct={remote.firebase.balance.deduct} handleBack={this.backToPreviousScreen} {...this.state.creditScreen}/>

              <DebitsScreen getBalances={remote.firebase.balance.getAllByUserDataId.bind(remote.firebase.balance, remote.user.userData.id)} showSideMenu={this.showSideMenu} handleBalanceChange={this.changeScreen.bind(null, 'creditScreen')} {...this.state.debitsScreen}/>

                <DebitScreen get={remote.firebase.balance.get} getHistory={remote.firebase.balance.getHistory} deduct={remote.firebase.balance.deduct} handleBack={this.backToPreviousScreen} {...this.state.debitScreen}/>

              <ProfileScreen handleEdit={this.changeScreen.bind(null, 'profileEditScreen')} handleChatChange={this.changeScreen.bind(null, 'chatScreen')} selfUserData={remote.user.userData} showSideMenu={this.showSideMenu} handleBack={this.backToPreviousScreen} {...this.state.profileScreen}/>
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
  }
};



var handleChoice = function (chosenId, choice) {
  console.log('handleChoice', this, arguments, remote.parse.userData);

  return remote.parse.choice.set(chosenId, choice);
};

var handleRSVP = function (chosenId, choice) {
  console.log('handleRSVP', this, arguments, remote.parse.userData);

  return remote.parse.gatherings.rsvp(chosenId, choice);
};



// Todo: seems to be a small memory leak when repeatedly logging out then back in
var handleLogOut = function(){
  console.log('handleLogOut');

  remote.logOut();
  showWelcomeScreen(void 0, true);
};



var continuePastWelcomeScreen = function(){
  console.log('continuePastWelcomeScreen');

  window.removeEventListener('fbLoginNeeded', showWelcomeScreen);
  window.removeEventListener('fbAndParseLoginSuccess', continuePastWelcomeScreen);

  // todo: remove below testing code; make FTU experience more "welcoming"!
  if (remote.user.ftu) console.log ('new user!');
  else console.log ('returning user!')

  app.init();
};

var showFirstScreen = function(){
  console.log('showFirstScreen');

  window.addEventListener('fbLoginNeeded', showWelcomeScreen);
  window.addEventListener('fbAndParseLoginSuccess', continuePastWelcomeScreen);

  remote.init();
}

var showWelcomeScreen = function (e, afterLogOut) {
  console.log('showWelcomeScreen', this, arguments);

  window.removeEventListener('fbLoginNeeded', showWelcomeScreen);

  var WelcomeScreen = require('./screen/welcome.jsx');

  var handleLoginButton = function(){
    // Todo: visual indicator that things are happening

    if (afterLogOut) {
      var doFbLogin = function(){
        console.log('showWelcomeScreen (afterLogOut) doFbLogin');

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

  React.render(
    <WelcomeScreen handleLoginButton={handleLoginButton}></WelcomeScreen>
    ,
    reactDomRoot
  );
}

// Init

// if (window.location.protocol === 'file:') alert('Calling showFirstScreen'); // Helpful when testing on phone (pauses init so you can open console viewer)

showFirstScreen();