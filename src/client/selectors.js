/** @module client/selectors */

/**
 * @function
 * @param {module:client/redux.State} state
 * @returns {User}
 */
export const getUser = state => state.user;

/**
 * @function
 * @param {module:client/redux.State} state
 * @returns {boolean}
 */
export const isLoggedIn = state => !!getUser(state).loggedIn;
