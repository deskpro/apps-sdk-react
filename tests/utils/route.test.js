import Route from '../../src/utils/route';
import * as types from '../../src/actions/actionTypes';

test('Route creates location and param properties', () => {
  const dispatch = jest.fn();
  const data     = {
    location: 'testing',
    params:   { id: 1 }
  };
  const route = new Route(dispatch, data);

  expect(route.location).toEqual(data.location);
  expect(route.params).toEqual(data.params);
});

test('Route dispatches a location', () => {
  const dispatch = jest.fn();
  const data     = {
    location: 'testing',
    params:   {}
  };
  const route = new Route(dispatch, data);
  route.to('testing2');

  expect(dispatch).toBeCalledWith({
    type:     types.SDK_TO_ROUTE,
    location: 'testing2',
    params:   {}
  });
});

test('Route triggers events', () => {
  const dispatch = jest.fn();
  const data     = {
    location: 'testing',
    params:   {}
  };
  const route = new Route(dispatch, data);

  const cb = jest.fn();
  route.on('to', cb);
  route.to('testing2');
  route.to('testing3');

  expect(cb).toHaveBeenCalledTimes(2);

  route.off('to', cb);
  route.to('testing4');

  expect(cb).toHaveBeenCalledTimes(2);
});
