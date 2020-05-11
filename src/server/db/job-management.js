import { getDb, stub, Collection, getCollection, insert } from './util.js';
import { Status } from '../../Status.js';

const {
  Jobs,
} = Collection;

/**
 * This will emit 'ItemAdded' event.
 * @func
 * @memberof module:server/db
 * @param {Item} item - An item object complete with ID etc. created by the server API from client supplied partial information.
 * @returns {Promise}
 */
export const addJob = async (item) => {
  const jobs = await getCollection(getDb(), Jobs);
  return insert(jobs, {
    ...item,
    status: Status.Pending,
  });
};

/**
 * This will emit 'ItemUpdated' event.
 * @func
 * @memberof module:server/db
 * @param {string} itemId
 * @returns {Promise}
 */
export const cancelJob = stub('cancelTask');

/**
 * This will emit 'ItemRemoved' event.
 * @func
 * @memberof module:server/db
 * @param {string} itemId
 * @returns {Promise}
 */
export const removeJob = stub('removeTask');

/**
 * @func
 * @memberof module:server/db
 * @param {string} itemId
 * @returns {Promise<Item>}
 */
export const getJob = stub('getTask');

/**
 * @func
 * @memberof module:server/db
 * @param {string} userName
 * @returns {Promise<Item[]>}
 */
export const getJobsForUser = stub('getTasksForUser');
