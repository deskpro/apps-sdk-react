import React from 'react';
import PropTypes from 'prop-types';
import { propKeyFilter } from '../utils/props';

/**
 * A button which dispatches to a route location when clicked.
 *
 * Example:
 *
 * ```jsx
 * render() {
 *  return (
 *    <div>
 *      <LinkButton to="index">Index Page</LinkButton>
 *    </div>
 *  );
 * }
 * ```
 */
class LinkButton extends React.Component {
  static propTypes = {
    /**
     * Route that will be dispatched when the button is clicked.
     */
    to: PropTypes.string,

    /**
     * Params passed with the route.
     */
    params: PropTypes.object,

    /**
     * Children rendered into the button.
     */
    children: PropTypes.node,

    /**
     * Called when the button is clicked.
     */
    onClick: PropTypes.func
  };

  /**
   * Specifies the default values for props
   */
  static defaultProps = {
    to:       '',
    params:   {},
    children: '',
    onClick:  () => {}
  };

  /**
   * Context values the child wants passed down from the parent
   */
  static contextTypes = {
    route: PropTypes.object
  };

  /**
   * Called when the button is clicked
   *
   * Dispatches to the 'to' route unless the default is prevented.
   *
   * @param {Event} e
   */
  handleClick = (e) => {
    this.props.onClick(e);
    if (!e.defaultPrevented) {
      e.preventDefault();
      this.context.route.to(this.props.to, this.props.params);
    }
  };

  /**
   * @returns {XML}
   */
  render() {
    const { children, ...props } = this.props;

    return (
      <button
        className="dp-button dp-button--l dp-button--primary"
        {...propKeyFilter(props, LinkButton.propTypes)}
        onClick={this.handleClick}
      >
        {children}
      </button>
    );
  }
}

export default LinkButton;
