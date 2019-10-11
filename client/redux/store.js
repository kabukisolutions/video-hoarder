import { applyMiddleware, compose, createStore } from 'redux';
import reducers from './reducers';
import { socketMiddleware } from '../net';
import thunk from 'redux-thunk';

let store;

/**
 * @returns {Store} -
 */
const getStore = () => {
  if (!store) {
    const composeArgs = [
      applyMiddleware(thunk, socketMiddleware),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    ];

    store = compose(...composeArgs)(createStore)(reducers);
  }

  return store;
}

export default getStore;
