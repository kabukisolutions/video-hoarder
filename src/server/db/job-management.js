import { Event } from "../../Event.js";
import { getLogger } from "../../logger.js";
import { makeItem } from "../../model/Item.js";
import { Status } from "../../Status.js";
import { emit } from "../event-bus.js";
import { find, findOne, getJobsCollection,insert, remove, update } from "./util.js";

const rootLogger = getLogger("job-management");

/**
 * This will emit 'ItemAdded' event.
 * @func
 * @memberof module:server/db
 * @param {Object} args -
 * @param {string} args.url - url to be downloaded
 * @param {string} args.addedBy - userName of the user adding this task.
 * @returns {Promise<Item>}
 */
export const addJob = async ({ url, addedBy }) => {
  const item = makeItem({ url, addedBy });
  const jobs = await getJobsCollection()
  const newJob = await insert(jobs, item, { w: 1 });
  emit(Event.ItemAdded, newJob);
  return newJob;
};

/**
 * @func
 * @memberof module:server/db
 * @param {string} id
 * @returns {Promise<Item>}
 */
export const getJob = async (id) => {
  const jobs = await getJobsCollection()
  return findOne(jobs, { id });
}

/**
 * This will emit 'ItemUpdated' event.
 * @func
 * @memberof module:server/db
 * @param {Object} args
 * @param {string} args.id
 * @param {string} args.updatedBy
 * @returns {Promise<Item>}
 */
export const cancelJob = async ({ id, updatedBy }) => {
  const logger = getLogger("cancelJob", rootLogger);
  const item = await getJob(id);
  /* istanbul ignore else */
  if (item) {
    item.status = Status.Failed;
    item.updatedAt = new Date().toISOString();
    item.updatedBy = updatedBy;
    const jobs = await getJobsCollection()
    const [numUpdatedRecords, opStatus] = await update(jobs, { id }, item);
    /* istanbul ignore else */
    if (numUpdatedRecords === 1) {
      emit(Event.ItemUpdated, item);
      return item;
    } else {
      logger.error("Something went wrong in the update", {
        numUpdatedRecords,
        opStatus,
      });
    }
  } else {
    logger.warn(`Job ${id} not found. Ignoring call.`);
  }
};

/**
 * This will emit 'ItemRemoved' event.
 * @func
 * @memberof module:server/db
 * @param {Object} args
 * @param {string} args.id
 * @returns {Promise}
 */
export const removeJob = async (id) => {
  const logger = getLogger("removeJob", rootLogger);
  const item = await getJob(id);
  /* istanbul ignore else */
  if (item) {
    const jobs = await getJobsCollection()
    const numRecordsRemoved = await remove(jobs, { id });
    /* istanbul ignore if */
    if (numRecordsRemoved !== 1) {
      logger.error("Something went wrong in remove()", {
        numUpdatedRecords: numRecordsRemoved,
      });
    }
    emit(Event.ItemRemoved, item);
    return numRecordsRemoved;
  } else {
    logger.warn(`Job ${id} not found. Ignoring call.`);
  }
}

/**
 * Find jobs added by this user filtered by this query.
 *
 * @func
 * @memberof module:server/db
 * @param {string} userName
 * @param {Query} [query]
 * @returns {Promise<Cursor[]>}
 */
export const getJobsForUser = async (userName, query = {}) => {
  const jobs = await getJobsCollection()
  return find(jobs, { ...query, addedBy: userName });
};
