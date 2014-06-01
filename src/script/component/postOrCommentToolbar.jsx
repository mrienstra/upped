/** @jsx React.DOM */

var React = require('react/addons');

// Modules
var camera = require('../camera.js');

var PostOrCommentToolbar = React.createClass({
  getInitialState: function(){
    return {
      pictureDataURI: void 0
    };
  },
  propTypes: {
    handlePostOrCommentSubmit: React.PropTypes.func.isRequired,
    placeholderText: React.PropTypes.string.isRequired,
    isPostsOrComments: React.PropTypes.string.isRequired
  },
  showPicturePreview: function (pictureDataURI) {
    this.setState({
      pictureDataURI: pictureDataURI
    });
  },
  handleCamera: function(){
    this.showPicturePreview(testImageDataURI); return;
    camera.getPicture(
      this.showPicturePreview,
      function(){ console.error('handleCamera error', this, arguments); }
    );
  },
  handlePostOrCommentSubmit: function(){
    console.log('PostOrCommentToolbar handlePostOrCommentSubmit', this, arguments);

    var input = this.getDOMNode().querySelector('textarea');

    var msg = input.value.trim();

    if (!msg) return;

    this.props.handlePostOrCommentSubmit(this.props.isPostsOrComments, msg, this.state.pictureDataURI);

    // Reset

    input.value = '';
    this.autoSize();

    this.setState({
      pictureDataURI: void 0
    });
  },
  componentDidMount: function(){
    var thisDOMNode, textareaSize, input;

    thisDOMNode = this.getDOMNode();
    textareaSize = thisDOMNode.querySelector('.textarea-size');
    input = thisDOMNode.querySelector('textarea');

    this.autoSize = function(){
      textareaSize.innerHTML = input.value + '\n';
    };

    this.autoSize();
  },
  render: function(){
    var toolbarLeft;
    if (this.state.pictureDataURI) {
      toolbarLeft = <div className="picturePreview" style={{backgroundImage: 'url(' + this.state.pictureDataURI + ')'}}></div>;
    } else {
      toolbarLeft = <a className="icon ion-camera" onTouchEnd={this.handleCamera}></a>
    }

    return (
      <div className="post-form-wrapper">
        <div className="promo hide">
          <p><span className="icon ion-radio-waves"></span>Are you here? Check in to chat!</p>
        </div>
        <div className="post-form">
          <div className="left">
            {toolbarLeft}
          </div>
          <div className="right">
            <a onTouchEnd={this.handlePostOrCommentSubmit} className="inactive" id="post_button">Post</a>
          </div>
          <div className="center textarea-container">
            <textarea onInput={this.autoSize} placeholder={this.props.placeholderText}></textarea>
            <div className="textarea-size"></div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = PostOrCommentToolbar;