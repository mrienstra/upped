/** @jsx React.DOM */

var remote = require('./remote.js');

var stub = {
  locations: {
    locations: [
      {
        name: 'The Red Room',
        checkedInCount: 4,
        distance: '500 ft away'
      },
      {
        name: 'One Double Oh Seven',
        slug: 'One-Double-Oh-Seven-Smoking-Parlor',
        checkedInCount: 3,
        distance: '.6 mi away'
      },
      {
        name: 'Rosie McCann’s',
        slug: 'RosieMcCanns',
        checkedInCount: 1,
        distance: '.1 mi away'
      }
    ]
  },
  locationDetail: {
    handlePostChange: handlePostChange,
    name: 'The Red Room',
    checkedInCount: 1,
    address1: '343 Cedar St',
    address2: 'Santa Cruz, CA 95060',
    promotion: {
      title: 'Score Free Drinks',
      message: 'Every 50th BarChat posted to our wall scores the poster a free penny drink, courtesy of The Red Room!'
    },
    posts: [
      {
        name: 'Justin',
        time: 'just now',
        message: 'Hey ladies, Justin Bieber is in the house tonight.\nCome and get me while I\'m still single!',
        likes: 0,
        comments: 0
      },
      {
        name: 'Ron',
        time: '23 mins',
        message: 'Who let this guy in? Doesn\'t anybody check IDs anymore?',
        likes: 1,
        comments: 1
      },
      {
        name: 'Laticia',
        time: '57 mins',
        message: 'Actually, I think he\'s kind of cute.',
        likes: 2,
        comments: 2
      }
    ]
  },
  post: {
    location: 'The Red Room',
    name: 'Justin',
    time: 'just now',
    message: 'Hey ladies, Justin Bieber is in the house tonight.\nCome and get me while I\'m still single!',
    likes: 1,
    commentCount: 1,
    comments: [
      {
        name: 'Jacinda',
        time: 'just now',
        emotes: 'Likes this post.'
      },
      {
        name: 'Ron',
        time: '23 mins',
        message: 'I\'m looking for you, Bieber. Where are you?',
        likes: 0
      }
    ]
  }
};



var handleLocationsChange = function (event) {
  console.log('handleLocationsChange', event);
  var LocationsScreen = require('./screen/locations.jsx');
  var props = stub.locations;

  React.renderComponent(
    <LocationsScreen locations={props.locations} handleLocationChange={handleLocationChange}></LocationsScreen>
    ,
    document.body
  );
};

var handleLocationChange = function (event) {
  console.log('handleLocationChange', event);
  var PostsScreen = require('./screen/posts.jsx');
  var props = stub.locationDetail;

  React.renderComponent(
    <PostsScreen name={props.name} checkedInCount={props.checkedInCount} address1={props.address1} address2={props.address2} promotion={props.promotion} posts={props.posts} handlePostChange={handlePostChange}></PostsScreen>
    ,
    document.body
  );
};

var handlePostChange = function (event) {
  console.log('handlePostChange', event);
  var PostScreen = require('./screen/post.jsx');
  var props = stub.post;

  React.renderComponent(
    <PostScreen location={props.location} name={props.name} time={props.time} message={props.message} likes={props.likes} commentCount={props.commentCount} comments={props.comments}></PostScreen>
    ,
    document.body
  );
};



var continuePastWelcomeScreen = function(){
  // todo: remove this hack
  document.querySelector('body').classList.remove('welcome');

  handleLocationsChange();
};

var handleRejectedLogin = function(){
  alert('handleRejectedLogin: todo');
};

var wireUpSignInButton = function(){
  var signInButton = document.querySelector('.welcome .bottom button');
  signInButton.classList.remove('disabled');
  signInButton.removeAttribute('disabled');
  window.addEventListener('click', function (event) {
    if (event.target === signInButton) {
      remote.fb.login(continuePastWelcomeScreen, handleRejectedLogin);
    }
  });
};



// Init

if (remote.fb.status === void 0) {
  // Scenario 1: We don't yet know if they need to login with Facebook or not
  // Listen to find out
  var handleFbInitialization = function (event) {
    window.removeEventListener('fbInitialized', handleFbInitialization);
    if (remote.fb.status === 'connected') {
      continuePastWelcomeScreen();
    } else {
      wireUpSignInButton();
    }
  };

  window.addEventListener('fbInitialized', handleFbInitialization);
} else if (remote.fb.status === 'connected') {
  // Scenario 2: Good to go
  continuePastWelcomeScreen();
} else {
  // Scenario 3: Activate login button
  wireUpSignInButton();
}