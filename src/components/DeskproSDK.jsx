import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AppEvents, UIEvents } from '@deskpro/apps-sdk-core';
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

    this.bootstrap();
    dpapp.on(AppEvents.EVENT_REFRESH, this.handleRefresh);
    dpapp.on(UIEvents.EVENT_UI_DISPLAYCHANGED, this.handleDisplayChange);
  };

  /**
   * Triggered before the component is unmounted
   */
  componentWillUnmount = () => {
    const { dpapp } = this.props;

    dpapp.off(AppEvents.EVENT_REFRESH, this.handleRefresh);
    dpapp.off(UIEvents.EVENT_UI_DISPLAYCHANGED, this.handleDisplayChange);
  };

  /**
   * Bootstraps the app component
   *
   * @returns {Promise}
   */
  bootstrap = () => {
    const { actions, ready } = this.props;

    actions.ready(ready);
    return Promise.all([
      ...this.bootstrapMe(),
      ...this.bootstrapTabData(),
      ...this.bootstrapStorage()
    ])
      .then(() => {
        return actions.ready();
      })
      .catch((error) => {
        return actions.error(error);
      });
  };

  /**
   * Fetches the "me" data for the user
   *
   * @returns {Promise[]}
   */
  bootstrapMe = () => {
    const { dpapp, actions } = this.props;

    const promise = dpapp.restApi.get('/me')
      .then((resp) => {
        try {
          return Promise.resolve(actions.me(resp.body.data.person));
        } catch (e) {
          return Promise.resolve({});
        }
      });

    return [promise];
  };

  /**
   * Fetches the data for the active tab
   *
   * @returns {Promise[]}
   */
  bootstrapTabData = () => {
    const { dpapp, actions } = this.props;

    const promise = dpapp.context.hostUI.getTabData()
      .then((resp) => {
        try {
          return Promise.resolve(actions.tabData(resp.api_data));
        } catch (e) {
          return Promise.resolve({});
        }
      });

    return [promise];
  };

  /**
   * Fetches the manifest storage values
   *
   * @returns {Promise[]}
   */
  bootstrapStorage = () => {
    const { dpapp, actions } = this.props;

    const promises = [];
    let items = dpapp.manifest.storage || dpapp.manifest.state;
    if (dpapp.manifest.settings && dpapp.manifest.settings.length > 0) {
      items = items.concat(dpapp.manifest.settings);
    }

    if (items && items.length > 0) {
      const appKeys    = [];
      const entityKeys = [];
      const oauthKeys  = [];

      items.forEach((item) => {
        if (item.name.indexOf('oauth:') === 0) {
          oauthKeys.push(
            item.name.replace('oauth:', '')
          );
        } else if (item.name.indexOf('entity:') === 0) {
          entityKeys.push(
            item.name.replace('entity:', '')
          );
        } else {
          appKeys.push(
            item.name.replace('app:', '')
          );
        }
      });

      if (appKeys.length > 0) {
        promises.push(actions.appGetStorage(appKeys));
      }
      if (entityKeys.length > 0) {
        promises.push(actions.entityGetStorage(entityKeys));
      }
      oauthKeys.forEach((key) => {
        promises.push(actions.oauthGetSettings(key));
      });
    }

    return promises;
  };

  /**
   * Callback for the AppEvents.EVENT_REFRESH event
   */
  handleRefresh = () => {
    const { actions } = this.props;

    actions.refreshing(true);
    this.bootstrap()
      .catch((error) => {
        return actions.error(error);
      })
      .then(() => actions.refreshing(false));
  };

  /**
   * Callback for the UIEvents.EVENT_UI_DISPLAYCHANGED event
   */
  handleDisplayChange = () => {
    const { actions, sdk } = this.props;

    actions.collapsed(!sdk.ui.collapsed);
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

    return (
      <div>
        {sdk.ui.loading && this.renderLoading()}
        <div style={{ display: (sdk.ui.loading ? 'none' : 'block') }}>
          {component
            ? React.createElement(component, appProps)
            : React.cloneElement(React.Children.only(children), appProps)
          }
        </div>
      </div>
    );
  };

  /**
   * @returns {XML}
   */
  render() {
    const { sdk } = this.props;

    return (
      <ul className="dp-list dp-column-drawer-list">
        <li
          className="dp-column-drawer--with-controls"
          style={{ display: sdk.ui.collapsed ? 'none' : 'block' }}
        >
          {this.renderErrors()}
          {!sdk.readyForApp
            ? this.renderLoading()
            : this.renderApp()
          }
        </li>
      </ul>
    );
  }
}

/**
 * Maps redux state to component props
 *
 * @param {*} state
 * @returns {{sdk: *}}
 */
function mapStateToProps(state) {
  return {
    sdk: Object.assign({}, state.sdk)
  };
}

/**
 * Maps action creators to component props
 *
 * @param {object} dispatch
 * @returns {{actions: *}}
 */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(sdkActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeskproSDK);
