var remote = require('./remote.js');

var reactDomRoot = document.querySelector('.container');

// Libs
var _ = require('lodash');

var app = {
  init: function () {
    var SideMenu = require('./component/sideMenu.jsx');

    var HeroesScreen = require('./screen/heroes.jsx');

    var ProfileScreen = require('./screen/profile.jsx');

      var ProfileEditScreen = require('./screen/profileEdit.jsx');

    var GatheringsScreen = require('./screen/gatherings.jsx');

      var InviteScreen = require('./screen/invite.jsx');

    var MatchesScreen = require('./screen/activity.jsx');

      var ChatScreen = require('./screen/chat.jsx');

    var BalancesScreen = require('./screen/balances.jsx');

    var App = React.createClass({
      getInitialState: function(){
        return {
          screens: {
            stack: ['heroesScreen'],
            i: 0,
          },
          sideMenuVisible: false,
          heroesScreen: {
            visible: true
          },
          profileScreen: {
            visible: false,
            userData: void 0,
            viewingSelf: void 0,
            fromMenu: void 0,
            matched: void 0
          },
          profileEditScreen: {
            visible: false
          },
          gatheringsScreen: {
            visible: false
          },
          inviteScreen: {
            visible: false,
            gathering: void 0
          },
          matchesScreen: {
            visible: false,
            fromMenu: void 0,
          },
          chatScreen: {
            visible: false,
            otherUserData: void 0
          },
          balancesScreen: {
            visible: false,
            fromMenu: void 0,
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
          });

          _.delay(function(){
            modifiedState[previousScreen].transition = void 0;
            modifiedState[previousScreen].visible = false;
            modifiedState[newScreen].transition = void 0;
            that.setState(modifiedState);
          }, 250); // Important: keep this delay in sync with `.rs-transition` duration
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
            <SideMenu changeScreen={this.changeScreen}/>

            <div className="screens">
              <HeroesScreen pubSubDomain="heroes" remote={remote} getItems={remote.parse.userData.getAll.bind(remote.parse.userData)} handleChoice={handleChoice} handleMatchesChange={this.changeScreen.bind(null, 'matchesScreen', void 0)} showSideMenu={this.showSideMenu} {...this.state.heroesScreen}/>

              <ProfileScreen handleEdit={this.changeScreen.bind(null, 'profileEditScreen')} handleChatChange={this.changeScreen.bind(null, 'chatScreen')} selfUserData={remote.user.userData} showSideMenu={this.showSideMenu} handleBack={this.backToPreviousScreen} {...this.state.profileScreen}/>

                <ProfileEditScreen userData={remote.user.userData} saveUserDataChanges={remote.parse.userData.setCurrent} handleSelectSkillsChange={handleSelectCategoriesChange} handleBack={this.backToPreviousScreen} {...this.state.profileEditScreen}/>

              <GatheringsScreen pubSubDomain="gatherings" remote={remote} getItems={remote.parse.gatherings.getAll} handleChoice={handleRSVP} handleMatchesChange={this.changeScreen.bind(null, 'inviteScreen')} showSideMenu={this.showSideMenu} {...this.state.gatheringsScreen}/>

              <InviteScreen handleBack={this.backToPreviousScreen} {...this.state.inviteScreen}/>

              <MatchesScreen getMatches={remote.parse.choice.getMatchesByUserDataId.bind(remote.parse.choice, remote.user.userData.id)} handleProfileChange={this.changeScreen.bind(null, 'profileScreen')} showSideMenu={this.showSideMenu} handleBack={this.backToPreviousScreen} udid={remote.user.matchesScreen} {...this.state.matchesScreen}/>

                <ChatScreen selfUserData={remote.user.userData} handleBack={this.backToPreviousScreen} {...this.state.chatScreen}/>

              <BalancesScreen getBalances={remote.firebase.balance.getBalancesByUserDataId.bind(remote.firebase.balance, remote.user.userData.id)} allUserData={remote.allUserData} showSideMenu={this.showSideMenu} handleBack={this.backToPreviousScreen} udid={remote.user.userData.id} {...this.state.balancesScreen}/>
            </div>

            <div className="sideMenuBlockerCloser" onTouchEnd={this.hideSideMenu}/>
          </div>
        );
      }
    });

    if (remote.user.parse.get('hasBegun')) {
      React.render(
        <App/>
        ,
        reactDomRoot
      );
    } else {
      handleWelcome2Change();
    }
  }
};


