/* https://github.com/Khan/react-components/blob/99eaa065f4/js/set-interval-mixin.jsx */
/* This mixin provides a simple setInterval method.
 *
 * Example:
 *
 *     var Component = React.createClass({
 *         ...
 *         componentDidMount: function() {
 *             this.setInterval(this.doSomething, 1000);
 *             this.setInterval(this.doSomethingElse, 5000);
 *         }
 *         ...
 *     });
 *
 * doSomething is called every second and doSomethingElse is called every five
 * seconds. Their intervals will be canceled automatically when the component
 * unmounts.
 */
var SetIntervalMixin = {
    componentWillMount: function() {
        this.intervals = [];
    },
    setInterval: function(fn, ms) {
        this.intervals.push(setInterval(fn, ms));
    },
    componentWillUnmount: function() {
        this.intervals.forEach(clearInterval);
    }
};

module.exports = SetIntervalMixin;
