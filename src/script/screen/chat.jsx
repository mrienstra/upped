var React = require('react/addons');

// Libs
window.Firebase = require('firebase');
window.ReactFireMixin = require('reactfire');

// Mixins
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

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
  mixins: [ReactFireMixin, ScreenTransitionMixin],
  getInitialState: function(){
    return {
      messages: []
    };
  },
  initFirebase: function (props) {
    if (props.otherUserData) {
      var id = [props.selfUserData.id, props.otherUserData.id].sort().join('-');
      this.messagesRef = new Firebase('https://glaring-torch-1823.firebaseio.com/chat/' + id);
      this.bindAsArray(this.messagesRef, 'messages');
    }
  },
  componentWillMount: function(){
    console.log('ChatScreen.componentWillMount', this, arguments);
    this.initFirebase(this.props);
  },
  componentWillReceiveProps: function (nextProps) {
    console.log('ChatScreen.componentWillReceiveProps', this, arguments);
    this.initFirebase(nextProps);
  },
  componentDidMount: function(){
    this.contentNode = this.getDOMNode().getElementsByClassName('content')[0];

    this.scrollToBottom();

    // Keep `utils.momentFromNowIfTime` times fresh
    var that = this;
    window.setInterval(function(){
      if (Date.now() - that.lastRender > 29 * 1000) {
        that.forcedUpdate = true;
        that.forceUpdate(function(){
          that.forcedUpdate = false;
        });
      }
    }, 30 * 1000);
  },
  componentDidUpdate: function(){
    if (!this.forcedUpdate) {
      this.scrollToBottom();
    }
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

    if (!this.props.otherUserData) {
      return (
        <div className={React.addons.classSet.apply(null, this.state.classNames)}>
          <header className="bar bar-nav">
            <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack}><span className="icon icon-left-nav"></span> Back</a>
            <h1 className="title">Loading...</h1>
          </header>

          <div className="content">
            <span className="icon ion-loading-d"></span>
          </div>
        </div>
      );
    }

    this.lastRender = Date.now();

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
      <div className={React.addons.classSet.apply(null, this.state.classNames)}>
        <header className="bar bar-nav">
          <a className="btn btn-link btn-nav pull-left" onTouchEnd={this.props.handleBack}><span className="icon icon-left-nav"></span> Back</a>
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