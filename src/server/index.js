/* @todo: support both http and https; make https optional */
/* @todo: base URL ()for working behing reverse proxy */
/** @module server */
import http from 'https';
import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { getPassport } from './getPassport.js';
import { initialize as initializeDB } from './db/index.js';  // oooh modules are soooo awesome! and even Node support them now. Mmmm hmmm.
import { getLogger } from '../logger.js';
import { bootstrapApp } from './socketio.js';
import MemoryStore from 'memorystore';
import cookieParser from 'cookie-parser';

const rootLogger = getLogger('server');

/**
 * Wraps the server starting logic inside a function for ease of testing (also because we don't
 * yet have top level async/await). This function is called automatically when NODE_ENV != test.
 * During testing, we explicitly call this function and set the single boolean param according to
 * which branch we are currently testing.
 *
 * @func
 * @param {boolean} startDevServer
 */
export const startServer = async (startDevServer) => {
  const secret = 'dogs for me please';
  const logger = getLogger('startServer', rootLogger);
  await initializeDB();
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));

  // Auth
  const sessionStore = new (MemoryStore(expressSession))({ checkPeriod: 24 * 60 * 60 * 10000 });
  app.use(cookieParser(secret));
  app.use(expressSession({
    cookie: { maxAge: 24 * 60 * 60 * 10000 },
    secret,
    store: sessionStore,
  }));
  const passport = getPassport();
  app.use(passport.initialize());
  app.use(passport.session());
  app.post('/getProfile', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).send('Not logged in');
    }
  });

  app.post('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  if (startDevServer) {
    const webpack = (await import('webpack')).default;
    const webpackDevMiddleware = (await import('webpack-dev-middleware')).default;
    const webpackConfig = (await import('../../webpack.config.cjs')).default;
    const compiler = webpack(webpackConfig);
    app.use(webpackDevMiddleware(compiler, {}));
    const webpackHotMiddleware = (await import('webpack-hot-middleware')).default;
    app.use(webpackHotMiddleware(compiler));
  } else {
    // In non-dev mode, we expect client files to already be present in /dist directory.
    // `npm run start` script is responsible for ensuring that.
    app.use(express.static('./dist'));
  }

  const serveIndex = (req, res) =>
    res.sendFile(
      path.resolve(process.cwd(), './dist/index.html'),
      err => err && res.status(500).send(err)
    );
  app.get('/*', serveIndex);

  app.post('/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });

  // https://gaboesquivel.com/blog/2014/node.js-https-and-ssl-certificate-for-development/
  /* istanbul ignore next */
  const options = process.env.NODE_ENV === 'test' ? {} : {
    key: await fs.promises.readFile(path.resolve(process.cwd(), `cert/vhoarder.key`)),
    cert: await fs.promises.readFile(path.resolve(process.cwd(), `cert/vhoarder.crt`)),
  };
  const server = http.createServer(options, app);
  bootstrapApp({ server, sessionStore, secret });
  const onServerStart = () => {
    /* istanbul ignore next because we are not testing whether this callback is called */
    logger.info('App listening on port 7200');
  };
  server.listen(7200, onServerStart);
};

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  startServer(process.env.NODE_ENV === 'development');
}
