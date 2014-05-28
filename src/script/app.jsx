/** @jsx React.DOM */

var remote = require('./remote.js');

var reactDomRoot = document.querySelector('#container');

var stub = {
  locations: {
    locations: [
      {
        name: '515 Kitchen & Cocktails',
        fbId: 240545564672,
        photoURL: 'https://scontent-b-sjc.xx.fbcdn.net/hphotos-prn1/t1.0-9/547619_10151627462164673_2140008861_n.jpg',
        checkedInCount: 1,
        address1: '515 Cedar St',
        address2: 'Santa Cruz, CA 95060',
        distance: '.2 mi away'
      },
      {
        name: 'Cafe Mare',
        fbId: 269901256358819,
        photoURL: 'https://scontent-a-sjc.xx.fbcdn.net/hphotos-ash3/t31.0-8/p960x960/1074700_673818769300397_437853795_o.jpg',
        checkedInCount: 1,
        address1: '740 Front St, #100',
        address2: 'Santa Cruz, CA 95060',
        distance: '.2 mi away'
      },
      {
        name: 'MOTIV',
        fbId: 112468103763, // 204393176242846 was merged into page
        photoURL: 'https://scontent-a-sjc.xx.fbcdn.net/hphotos-ash2/t1.0-9/419945_10150719331073764_1700138881_n.jpg',
        checkedInCount: 4,
        address1: '1209 Pacific Ave.',
        address2: 'Santa Cruz, CA 95060',
        distance: '.1 mi away',
        promotion: {
          title: 'James Bond',
          message: 'Every 50th BarChat posted to our wall is rewarded with a swanky drink upgrade!'
        }
      },
      {
        name: 'The Red Room',
        fbId: 111627012207432,
        photoURL: 'https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-frc3/t1.0-9/10269644_676768595693268_7156454855741968687_n.jpg',
        checkedInCount: 4,
        address1: '343 Cedar St',
        address2: 'Santa Cruz, CA 95060',
        distance: '500 ft away',
        promotion: {
          title: 'Score Free Drinks',
          message: 'Every 50th BarChat posted to our wall scores the poster a free penny drink, courtesy of The Red Room!'
        }
      },
      {
        name: 'Rosie McCann’s',
        fbId: 1710649235,
        photoURL: 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-prn2/t1.0-9/1240413_655834227782885_2042754469_n.jpg',
        checkedInCount: 1,
        address1: '1220 Pacific St',
        address2: 'Santa Cruz, CA 95060',
        distance: '.1 mi away'
      },
      {
        name: 'The Rush Inn',
        fbId: 460268814089550, // Alternate: 100000701335606
        photoURL: 'https://scontent-a-sjc.xx.fbcdn.net/hphotos-prn2/t1.0-9/1390471_460278620755236_1620332253_n.jpg',
        checkedInCount: 3,
        address1: '113 Knight St',
        address2: 'Santa Cruz, CA 95060',
        distance: '.2 mi away'
      }
    ]
  }
};



var app = {
  init: function () {
    var ReactScreens = require('../lib/react-screens/react-screens.jsx');

    this.screens = new ReactScreens(reactDomRoot);

    handleLocationsChange();
  }
};



var handleBack = function(){
  console.log('handleBack', this, arguments);
  app.screens.back();
};

var handleLocationsChange = function(){
  console.log('handleLocationsChange', this, arguments);
  var LocationsScreen = require('./screen/locations.jsx');
  var props = stub.locations;

  var thisHandleProfileChange = handleProfileChange.bind(null, {user: remote.user});

  app.screens.addScreen(
    <LocationsScreen locations={props.locations} handleLocationChange={handleLocationChange} handleProfileChange={thisHandleProfileChange} handleLogOut={handleLogOut}></LocationsScreen>
  );
};

var handleLocationChange = function (props) {
  console.log('handleLocationChange', this, arguments);

  var getPosts = remote.fb.getPosts.bind(remote.fb, props.fbId);

  var PostsScreen = require('./screen/posts.jsx');

  app.screens.addScreen(
    <PostsScreen photoURL={props.photoURL} name={props.name} checkedInCount={props.checkedInCount} address1={props.address1} address2={props.address2} promotion={props.promotion} posts={props.posts} fbId={props.fbId} handleBack={handleBack} user={remote.user} handleCreatePost={handleCreatePost} handlePostChange={handlePostChange} getPosts={getPosts} handleLike={handleLike}></PostsScreen>
  );
};

var handleProfileChange = function (props) {
  console.log('handleProfileChange', this, arguments);

  var ProfileScreen = require('./screen/profile.jsx');

  app.screens.addScreen(
    <ProfileScreen user={props.user} viewingUser={remote.user} handleBack={handleBack}></ProfileScreen>
  );
};

var handlePostChange = function (props) {
  console.log('handlePostChange', this, arguments);

  var getPost = remote.fb.getPost.bind(remote.fb, props.id);

  var post = {
    comments: props.comments,
    from: props.from,
    id: props.id,
    likes: props.likes,
    post: props.post,
    time: props.time
  };

  var PostScreen = require('./screen/post.jsx');

  app.screens.addScreen(
    <PostScreen location={props.location} post={post} user={remote.user} refreshPosts={props.refresh} getPost={getPost} handleBack={handleBack} handleLike={handleLike}></PostScreen>
  );
};



var handleCreatePost = function (msg, pictureDataURI, successCallback, failureCallback) {
  console.log('handleCreatePost', this, arguments);

  var post = {
    fbId: this.fbId,
    message: msg,
    pictureDataURI: pictureDataURI
  };

  remote.fb.createPost(
    post,
    successCallback,
    failureCallback
  );
};

var handleLike = function (id, userLikes, successCallback, failureCallback) {
  console.log('handleLike', this, arguments);

  remote.fb.like(
    id,
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

var showFirstScreen = function(){
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
showFirstScreen();