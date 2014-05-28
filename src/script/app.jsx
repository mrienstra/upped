/** @jsx React.DOM */

var remote = require('./remote.js');

var reactDomRoot = document.querySelector('.container');

var stub = {
  locations: {
    locations: [
      {
        name: '515 Kitchen & Cocktails',
        fbId: 240545564672,
        photoURL: 'https://scontent-b-sjc.xx.fbcdn.net/hphotos-xfa1/t31.0-8/209601_615446883190_2111600019_o.jpg',
        thumbURL: 'https://scontent-b.xx.fbcdn.net/hphotos-xpf1/t1.0-9/s130x130/228348_615446883190_2111600019_n.jpg',
        checkedInCount: 1,
        address1: '515 Cedar St',
        address2: 'Santa Cruz, CA 95060',
        distance: '1.2 mi'
      },
      {
        name: 'Cafe Mare',
        fbId: 269901256358819,
        photoURL: 'https://scontent-a-sjc.xx.fbcdn.net/hphotos-xpa1/t31.0-8/10317583_851293891552883_5832842782109228495_o.jpg',
        thumbURL: 'https://fbcdn-photos-a-a.akamaihd.net/hphotos-ak-xpf1/t1.0-0/10273822_851293891552883_5832842782109228495_s.jpg',
        checkedInCount: 1,
        address1: '740 Front St, #100',
        address2: 'Santa Cruz, CA 95060',
        distance: '0.2 mi'
      },
      {
        name: 'MOTIV',
        fbId: 112468103763, // 204393176242846 was merged into page
        photoURL: 'https://scontent-b.xx.fbcdn.net/hphotos-prn1/t31.0-8/894935_10151613262373764_211726629_o.jpg',
        thumbURL: 'https://scontent-b.xx.fbcdn.net/hphotos-xaf1/t1.0-9/s130x130/532107_10151613262373764_211726629_n.jpg',
        checkedInCount: 4,
        address1: '1209 Pacific Ave.',
        address2: 'Santa Cruz, CA 95060',
        distance: '0.1 mi',
        promotion: {
          title: 'James Bond',
          message: 'Every 50th BarChat posted to our wall is rewarded with a swanky drink upgrade!'
        }
      },
      {
        name: 'The Red Room',
        fbId: 111627012207432,
        photoURL: 'https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-frc3/t1.0-9/10269644_676768595693268_7156454855741968687_n.jpg',
        thumbURL: 'https://fbcdn-photos-b-a.akamaihd.net/hphotos-ak-xpf1/t1.0-0/10176261_674984622538332_3803597536558734519_s.jpg',
        checkedInCount: 4,
        address1: '343 Cedar St',
        address2: 'Santa Cruz, CA 95060',
        distance: '500 ft',
        promotion: {
          title: 'Score Free Drinks',
          message: 'Every 50th BarChat posted to our wall scores the poster a free penny drink, courtesy of The Red Room!'
        }
      },
      {
        name: 'Rosie McCann’s',
        fbId: 111229748910005,
        photoURL: 'https://scontent-b-sjc.xx.fbcdn.net/hphotos-xpa1/t1.0-9/1010091_752914534741520_1709817537_n.jpg',
        thumbURL: 'https://fbcdn-photos-f-a.akamaihd.net/hphotos-ak-xpa1/t1.0-0/1010091_752914534741520_1709817537_s.jpg',
        checkedInCount: 1,
        address1: '1220 Pacific Ave.',
        address2: 'Santa Cruz, CA 95060',
        distance: '0.1 mi'
      },
      {
        name: 'The Blue Lagoon',
        fbId: 79541193863,
        photoURL: 'https://scontent-a-sjc.xx.fbcdn.net/hphotos-xaf1/t1.0-9/4445_79593858863_7376662_n.jpg',
        thumbURL: 'https://scontent-a.xx.fbcdn.net/hphotos-xaf1/t1.0-9/s130x130/4445_79593858863_7376662_n.jpg',
        checkedInCount: 1,
        address1: '923 Pacific Ave.',
        address2: 'Santa Cruz, CA 95060',
        distance: '0.1 mi'
      }
      // {
      //   name: 'The Rush Inn',
      //   fbId: 460268814089550, // Alternate: 100000701335606
      //   photoURL: 'https://scontent-a-sjc.xx.fbcdn.net/hphotos-prn2/t1.0-9/1390471_460278620755236_1620332253_n.jpg',
      //   thumbURL: '',
      //   checkedInCount: 3,
      //   address1: '113 Knight St',
      //   address2: 'Santa Cruz, CA 95060',
      //   distance: '.2 mi away'
      // }
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
    <PostsScreen photoURL={props.photoURL} name={props.name} distance={props.distance} checkedInCount={props.checkedInCount} address1={props.address1} address2={props.address2} promotion={props.promotion} posts={props.posts} fbId={props.fbId} handleBack={handleBack} user={remote.user} handleCreatePost={handleCreatePost} handlePostChange={handlePostChange} getPosts={getPosts} handleLike={handleLike}></PostsScreen>
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