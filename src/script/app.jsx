/** @jsx React.DOM */

var remote = require('./remote.js');

var reactDomRoot = document.querySelector('.container');

var puller = require('./puller.js');

var stub = {
  locations: {
    locations: [
      {
        photoURL: './img/profiles/kate_li.jpg',
        name: 'Kate Svodoba',
        statement: 'Interior designer bridging beauty & function',
        linkedinURL: 'https://www.linkedin.com/pub/kate-svoboda-spanbock/17/525/8a8',
        age: 35,
        distance: '5 mi',
        location: 'Los Angeles, CA',
        skills: [
          'Interior design',
          'Space planning',
          'Architecture',
          'Rendering',
          'Space-planning'
        ],
        secondarySkills: [
          'Copy writing',
          'Blog writing',
          'Creative writing'
        ],
        nominations: [{
          name: 'Jared Krause',
          skill: 'Interior design',
          text: 'Kate is the best interior designer I\'ve ever worked with. She quickly stepped into our home and saw the possibilities of how we could make our space beautiful while holding to a moderate budget. We had a dinner party and the guests almost fainted with delight. She\'s the real deal!'
        }]
      },
      {
        photoURL: './img/profiles/jordana_li.jpg',
        name: 'Jordana Reim',
        statement: 'Digital Strategy for the analog age',
        linkedinURL: 'https://www.linkedin.com/in/jordana',
        age: 30,
        distance: '5 mi',
        location: 'Los Angeles, CA',
        skills: [
          'Digital Strategy',
          'Online Advertising',
          'Advertising',
          'Social Media Marketing',
          'User Experience'
        ],
        secondarySkills: [
          'Grass Roots Campaigns'
        ],
        nominations: [{
          name: 'Morgan Carson',
          skill: 'Digital Strategy',
          text: 'She\'s the tops!'
        }]
      },
      {
        photoURL: './img/profiles/tian_li.jpg',
        name: 'Tian Mu',
        statement: 'Social Activism as a form of game development',
        linkedinURL: 'http://www.linkedin.com/pub/tian-mu/0/4a2/77',
        age: 35,
        location: 'Los Angeles, CA',
        skills: [
          'Social Activism',
          'Game Development',
          'Product Development',
          'Mobile Games',
          'Casual Games'
        ],
        secondarySkills: [
          'Fundraising',
          'Rallying Community',
          'Storytelling',
          'Mentoring Children'
        ],
        nominations: [{
          name: 'Morgan Carson',
          skill: 'Social Activism',
          text: 'He\'s the tops!'
        }]
      }
    ]
  }
};


var app = {
  init: function () {
    var ReactScreens = require('../lib/react-screens/react-screens.jsx');

    this.screens = new ReactScreens(reactDomRoot);

    handleLocationsChange();

    puller.start();
  }
};



var handleActivityChange = function(){
  console.log('handleActivityChange', arguments, remote.user);

  var getActivity = remote.parse.activity.get;

  var ActivityScreen = require('./screen/activity.jsx');

  app.screens.addScreen(
    <ActivityScreen user={remote.user} getActivity={getActivity} handleBack={handleBack} />
  );
};

var handleBack = function (e) {
  console.log('handleBack', this, arguments);

  e.preventDefault();

  app.screens.back();
};

var handleLocationsChange = function(){
  console.log('handleLocationsChange', this, arguments);
  var LocationsScreen = require('./screen/locations.jsx');
  var props = stub.locations;

  var getCheckins = remote.parse.checkin.getByRegion.bind(remote.parse.checkin, '0');

  var handleMyProfileChange = handleProfileChange.bind(null, remote.user, true);

  app.screens.addScreen(
    <LocationsScreen locations={props.locations} getCheckins={getCheckins} handleLocationChange={handleLocationChange} handleMyProfileChange={handleMyProfileChange} handleActivityChange={handleActivityChange} handleLogOut={handleLogOut}></LocationsScreen>
  );
};

var handleLocationChange = function (props) {
  console.log('handleLocationChange', this, arguments);

  var getPosts = remote.fb.getPosts.bind(remote.fb, props.fbId);

  var handleMyProfileChange = handleProfileChange.bind(null, remote.user, true);

  var PostsScreen = require('./screen/posts.jsx');

  app.screens.addScreen(
    <PostsScreen photoURL={props.photoURL} name={props.name} checkin={props.checkin} distance={props.distance} address1={props.address1} address2={props.address2} promotion={props.promotion} posts={props.posts} fbId={props.fbId} handleBack={handleBack} user={remote.user} handleCheckInOut={handleCheckInOut} handleCreatePostOrComment={handleCreatePostOrComment} handleProfileChange={handleProfileChange} handlePostChange={handlePostChange} getPosts={getPosts} handleLike={handleLike} handleActivityChange={handleActivityChange} handleMyProfileChange={handleMyProfileChange} handleLogOut={handleLogOut}></PostsScreen>
  );
};

var handleProfileChange = function (user, fromMenu) {
  console.log('handleProfileChange', arguments, remote.user);

  var viewingSelf;

  if ((user.id || user.fb.id) === remote.user.fb.id) {
    // Todo: this seems a little fragile
    user = {
      cover: remote.user.cover,
      id: remote.user.fb.id,
      firstName: remote.user.firstName,
      likes: remote.user.fb.likes,
      name: remote.user.name,
      points: remote.user.points.points
    };

    viewingSelf = true;
  }

  var getProfile = remote.fb.getProfile;

  var getPoints = remote.parse.points.getByFbId;

  var ProfileScreen = require('./screen/profile.jsx');

  app.screens.addScreen(
    <ProfileScreen user={user} viewingSelf={viewingSelf} fromMenu={fromMenu} getProfile={getProfile} getPoints={getPoints} handleBack={handleBack}></ProfileScreen>
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



var handleCheckInOut = function (checkinId, placeId, isIn) {
  console.log('handleCheckInOut', this, arguments);

  remote.parse.checkin.checkInOut(checkinId, placeId, isIn);
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
  puller.stop();
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

  React.renderComponent(
    <WelcomeScreen handleLoginButton={handleLoginButton}></WelcomeScreen>
    ,
    reactDomRoot
  );
}

// Init

// if (window.location.protocol === 'file:') alert('Calling showFirstScreen'); // Helpful when testing on phone (pauses init so you can open console viewer)

showFirstScreen();