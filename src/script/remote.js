var remote = {
  fb: {
    login: function (successCallback, failureCallback) {
      FB.login(function(response) {
        console.log('FB.login', response);
        if (response.authResponse) {
          remote.fb.status = response.status;
          remote.fb.authResponse = response.authResponse;
          successCallback();
        } else {
          failureCallback();
        }
      }, {scope: 'basic_info,publish_actions,publish_stream'}); // todo: we probably only need `publish_stream`
    },
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
  }
};

var initFB = function() {
  FB.init({
    appId: '197721303747805',
    status: true
  });

  var handleFirstStatusChange = function(response) {
    FB.Event.unsubscribe('auth.statusChange', handleFirstStatusChange);
    remote.fb.status = response.status;
    remote.fb.authResponse = response.authResponse;
    var event = new CustomEvent('fbInitialized');
    window.dispatchEvent(event);
  };

  FB.Event.subscribe('auth.statusChange', handleFirstStatusChange);
};

if (window.FB) {
  initFB();
} else {
  // Will be Called automatically by Facebook Javascript SDK
  window.fbAsyncInit = initFB;
}

module.exports = remote;