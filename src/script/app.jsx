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


var handleLocationsChange = function(){
  console.log('handleLocationsChange', this, arguments);
  var LocationsScreen = require('./screen/locations.jsx');
  var props = stub.locations;

  React.renderComponent(
    <LocationsScreen locations={props.locations} handleLocationChange={handleLocationChange}></LocationsScreen>
    ,
    reactDomRoot
  );
};

var handleLocationChange = function (props) {
  console.log('handleLocationChange', this, arguments);

  var PostsScreen = require('./screen/posts.jsx');

  var getPostsAsync = function(successCallback, failureCallback){
    remote.fb.getPosts(props.fbId, successCallback, failureCallback);
  }

  React.renderComponent(
    <PostsScreen name={props.name} checkedInCount={props.checkedInCount} address1={props.address1} address2={props.address2} promotion={props.promotion} posts={props.posts} fbId={props.fbId} handleLocationsChange={handleLocationsChange} handleCreatePost={handleCreatePost} handlePostChange={handlePostChange} getPostsAsync={getPostsAsync}></PostsScreen>
    ,
    reactDomRoot
  );
};

var handlePostChange = function (props) {
  console.log('handlePostChange', this, arguments);

  var PostScreen = require('./screen/post.jsx');

  React.renderComponent(
    <PostScreen location={props.location} from={props.from} time={props.time} post={props.post} likes={props.likes} comments={props.comments}></PostScreen>
    ,
    reactDomRoot
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

  handleLocationsChange();
};

var handleRejectedLogin = function(){
  alert('handleRejectedLogin: todo');
};

// showFirstScreen
// Test is user already has a BarChat account. if so, log them in. if not, show the welcome screen
var showFirstScreen = function(){
  remote.parse.init(); // Initialize Parse JS SDK
  if (remote.parse.userExists) {
    remote.parse.login(continuePastWelcomeScreen, handleRejectedLogin);
  }
  else showWelcomeScreen();
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
  
// if (remote.fb.status === void 0) {
//   // Scenario 1: We don't yet know if they need to login with Facebook or not
//   // Listen to find out
//   var handleFbInitialization = function (event) {
//     window.removeEventListener('fbInitialized', handleFbInitialization);
//     if (remote.fb.status === 'connected') {
//       continuePastWelcomeScreen();
//     } else {
//       wireUpSignInButton();
//     }
//   };
// 
//   window.addEventListener('fbInitialized', handleFbInitialization);
// } else if (remote.fb.status === 'connected') {
//   // Scenario 2: Good to go
//   continuePastWelcomeScreen();
// } else {
//   // Scenario 3: Activate login button
//   wireUpSignInButton();
// }