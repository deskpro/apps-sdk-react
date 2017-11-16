import { createAppFromProps } from '@deskpro/apps-sdk-core';
import initialState from '../store/initialState';
import configureStore from '../store/configureStore';

const contextProps = {
  type:       'ticket',
  entityId:   '1',
  locationId: 'ticket-sidebar',
  tabId:      'tab-id',
  tabUrl:     'http://127.0.0.1'
};

const instanceProps = {
  appId:          '1',
  instanceId:     '1',
  appTitle:       'App',
  appPackageName: 'app'
};

export const testDpapp = createAppFromProps({ contextProps, instanceProps });
testDpapp.manifest = {
  storage: []
};

const state = Object.assign({}, initialState);
state.sdk.ready = true;
export const testStore = configureStore(testDpapp, [], {}, state);
