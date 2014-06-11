var postOrCommentSubmitMixin = {
  propTypes: {
    user: React.PropTypes.object.isRequired,
    handleCreatePostOrComment: React.PropTypes.func.isRequired
  },
  handlePostOrCommentSubmit: function (isPostsOrComments, msg, pictureDataURI) {
    console.log('postOrCommentSubmitMixin handlePostOrCommentSubmit', this, isPostsOrComments, msg, typeof pictureDataURI, Date.now());

    var that = this;
    var thatPostOrCommentId;

    var getExistingCollection = function(){
      return that.state[isPostsOrComments].length ? that.state[isPostsOrComments] : that.props[isPostsOrComments];
    };

    var setPostsOrCommentsState = function (newCollection) {
      var setStateObj = {};
      setStateObj[isPostsOrComments] = newCollection;
      that.setState(setStateObj);
    };

    var isTargetModel = function (model) {
      return ((model.post && model.post.message === msg) || model.message === msg)
             && (model.time === 'pending' || (thatPostOrCommentId && model.id === thatPostOrCommentId));
    };

    var onSuccess = function (postOrCommentId, pictureIdpromise) {
      console.log('postOrCommentSubmitMixin handlePostOrCommentSubmit onSuccess', this, arguments);

      thatPostOrCommentId = postOrCommentId;

      var newCollection = getExistingCollection().concat();
      if (newCollection.some(function (model, i) {
        if (isTargetModel(model)) {
          newCollection[i].time = 'a few seconds ago'; // Same as `moment().fromNow()`
          newCollection[i].id = postOrCommentId;
          return true;
        }
      })) {
        setPostsOrCommentsState(newCollection);
      }

      if (pictureIdpromise) {
        pictureIdpromise.then(function (pictureUrl) {
         console.log('postOrCommentSubmitMixin handlePostOrCommentSubmit onSuccess pictureIdpromise.then', this, arguments);
          var newCollection = getExistingCollection().concat();
          if (newCollection.some(function (model, i) {
            if (isTargetModel(model)) {
              if (newCollection[i].post) {
                newCollection[i].post.picture = pictureUrl;
              } else {
                newCollection[i].picture = pictureUrl;
              }
              return true;
            }
          })) {
            setPostsOrCommentsState(newCollection);
          }
        },
        function(){
          console.error(this, arguments);
        })
      }
    };

    var onFailure = function (response) {
      if (response === 'Publish permissions denied') {
        // Todo: how to respond? Maybe direct them to a webpage describing how we use publish permissions? Or say something cheeky?
      } else {
        console.error('postOrCommentSubmitMixin handlePostOrCommentSubmit error', this, arguments);
        alert('Todo: postOrCommentSubmitMixin handlePostOrCommentSubmit error: ' + JSON.stringify(response));
      }

      var newCollection = getExistingCollection().concat();
      if (newCollection.some(function (model, i) {
        if (isTargetModel(model)) {
          newCollection.splice(i, 1);
          return true;
        }
      })) {
        setPostsOrCommentsState(newCollection);
      }
    };



    // Pending item
    var pendingPostOrComment;
    if (isPostsOrComments === 'posts') {
      pendingPostOrComment = {
        comments:[],
        from: {
          // todo: handle `this.props.user` not being available
          id: this.props.user.fb.id,
          name: this.props.user.name,
          picture: this.props.user.picture
        },
        id: '',
        post: {
          message: msg
        },
        time: 'pending'
      };
    } else { // isPostsOrComments === 'comments'
      pendingPostOrComment = {
        from: {
          // todo: handle `this.props.user` not being available
          picture: this.props.user.picture,
          name: this.props.user.name
        },
        id: '',
        likeCount: 0,
        message: msg,
        time: 'pending',
        userLikes: false
      };
    }



    // Update state (which will "optimistically" show the pending item)
    var newCollection;
    if (isPostsOrComments === 'posts') {
      // New to old: prepend
      newCollection = [pendingPostOrComment].concat(getExistingCollection());
    } else { // isPostsOrComments === 'comments'
      // Old to new: append
      newCollection = getExistingCollection().concat(pendingPostOrComment);
    }
    setPostsOrCommentsState(newCollection);

    // Make the call
    this.props.handleCreatePostOrComment(
      isPostsOrComments,
      msg,
      pictureDataURI,
      onSuccess,
      onFailure
    );
  }
};

module.exports = postOrCommentSubmitMixin;