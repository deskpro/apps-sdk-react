import { toRoute } from '../actions/sdkActions';

export default class Route {
  /**
   * Constructor
   *
   * @param {Function} dispatch
   * @param {*} route
   */
  constructor(dispatch, route) {
    this.events   = {};
    this.dispatch = dispatch;
    this.setValues(route);
  }

  /**
   * @param {*} values
   */
  setValues = (values) => {
    const routeValues = Object.assign({}, values);
    Object.keys(routeValues).forEach((key) => {
      Object.defineProperty(this, key, {
        value:        values[key],
        configurable: false,
        writable:     false
      });
    });
  };

  /**
   *
   * @param {string} location
   * @param {*} params
   */
  to = (location, params = {}) => {
    this.trigger('to');
    this.dispatch(toRoute(location, params));
  };

  /**
   * Registers an event callback
   *
   * @param {string} event
   * @param {Function} cb
   */
  on = (event, cb) => {
    if (this.events[event] === undefined) {
      this.events[event] = [];
    }
    this.events[event].push(cb);
  };

  /**
   * Removes an event callback
   *
   * @param {string} event
   * @param {Function} cb
   */
  off = (event, cb) => {
    if (this.events[event] !== undefined) {
      const i = this.events[event].indexOf(cb);
      if (i > -1) {
        this.events[event].splice(i, 1);
      }
    }
  };

  /**
   * Triggers an event
   *
   * @param {string} event
   */
  trigger = (event) => {
    if (this.events[event] !== undefined) {
      for (let i = 0; i < this.events[event].length; i++) {
        this.events[event][i].call(this, this);
      }
    }
  };
}
