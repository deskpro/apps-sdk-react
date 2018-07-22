import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AppEvents, UIEvents, UIConstants } from '@deskpro/apps-sdk-core';
import { AppFrame, Action } from '@deskpro/apps-components';


import { dpappPropType, storePropType } from '../utils/props';
import * as sdkActions from '../actions/sdkActions';
import { sdkProps } from '../utils/connect';
import Route from '../utils/route';
import Loader from './Loader';

/**
 * Connects DeskPRO apps to the DeskPRO API
 *
 * Provides SDK props to a wrapped component. The props provide information about the app
 * and have methods which communicate with the API.
 *
 * Example:
 *
 * ```jsx
 * import ReactDOM from 'react-dom';
 * import { DeskproSDK, configureStore } from 'deskpro-sdk-react';
 * import App from './App';
 *
 * export function runApp(dpapp) {
 *  const store = configureStore(dpapp);
 *
 *  ReactDOM.render(
 *    <DeskproSDK dpapp={dpapp} store={store}>
 *      <App />
 *    </DeskproSDK>,
 *    document.getElementById('deskpro-app')
 *  );
 * }
 * ```
 */
class DeskproSDK extends React.Component {

  static propTypes = {
    /**
     * Instance of sdk-core.
     */
    dpapp: dpappPropType.isRequired,

    /**
     * Instance of the redux store.
     */
    store: storePropType.isRequired,

    /**
     * The sdk values stored in the store.
     */
    sdk: PropTypes.object.isRequired,

    /**
     * Bound action creators.
     */
    actions: PropTypes.object.isRequired,

    /**
     * Sets the initial ready state. Only used for testing.
     */
    ready: PropTypes.bool,

    /**
     * The app component.
     */
    component: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),

    /**
     * The app component.
     */
    children: PropTypes.element
  };

  /**
   * Specifies the default values for props
   */
  static defaultProps = {
    component: null,
    children:  null,
    ready:     false
  };

  /**
   * Context values passed down to children that declare contextTypes
   */
  static childContextTypes = {

    dpapp: dpappPropType,

    store: storePropType,

    route: PropTypes.object
  };

  state = {

    uiChangeRequests: 0

  };

  /**
   * @returns {{dpapp: *}}
   */
  getChildContext = () => {
    const { dpapp, store } = this.props;

    return {
      route: new Route(store.dispatch, store.getState().sdk.route),
      store,
      dpapp
    };
  };

  /**
   * Bootstraps the application
   */
  componentDidMount = () => {
    const { dpapp } = this.props;

    dpapp.on(AppEvents.EVENT_REFRESH, this.handleRefresh);
    dpapp.on(UIEvents.EVENT_UI_DISPLAYCHANGED, this.handleDisplayChange);
    dpapp.on(UIEvents.EVENT_BADGE_COUNTCHANGED, this.handleDisplayChange);
    dpapp.on(UIEvents.EVENT_BADGE_VISIBILITYCHANGED, this.handleDisplayChange);

    this.bootstrap();
  };

  /**
   * Triggered before the component is unmounted
   */
  componentWillUnmount = () => {
    const { dpapp } = this.props;

    dpapp.off(AppEvents.EVENT_REFRESH, this.handleRefresh);
    dpapp.off(UIEvents.EVENT_UI_DISPLAYCHANGED, this.handleDisplayChange);
    dpapp.off(UIEvents.EVENT_BADGE_COUNTCHANGED, this.handleDisplayChange);
    dpapp.off(UIEvents.EVENT_BADGE_VISIBILITYCHANGED, this.handleDisplayChange);
  };

  /**
   * Bootstraps the app component
   *
   * @returns {Promise}
   */
  bootstrap = () => {
    const { actions, ready } = this.props;

    actions.ready(ready);
    return actions.bootstrap()
      .then(() => {
        return actions.ready();
      })
      .catch((error) => {
        return actions.error(error);
      });
  };

  /**
   * Callback for the AppEvents.EVENT_REFRESH event
   */
  handleRefresh = () => {
    const { actions } = this.props;

    actions.refreshing(true);
    return actions.bootstrap()
      .catch((error) => {
        return actions.error(error);
      })
      .then(() => actions.refreshing(false));
  };

  handleDisplayChange = () => {
    // force a re-render
    this.setState({
      uiChangeRequests: this.state.uiChangeRequests++
    });
  };

  /**
   * Renders SDK errors as alerts
   *
   * @returns {Array}
   */
  renderErrors = () => {
    const { sdk, actions } = this.props;

    return sdk.errors.map(error => (
      <div key={error.id} className="dp-alert dp-alert--danger dp-bg--danger" style={{ margin: 10 }}>
        <div className="dp-alert__content">
          {error.msg}
        </div>
        <div
          title="Close"
          className="fa fa-close dp-alert__close"
          onClick={() => actions.clearError(error.id)}
        />
      </div>
    ));
  };

  /**
   * Renders the loading animation
   *
   * @returns {XML}
   */
  renderLoading = () => {
    return (
      <div className="dp-text-center">
        <Loader />
      </div>
    );
  };

  /**
   * Renders the main app component
   *
   * @returns {XML}
   */
  renderApp = () => {
    const { sdk, component, children } = this.props;

    if (!component && !children) {
      throw new Error('App component not set.');
    }

    if (component && children) {
      throw new Error('You can have either the App as a property or as a child');
    }

    const appProps = sdkProps(this.props);

    return component
      ? React.createElement(component, appProps)
      : React.cloneElement(React.Children.only(children), appProps)
    ;

    // return (
    //   <div>
    //     {sdk.ui.loading && this.renderLoading()}
    //     <div style={{ display: (sdk.ui.loading ? 'none' : 'block') }}>
    //       {component
    //         ? React.createElement(component, appProps)
    //         : React.cloneElement(React.Children.only(children), appProps)
    //       }
    //     </div>
    //   </div>
    // );
  };

  /**
   * @returns {XML}
   */
  render() {
    const { sdk, dpapp }  = this.props;

    return (
      <AppFrame
        badgeText=  { dpapp.ui.badge === UIConstants.VISIBILITY_VISIBLE ? dpapp.ui.badgeCount : null }
        display=    { dpapp.ui.isCollapsed() ? 'collapsed' : 'expanded'  }
        title=      { dpapp.manifest.title }
        iconUrl=    {"../assets/icon.png"}
        actions=    {[
          <Action icon='refresh' onClick={dpapp.refresh} /> ,
          <Action icon={ dpapp.ui.isCollapsed() ? 'down' : 'up'  } onClick={ dpapp.ui.isCollapsed() ? dpapp.ui.expand : dpapp.ui.collapse } />
        ]}
      >
        {this.renderErrors()}
        {!sdk.readyForApp
          ? this.renderLoading()
          : this.renderApp()
        }
      </AppFrame>
    );
  }
}

/**
 * Maps redux state to component props
 *
 * @param {*} state
 * @param {{ sdk: * }} ownProps
 * @returns {{sdk: *}}
 */
function mapStateToProps(state, ownProps) {

  if (ownProps && ownProps.sdk) {
    return {}
  }

  return {
    sdk: Object.assign({}, state.sdk)
  };
}

/**
 * Maps action creators to component props
 *
 * @param {object} dispatch
 * @param {{ actions: * }} ownProps
 * @returns {{actions: *}}
 */
function mapDispatchToProps(dispatch, ownProps) {

  if (ownProps && ownProps.actions) {
    return {};
  }

  return {
    actions: bindActionCreators(sdkActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeskproSDK);
