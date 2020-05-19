import * as db from './db/index.js';
import { emit } from './event-bus.js';
import { Event } from '../Event.js';
import { getLogger } from '../logger.js';
import express from 'express';

const rootLogger = getLogger('api');
const { Router } = express;

const ensureLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).send('NOT AUTHORIZED');
}

/**
 * @func
 * @param {Request} req 
 * @param {Response} res 
 */
export const getJobs = async (req, res, next) => {
  const logger = getLogger('getJobs', rootLogger);
  // @todo avoid dupes.
  try {
    const {
      query = {},
      pagination = {},
      sort,
    } = req.body;
    const { userName } = req.user;
    const cursor = await db.getJobsForUser(userName, query);
    if (sort) {
      logger.debug(sort);
      await db.sort(cursor, sort);
    }

    if (pagination) {
      logger.debug(pagination);
      const {
        skip,
        limit,
      } = pagination;

      if (skip) {
        await db.skip(cursor, skip);
      }

      if (limit) {
        await db.limit(cursor, limit);
      }
    }

    const count = await db.count(cursor);
    const data = await db.toArray(cursor);
    const responseData = {
      count,
      data,
    };
    logger.debug('send 200', responseData);
    res.status(200).send(responseData);
  } catch(err) {
    res.status(500);
    next(err);
  }
};

/**
 * @func
 * @param {Request} req
 * @param {Response} res
 */
export const addJob = async (req, res, next) => {
  const logger = getLogger('addJob', rootLogger);
  try {
    const { userName: addedBy } = req.user;
    const { url } = req.body;
    logger.debug('Adding new job', url);
    const newJob = await db.addJob({ url, userName: addedBy });
    // We emit an event (which will eventually be emitted on the socket) so that ALL Clients know a new item has been added.
    emit(Event.ItemAdded, newJob);
    logger.debug('send 200');
    res.status(200).send('OK');
  } catch (err) {
    res.status(500);
    next(err);
  }
};

export const getProfile = (req, res) => {
  const logger = getLogger('getProfile', rootLogger);
  logger.debug('getProfile', req.user, req.isAuthenticated());
  res.json(req.user);
};

export const logout = (req, res) => {
  const logger = getLogger('logout', rootLogger);
  logger.debug('logout');
  req.logout();
  res.status(200).send('OK');
};

export const login = (req, res) => {
  const logger = getLogger('login', rootLogger);
  logger.debug('login');
  res.json(req.user);
};

export const getRouter = (passport) => {
  const router = new Router();
  router.get('/jobs', ensureLoggedIn, getJobs);
  router.post('/job/add', ensureLoggedIn, addJob);
  router.get('/user/me', ensureLoggedIn, getProfile);
  router.post('/user/logout', logout);
  router.post('/user/login', passport.authenticate('local'), login);
  return router;
}