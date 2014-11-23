/** @jsx React.DOM */

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

var handleLocationChange = function (props) {
  console.log('handleLocationChange', this, arguments);

  var getPosts = remote.fb.getPosts.bind(remote.fb, props.fbId);

  var handleMyProfileChange = handleProfileChange.bind(null, remote.user.userData, true);

  var PostsScreen = require('./screen/posts.jsx');

  app.screens.addScreen(
    <PostsScreen photoURL={props.photoURL} name={props.name} checkin={props.checkin} distance={props.distance} address1={props.address1} address2={props.address2} promotion={props.promotion} posts={props.posts} fbId={props.fbId} handleBack={handleBack} user={remote.user} handleCheckInOut={handleCheckInOut} handleCreatePostOrComment={handleCreatePostOrComment} handleProfileChange={handleProfileChange} handlePostChange={handlePostChange} getPosts={getPosts} handleLike={handleLike} handleMatchesChange={handleMatchesChange} handleMyProfileChange={handleMyProfileChange} handleLogOut={handleLogOut}></PostsScreen>
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

var handleProfileChange = function (userData, fromMenu) {
  console.log('handleProfileChange', arguments, remote.user);

  var viewingSelf = false;

  if (userData.id === remote.user.userData.id) {
    viewingSelf = true;
    userData = remote.user.userData;
  }

  var ProfileScreen = require('./screen/profile.jsx');

  app.screens.addScreen(
    <ProfileScreen userData={userData} viewingSelf={viewingSelf} fromMenu={fromMenu} handleEdit={handleProfileEditChange} handleBack={handleBack}></ProfileScreen>
  );
};

var handleProfileEditChange = function(){
  console.log('handleProfileEditChange', arguments);

  var ProfileEditScreen = require('./screen/profileEdit.jsx');

  app.screens.addScreen(
    <ProfileEditScreen userData={remote.user.userData} saveUserDataChanges={remote.parse.userData.setCurrent} handleBack={handleBack}></ProfileEditScreen>
  );
};

var handleInviteChange = function (gathering) {
  console.log('handleInviteChange', arguments);

  var InviteScreen = require('./screen/invite.jsx');

  app.screens.addScreen(
    <InviteScreen gathering={gathering} handleBack={handleBack}></InviteScreen>
  );
};

var handlePostChange = function (props) {
  console.log('handlePostChange', this, arguments);

  var getPost = remote.fb.getPost.bind(remote.fb, props.id);

  var post = {
    from: props.from,
    id: props.id,
    likes: props.likes,
    post: props.post,
    time: props.time
  };

  var PostScreen = require('./screen/post.jsx');

  app.screens.addScreen(
    <PostScreen location={props.location} post={post} comments={props.comments} user={remote.user} refreshPosts={props.refresh} getPost={getPost} handleBack={handleBack} handleProfileChange={handleProfileChange} handleLike={handleLike} handleCreatePostOrComment={handleCreatePostOrComment}></PostScreen>
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

var handleCreatePostOrComment = function (isPostsOrComments, msg, pictureDataURI, successCallback, failureCallback) {
  console.log('handleCreatePostOrComment', this, isPostsOrComments, msg, typeof pictureDataURI, successCallback, failureCallback, Date.now());

  var postOrComment = {
    subjectFbId: this.fbId || this.post.id,
    message: msg,
    pictureDataURI: pictureDataURI,
    subjectName: this.name || this.post.from.name
  };

  remote.fb.createPostOrComment(
    isPostsOrComments,
    postOrComment,
    successCallback,
    failureCallback
  );
};

var handleLike = function (id, postOrComment, name, userLikes, successCallback, failureCallback) {
  console.log('handleLike', this, arguments);

  remote.fb.like(
    id,
    postOrComment,
    name,
    userLikes,
    successCallback,
    failureCallback
  );
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

  React.renderComponent(
    <WelcomeScreen handleLoginButton={handleLoginButton}></WelcomeScreen>
    ,
    reactDomRoot
  );
}

// Init

// if (window.location.protocol === 'file:') alert('Calling showFirstScreen'); // Helpful when testing on phone (pauses init so you can open console viewer)

showFirstScreen();