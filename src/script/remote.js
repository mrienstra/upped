var remote = {
  fb: {
    init: function(aCallback){
      Parse.FacebookUtils.init({
        appId     : '637656759644763',
        cookie    : true, // enable cookies to allow Parse to access the session
        xfbml     : true  // parse XFBML
      });

      aCallback();

      // TODO: fix this code
      // var handleFirstStatusChange = function(response) {
      //   FB.Event.unsubscribe('auth.statusChange', handleFirstStatusChange);
      //   remote.fb.status = response.status;
      //   remote.fb.authResponse = response.authResponse;
      //   var event = new CustomEvent('fbInitialized');
      //   window.dispatchEvent(event);
      // };
      // 
      // FB.Event.subscribe('auth.statusChange', handleFirstStatusChange);
    },
    // login: function (successCallback, failureCallback) { // note: this function is deprecated and has been replaced by parse.login
    //   FB.login(function(response) {
    //     console.log('FB.login', response);
    //     if (response.authResponse) {
    //       remote.fb.status = response.status;
    //       remote.fb.authResponse = response.authResponse;
    //       successCallback();
    //     } else {
    //       failureCallback();
    //     }
    //   }, {scope: 'basic_info,email,user_likes,publish_actions,publish_stream'}); // todo: we probably only need `publish_stream`
    // },
    getPosts: function(fbId, successCallback, failureCallback) {
      FB.api(
        fbId + '/tagged?fields=from.fields(name,picture),message,story,picture,link,application.id,likes,comments.fields(from.name,from.picture,message,like_count,user_likes)',
        'GET',
        function(response){
          console.log('remote.getPosts', response);
          if (response && !response.error) {
            console.log('response.data', response.data);
            var posts = response.data.map(function (post) {
              return {
                from: {
                  picture: post.from.picture.data.url,
                  name: post.from.name
                },
                time: post.created_time,
                post: {
                  message: post.message,
                  story: post.story,
                  picture: post.picture,
                  link: post.link
                },
                likes: post.likes && post.likes.data.length,
                comments: (!post.comments || !post.comments.data.length) ? [] : post.comments.data.map(function (comment) {
                  return {
                    from: {
                      picture: post.from.picture.data.url,
                      name: comment.from.name,
                    },
                    time: comment.created_time,
                    message: comment.message,
                    likes: comment.like_count,
                    liked: comment.user_likes
                  }
                })
              };
            });

            successCallback(posts);
          } else {
            failureCallback(response);
          }
        }
      );
    },
    createPost: function (post, successCallback, failureCallback) {
      FB.api(
        "/" + post.fbId + "/feed",
        "POST",
        {
          "message": post.message
        },
        function (response) {
          if (response && !response.error) {
            successCallback(response);
          } else {
            failureCallback(response);
          }
        }
      );
    }
  },
  parse: {
    getUser: function(){
      return Parse.User.current();
    },
    init: function(aCallback) {
      Parse.initialize("LoWKxsvTNtpAOKqOiPE6PjfdYomvLqBRskF299s1", "mdKlkB65pfc2CGipijGnRQMuQycXKHCS6ij5TetM");

      if (window.FB) {
        remote.fb.init(aCallback);
      } else {
        window.fbAsyncInit = function(){
          remote.fb.init(aCallback);
        }
      }
    },
    login: function(successCallback, failureCallback) {
      Parse.FacebookUtils.logIn("basic_info,email,user_likes,publish_actions,publish_stream", { // todo: is publish_actions necessary?
        success: function(user) {
          alert('foolsz');
          remote.parse.user = user;
          remote.parse.user.ftu = user.existed() ? false : true;
          successCallback();
        },
        error: function(user, error) {
          alert('foolszzz');
          failureCallback();
        }
      });
    },
    userExists: function(){
      if (typeof(parse.getUser()) != 'null') return true;
      else return false;
    }
  }
};

// Initialize FB JS SDK, synchronous or asynchronously
//if (window.Parse && window.FB) {
//  remote.fb.init();
//} else {
//  window.fbAsyncInit = remote.fb.init;
//}

module.exports = remote;