var handleMatchesChange = function (fromMenu) {
  console.log('handleMatchesChange', arguments, remote.user);

  var getMatches = remote.parse.choice.getMatchesByUserDataId.bind(remote.parse.choice, remote.user.userData.id);

  var MatchesScreen = require('./screen/activity.jsx');

  app.screens.addScreen(
    <MatchesScreen getMatches={getMatches} handleProfileChange={handleProfileChange} handleBack={handleBack} udid={remote.user.userData.id} fromMenu={fromMenu} />
  );
};

var handleBack = function (e) {
  console.log('handleBack', this, arguments);

  e.preventDefault();

  app.screens.back();
};

var handleWelcome2Change = function(){
  console.log('handleWelcome2Change', this, arguments);
  var Welcome2Screen = require('./screen/welcome2.jsx');

  app.screens.addScreen(
    <Welcome2Screen handleContinue={continuePastWelcome2Screen}></Welcome2Screen>
  );
};

var handleHeroesChange = function(){
  console.log('handleHeroesChange', this, arguments);
  var HeroesScreen = require('./screen/heroes.jsx');

  var getUsers = remote.parse.userData.getAll.bind(remote.parse.userData);

  var handleMyProfileChange = handleProfileChange.bind(null, remote.user.userData, true);

  app.screens.addScreen(
    <HeroesScreen remote={remote} getItems={getUsers} handleChoice={handleChoice} handleMyProfileChange={handleMyProfileChange} handleMatchesChange={handleMatchesChange} handleGatheringsChange={handleGatheringsChange} handleLogOut={handleLogOut}></HeroesScreen>
  );
};

var handleGatheringsChange = function(){
  console.log('handleGatheringsChange', this, arguments);

  var GatheringsScreen = require('./screen/gatherings.jsx');

  var getGatherings = remote.parse.gatherings.getAll;

  app.screens.addScreen(
    <GatheringsScreen remote={remote} getItems={getGatherings} handleChoice={handleRSVP} handleBack={handleBack} handleMatchesChange={handleInviteChange}></GatheringsScreen>
  );
};

var handleProfileChange = function (userData, fromMenu, matched) {
  console.log('handleProfileChange', arguments, remote.user);

  var viewingSelf = false;

  if (userData.id === remote.user.userData.id) {
    viewingSelf = true;
    userData = remote.user.userData;
  }

  var ProfileScreen = require('./screen/profile.jsx');

  app.screens.addScreen(
    <ProfileScreen userData={userData} viewingSelf={viewingSelf} fromMenu={fromMenu} matched={matched} handleEdit={handleProfileEditChange} handleChatChange={handleChatChange} handleBack={handleBack}></ProfileScreen>
  );
};

var handleProfileEditChange = function(){
  console.log('handleProfileEditChange', arguments);

  var ProfileEditScreen = require('./screen/profileEdit.jsx');

  app.screens.addScreen(
    <ProfileEditScreen userData={remote.user.userData} saveUserDataChanges={remote.parse.userData.setCurrent} handleSelectSkillsChange={handleSelectCategoriesChange} handleBack={handleBack}></ProfileEditScreen>
  );
};

var handleChatChange = function (otherUserData) {
  console.log('handleChatChange', arguments);

  var ChatScreen = require('./screen/chat.jsx');

  app.screens.addScreen(
    <ChatScreen selfUserData={remote.user.userData} otherUserData={otherUserData} handleBack={handleBack}></ChatScreen>
  );
};

var handleSelectCategoriesChange = function (userDataSkills, propogateChanges) {
  console.log('handleSelectCategoriesChange', arguments);

  var SelectCategoriesScreen = require('./screen/selectCategories.jsx');

  app.screens.addScreen(
    <SelectCategoriesScreen skills={userDataSkills} propogateChanges={propogateChanges} handleBack={handleBack}></SelectCategoriesScreen>
  );
};

var handleInviteChange = function (gathering) {
  console.log('handleInviteChange', arguments);

  var InviteScreen = require('./screen/invite.jsx');

  app.screens.addScreen(
    <InviteScreen gathering={gathering} handleBack={handleBack}></InviteScreen>
  );
};



var handleChoice = function (chosenId, choice) {
  console.log('handleChoice', this, arguments, remote.parse.userData);

  return remote.parse.choice.set(chosenId, choice);
};

var handleRSVP = function (chosenId, choice) {
  console.log('handleRSVP', this, arguments, remote.parse.userData);

  return remote.parse.gatherings.rsvp(chosenId, choice);
};



var handleLogOut = function(){
  console.log('handleLogOut');

  remote.logOut();
  delete app.screens; // Todo: does this leak memory?
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

var continuePastWelcome2Screen = function(){
  console.log('continuePastWelcome2Screen');

  remote.user.parse.save({hasBegun: true});

  handleHeroesChange();
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