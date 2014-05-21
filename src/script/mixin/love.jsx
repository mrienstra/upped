/** @jsx React.DOM */

var loveMixin = {
  getInitialState: function(){
    return {
      pendingLoveChange: false,
      userLoves: this.props.userLoves
    };
  },
  propTypes: {
    id: React.PropTypes.string.isRequired,
    userLoves: React.PropTypes.bool.isRequired,
    refresh: React.PropTypes.func.isRequired
  },
  handleLove: function (e) {
    var that = this;

    e.stopPropagation();

    this.setState({
      pendingLoveChange: true,
      userLoves: !this.state.userLoves
    });

    this.props.handleLove(this.props.id, this.props.userLoves, this.props.refresh);
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      pendingLoveChange: false,
      userLoves: nextProps.userLoves
    });
  }
};

module.exports = loveMixin;