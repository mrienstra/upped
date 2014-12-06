/** @jsx React.DOM */

var React = require('react/addons');

// Libs
window.Firebase = require('firebase');
window.ReactFireMixin = require('reactfire');


// Modules
var camera = require('../camera.js');
var utils = require('../utils');

var ChatToolbar = React.createClass({
  getInitialState: function(){
    return {
      pictureDataURI: void 0
    };
  },
  showPicturePreview: function (pictureDataURI) {
    this.setState({
      pictureDataURI: pictureDataURI
    });
  },
  handleCamera: function(){
    camera.getPicture(
      this.showPicturePreview,
      function(){ console.error('handleCamera error', this, arguments); }
    );
  },
  handleMessageSubmit: function(){
    console.log('ChatToolbar handleMessageSubmit', this, arguments);

    var input = this.getDOMNode().querySelector('textarea');

    var msg = input.value.trim();

    if (!msg) return;

    this.props.handleMessageSubmit(msg, this.state.pictureDataURI);

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
      <div className="bar bar-standard bar-footer">
        <div className="left">
          {toolbarLeft}
        </div>
        <div className="right">
          <a onTouchEnd={this.handleMessageSubmit}>Send</a>
        </div>
        <div className="center textarea-container">
          <textarea onInput={this.autoSize} placeholder="What are you up to?"></textarea>
          <div className="textarea-size"></div>
        </div>
      </div>
    );
  }
});



var ChatScreen = React.createClass({
  mixins: [ReactFireMixin],
  getInitialState: function(){
    return {
      messages: []
    };
  },
  componentWillMount: function() {
    var id = [this.props.selfUserData.id, this.props.otherUserData.id].sort().join('-');
    this.messagesRef = new Firebase('https://fiery-heat-8100.firebaseio.com/' + id);
    this.bindAsArray(this.messagesRef, 'messages');
  },
  componentDidMount: function(){
    this.contentNode = this.getDOMNode().getElementsByClassName('content')[0];

    this.scrollToBottom();
  },
  componentDidUpdate: function(){
    this.scrollToBottom();
  },
  scrollToBottom: function(){
    this.contentNode.scrollTop = this.contentNode.scrollHeight;
  },
  handleMessageSubmit: function (msg, pictureDataURI) {
    console.log('ChatScreen handleMessageSubmit', this, arguments);

    this.messagesRef.push({ // todo: handle error
      from:  this.props.selfUserData.id,
      to: this.props.otherUserData.id,
      text: msg,
      time: Date.now()
    });

    this.scrollToBottom();
  },
  render: function(){
    console.log('ChatScreen.render', this);

    var that = this;

    var lastTime;
    var messages = [];
    var key = 0;
    this.state.messages.forEach(function (message) {
      var time = utils.momentFromNowIfTime(message.time);
      if (time !== lastTime) {
        messages.push(
          <li key={key++} className="time">{time}</li>
        );
      }
      lastTime = time;
      var actor = message.from === that.props.selfUserData.id ? 'you' : 'they';
      messages.push(
        <li key={key++} className={actor}>{message.text}</li>
      );
    });

    return (
      <div>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack} data-transition="slide-out"><span className="icon icon-left-nav"></span> Back</a>
          <h1 className="title">Chat with {this.props.otherUserData.name}</h1>
        </header>

        <div className="content">
          <ol className="messages">
            {messages}
            <li />
          </ol>
        </div>

        <ChatToolbar handleMessageSubmit={this.handleMessageSubmit}></ChatToolbar>

      </div>
    );
  }
});

module.exports = ChatScreen;