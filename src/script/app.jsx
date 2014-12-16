var remote = require('./remote.js');

var reactDomRoot = document.querySelector('.container');

var app = {
  init: function () {
    var ReactScreens = require('../lib/react-screens/react-screens.jsx');

    this.screens = new ReactScreens(reactDomRoot);

    if (remote.user.parse.get('hasBegun')) {
      handleHeroesChange();
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