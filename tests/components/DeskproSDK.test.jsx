import React from 'react';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk'

import { UIConstants } from '@deskpro/apps-sdk-core';

import initialState from '../../src/store/initialState';
import DeskproSDK from '../../src/components/DeskproSDK';

const middlewares = [thunk] // add your middlewares like `redux-thunk`
const mockStore = configureMockStore(middlewares);
const dpapp = {
  context: {},
  on:      () => {},
  off:      () => {},
  oauth:   {},
  ui:      {
    badgeCount: 5,
    badge: UIConstants.VISIBILITY_VISIBLE,
    isCollapsed: () => true
  },
  restApi: {
    get: () => Promise.resolve()
  },
  manifest: {
    storage: [],
    title: 'My app'
  }
};

const actions = {
  bootstrap: () => Promise.resolve({}),
  ready: () => {},
  refreshing: () => {},
};

it('DeskproSDK renders the wrapped component', () => {
  const App = () => <div>App</div>;
  const store = mockStore(initialState);
  const renderedValue = renderer.create(
    <DeskproSDK dpapp={dpapp} store={store} actions={actions}>
      <App />
    </DeskproSDK>
  ).toJSON();

  expect(renderedValue).toMatchSnapshot();
});

it('DeskproSDK renders the prop component', () => {
  const App = () => <div>App</div>;
  const store = mockStore(initialState);
  const renderedValue = renderer.create(
    <DeskproSDK dpapp={dpapp} store={store} actions={actions} component={App} />
  ).toJSON();

  expect(renderedValue).toMatchSnapshot();
});
