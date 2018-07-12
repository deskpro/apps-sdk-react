import PropTypes from 'prop-types';

const { shape, object, string, func, number, bool, array } = PropTypes;

/**
 * Defines the prop type for dpapp
 */
export const dpappPropType = shape({
  properties:  object,
  environment: string,
  settings:    array,
  context:     object,
  ui:          object,
  restApi:     object,
  storage:     object,
  oauth:       object,
  appId:       string,
  appTitle:    string,
  packageName: string,
  instanceId:  string,
  refresh:     func,
  unload:      func
});

/**
 * Defines the prop type for dpapp.ui
 */
export const uiPropType = shape({
  error:          func,
  collapse:       func,
  expand:         func,
  hide:           func,
  show:           func,
  hideBadgeCount: func,
  showBadgeCount: func,
  hideLoading:    func,
  showLoading:    func,
  hideMenu:       func,
  showMenu:       func,
  isCollapsed:    func,
  isExpanded:     func,
  isHidden:       func,
  isLoading:      func,
  isReady:        func,
  isVisible:      func
});

/**
 * Defines the storage prop type
 */
export const storagePropType = shape({
  app:       object,
  entity:    object,
  getApp:    func,
  setApp:    func,
  getEntity: func,
  setEntity: func
});

/**
 * Defines the Redux store prop type
 */
export const storePropType = shape({
  getState:       func,
  dispatch:       func,
  subscribe:      func,
  replaceReducer: func
});

/**
 * Defines the "me" prop type
 */
export const mePropType = shape({
  id:              number,
  avatar:          object,
  can_admin:       bool,
  can_agent:       bool,
  can_billing:     bool,
  is_agent:        bool,
  is_confirmed:    bool,
  is_contact:      bool,
  is_deleted:      bool,
  is_disabled:     bool,
  is_user:         bool,
  was_agent:       bool,
  online:          bool,
  labels:          array,
  teams:           array,
  phone_numbers:   array,
  date_created:    string,
  date_last_login: string,
  name:            string,
  display_name:    string,
  first_name:      string,
  last_name:       string,
  primary_email:   object,
  emails:          array,
  gravatar_url:    string,
  tickets_count:   number,
  timezone:        string
});

/**
 * Performs a key comparison between two objects, deleting from the first where
 * the keys exist in the second
 *
 * Can be used to remove unwanted component prop values. For example:
 *
 * ```jsx
 * render() {
 *   const { children, className, ...props } = this.props;
 *
 *    return (
 *      <div
 *        {...propKeyFilter(props, Item.propTypes)}
 *        className={classNames('dp-item', className)}
 *       >
 *        {children}
 *      </div>
 *    )
 * }
 * ```
 *
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {*}
 */
export function propKeyFilter(obj1, obj2) {
  const obj2Keys = Object.keys(obj2);
  const newProps = Object.assign({}, obj1);
  Object.keys(newProps)
    .filter(key => obj2Keys.indexOf(key) !== -1)
    .forEach(key => delete newProps[key]);

  return newProps;
}
