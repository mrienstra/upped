/** @jsx React.DOM */

var remote = require('./remote.js');

var reactDomRoot = document.querySelector('#container');

var stub = {
  locations: {
    locations: [
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
        name: 'The Rush Inn',
        fbId: 460268814089550, // Alternate: 100000701335606
        checkedInCount: 3,
        address1: '113 Knight St',
        address2: 'Santa Cruz, CA 95060',
        distance: '.2 mi away'
      },
      {
        name: 'Rosie McCann’s',
        fbId: 1710649235,
        checkedInCount: 1,
        address1: '1220 Pacific St',
        address2: 'Santa Cruz, CA 95060',
        distance: '.1 mi away'
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

  var postsDeferred = remote.fb.getPosts(props.fbId);

  var PostsScreen = require('./screen/posts.jsx');

  app.screens.addScreen(
    <PostsScreen name={props.name} checkedInCount={props.checkedInCount} address1={props.address1} address2={props.address2} promotion={props.promotion} posts={props.posts} fbId={props.fbId} handleBack={handleBack} handleCreatePost={handleCreatePost} handlePostChange={handlePostChange} postsDeferred={postsDeferred}></PostsScreen>
  );
};

var handlePostChange = function (props) {
  console.log('handlePostChange', this, arguments);

  var PostScreen = require('./screen/post.jsx');

  app.screens.addScreen(
    <PostScreen location={props.location} from={props.from} time={props.time} post={props.post} likes={props.likes} comments={props.comments} handleBack={handleBack}></PostScreen>
  );
};



var handleCreatePost = function (props) {
  console.log('handleCreatePost', this, arguments);

  remote.fb.createPost(
    {
      fbId: props.fbId,
      message: "This is a test message from " + props.name + "!!!"
    },
    function (response) {
      console.log('handleCreatePost response', response);
    },
    function (response) {
      console.error('handleCreatePost response', response);
    }
  );
};



var continuePastWelcomeScreen = function(){
  // todo: remove below testing code make FTU experience more "welcoming"!
  if (remote.parse.user.ftu) console.log ('new user!');
  else console.log ('returning user!')

  app.init();
};

var handleRejectedLogin = function(){
  alert('handleRejectedLogin: todo');
};

var showFirstScreen = function(){
  // Todo: show welcome screen when needed
  // showWelcomeScreen();
  remote.init(continuePastWelcomeScreen, handleRejectedLogin);
}

var showWelcomeScreen = function(){
  var WelcomeScreen = require('./screen/welcome.jsx');

  React.renderComponent(
    <WelcomeScreen></WelcomeScreen>
    ,
    reactDomRoot
  );
  wireUpSignInButton();
}

var wireUpSignInButton = function(){
  var signInButton = document.querySelector('.welcome .bottom button');
  signInButton.classList.remove('disabled');
  signInButton.removeAttribute('disabled');
  window.addEventListener('click', function (event) {
    if (event.target === signInButton) {
      remote.parse.login(continuePastWelcomeScreen, handleRejectedLogin);
    }
  });
};



// Init
showFirstScreen();