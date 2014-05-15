/** @jsx React.DOM */

var remote = require('./remote.js');

var reactDomRoot = document.querySelector('#container');

var stub = {
  locations: {
    locations: [
      {
        name: '515 Kitchen & Cocktails',
        fbId: 240545564672,
        checkedInCount: 1,
        address1: '515 Cedar St',
        address2: 'Santa Cruz, CA 95060',
        distance: '.2 mi away'
      },
      {
        name: 'Cafe Mare',
        fbId: 269901256358819,
        checkedInCount: 1,
        address1: '740 Front St, #100',
        address2: 'Santa Cruz, CA 95060',
        distance: '.2 mi away'
      },
      {
        name: 'MOTIV',
        fbId: 112468103763, // 204393176242846 was merged into page
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
        checkedInCount: 1,
        address1: '1220 Pacific St',
        address2: 'Santa Cruz, CA 95060',
        distance: '.1 mi away'
      },
      {
        name: 'The Rush Inn',
        fbId: 460268814089550, // Alternate: 100000701335606
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

  app.screens.addScreen(
    <LocationsScreen locations={props.locations} handleLocationChange={handleLocationChange}></LocationsScreen>
  );
};

var handleLocationChange = function (props) {
  console.log('handleLocationChange', this, arguments);

  var getPosts = remote.fb.getPosts.bind(remote.fb, props.fbId);

  var PostsScreen = require('./screen/posts.jsx');

  app.screens.addScreen(
    <PostsScreen name={props.name} checkedInCount={props.checkedInCount} address1={props.address1} address2={props.address2} promotion={props.promotion} posts={props.posts} fbId={props.fbId} handleBack={handleBack} user={remote.user} handleCreatePost={handleCreatePost} handlePostChange={handlePostChange} getPosts={getPosts} handleLove={handleLove}></PostsScreen>
  );
};

var handlePostChange = function (props) {
  console.log('handlePostChange', this, arguments);

  var PostScreen = require('./screen/post.jsx');

  app.screens.addScreen(
    <PostScreen location={props.location} from={props.from} time={props.time} post={props.post} likes={props.likes} comments={props.comments} user={remote.user} handleBack={handleBack}></PostScreen>
  );
};



var handleCreatePost = function (msg, refresh) {
  console.log('handleCreatePost', this, arguments);

  remote.fb.createPost(
    {
      fbId: this.fbId,
      message: msg
    },
    function (response) {
      console.log('handleCreatePost response', response);
      refresh();
    },
    function (response) {
      console.error('handleCreatePost response', response);
      alert('Todo: Handle createPost error');
    }
  );
};

var handleLove = function (e, id, refresh) {
  console.log('handleLove', this, arguments);

  e.stopPropagation();

  FB.api(
    '/' + id + '/likes',
    'POST',
    function (response) {
      if (response === true) {
        console.log('handleLove response true!', this, arguments);
        refresh();
      } else {
        console.error('boo');
        alert('Todo: handle this!');
      }
    }
  );
};



var continuePastWelcomeScreen = function(){
  window.removeEventListener('fbAndParseLoginSuccess', continuePastWelcomeScreen);

  // todo: remove below testing code; make FTU experience more "welcoming"!
  if (remote.parse.user.ftu) console.log ('new user!');
  else console.log ('returning user!')

  app.init();
};

var showFirstScreen = function(){
  window.addEventListener('fbLoginNeeded', showWelcomeScreen);

  window.addEventListener('fbAndParseLoginSuccess', continuePastWelcomeScreen);

  remote.init();
}

var showWelcomeScreen = function(){
  window.removeEventListener('fbLoginNeeded', showWelcomeScreen);

  var WelcomeScreen = require('./screen/welcome.jsx');

  var handleLoginButton = function(){
    // Todo: visual indicator that things are happening

    remote.login();
  };

  React.renderComponent(
    <WelcomeScreen handleLoginButton={handleLoginButton}></WelcomeScreen>
    ,
    reactDomRoot
  );
}



// Init
showFirstScreen();