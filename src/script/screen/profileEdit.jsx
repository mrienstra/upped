var React = require('react');

// Data
var categories = require('../data/categories.js');

// Libs
var _ = require('lodash');
var classNames = require('classnames');

// Mixins
var ScreenTransitionMixin = require('../mixin/screenTransition.js');

var ProfileEditScreen = React.createClass({
  mixins: [ScreenTransitionMixin],
  propTypes: {
    userData: React.PropTypes.object,
    saveUserDataChanges: React.PropTypes.func,
    handleBack: React.PropTypes.func,
  },
  editableProperties: ['name', 'sushi', 'location', 'keywords'],
  getInitialState: function() {
    if (this.props.userData) {
      return this.transferEditablePropsToStateObj(this.props.userData);
    } else {
      return {};
    }
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.userData) {
      this.setState(this.transferEditablePropsToStateObj(nextProps.userData));
    }
  },
  transferEditablePropsToStateObj: function (props) {
    var that = this;
    var stateObj = {};
    this.editableProperties.forEach(function (prop) {
      stateObj[prop] = props[prop];
    });

    return stateObj;
  },
  updateUserDataKeywords: function (userDataKeywords) {
    this.setState({keywords: userDataKeywords});
  },
  handleDone: function (e) {
    var that = this;
    var modifiedUserData = {};
    var dirty = false;

    this.editableProperties.forEach(function (prop) {
      if (that.state[prop] !== that.props.userData[prop]) {
        modifiedUserData[prop] = that.state[prop];
        dirty = true;
      }
    });

    if (dirty) {
      this.props.saveUserDataChanges(modifiedUserData);
    }

    this.props.handleBack(e);
  },
  onChange: function (propName, e) {
    if (propName === 'name') {
      this.setState({name: e.target.value.substr(0, 48)});
    } else if (propName === 'sushi') {
      this.setState({sushi: e.target.value.substr(0, 140)});
    } else if (propName === 'location') {
      this.setState({location: e.target.value.substr(0, 48)});
    } else if (propName === 'keywords') {
      var editedKeywords = this.state.keywords.concat();
      var keywordIndex = [].indexOf.call(e.target.parentNode.parentNode.parentNode.childNodes, e.target.parentNode.parentNode);
      if (keywordIndex !== -1) {
        editedKeywords[keywordIndex] = e.target.value.substr(0, 48);
        this.setState({keywords: editedKeywords});
      } else {
        console.error('WTF', this, arguments);
      }
    }
  },
  deleteKeyword: function (e) {
    var editedKeywords = this.state.keywords.concat();
    var keywordIndex = [].indexOf.call(e.target.parentNode.parentNode.childNodes, e.target.parentNode);
    if (keywordIndex !== -1) {
      console.log('deleteKeyword', keywordIndex, editedKeywords[keywordIndex]);
      editedKeywords.splice(keywordIndex, 1);
      this.setState({keywords: editedKeywords});
    } else {
      console.error('WTF', this, arguments);
    }
  },
  addKeyword: function(){
    var editedKeywords = (this.state.keywords || []).concat();
    editedKeywords.push('');
    this.setState({keywords: editedKeywords});
  },
  render: function(){
    //console.log('ProfileEditScreen.render', this);
    var that = this;

    if (!this.props.userData) {
      return (
        <div className={classNames.apply(null, this.state.classNames)}>
          <span className="icon ion-loading-d"></span>
        </div>
      );
    }

    var img = this.props.userData.photoURL ? <img src={this.props.userData.photoURL}/> : '';

    var keywords = [];
    if (this.state.keywords && this.state.keywords.length) {
      keywords = this.state.keywords.map(function (name, i) {
        var category;
        if (name === parseInt(name.toString()) && (category = _.find(categories, {id: name}))) {
          name = category.name;
        }

        var deleteButton;
        if (that.state.keywords.length > 1) {
          deleteButton = (
            <button className="button button-clear icon ion-ios-close-outline" onTouchEnd={that.deleteKeyword}/>
          );
        }
        return (
          <div key={i} className="item-input">
            <label className="item-input-wrapper">
              <input type="text" placeholder="Keyword" value={name} onChange={that.onChange.bind(that, 'keywords')} disabled={!that.props.visible}/>
            </label>
            {deleteButton}
          </div>
        );
      });
    }

    if (keywords.length < 5) {
      keywords.push(
        <a key={keywords.length} className="item item-icon-left" href="#" onTouchEnd={that.addKeyword}>
          <i className="icon ion-ios-plus-outline"></i>
          Add
        </a>
      );
    }

    return (
      <div className={classNames.apply(null, this.state.classNames)}>
        <div className="bar-stable bar bar-header nav-bar disable-user-behavior">
          <div className="buttons left-buttons">
            <div>
              <button className="button button-icon icon ion-chevron-left" onTouchEnd={this.handleDone}></button>
            </div>
          </div>
          <h1 className="title">Edit Profile</h1>
        </div>

        <div className="scroll-content overflow-scroll has-header">
          <div className="list">
            <div className="item item-image">
              {img}
            </div>
            <label className="item item-input">
              <input type="text" inputmode="latin-name" placeholder="Name" value={this.state.name} onChange={this.onChange.bind(this, 'name')} disabled={!this.props.visible}/>
            </label>
            <label className="item item-input location">
              <input type="text" placeholder="Location" value={this.state.location} onChange={this.onChange.bind(this, 'location')} disabled={!this.props.visible}/>
            </label>
            <label className="item item-input sushi">
              <textarea placeholder="Sushi" value={this.state.sushi} onChange={this.onChange.bind(this, 'sushi')} disabled={!this.props.visible}/>
            </label>
            <div className="item">
              <div className="keywords">
                <h4><span className="icon ion-ios7-bolt"></span> Keywords</h4>
                <div className="list">
                  {keywords}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
});

module.exports = ProfileEditScreen;