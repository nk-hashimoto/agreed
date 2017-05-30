'use strict';
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const agreed = require('agreed-core');
const app = express();

module.exports = (opts) => {
  if (!opts) {
    throw new Error('[agreed-server] option is required.');
  }

  if (!opts.path) {
    throw new Error('[agreed-server] option.path is required.');
  }

  const port = opts.port || 3000;
  const stat = opts.static;
  const staticPrefixPath = opts['static-prefix-path'] || opts.staticPrefixPath;

  app.use(bodyParser.json());
  if (stat) {
    if (staticPrefixPath) {
      app.use(staticPrefixPath, express.static(path.join(process.cwd(), stat)))
    } else {
      app.use(express.static(path.join(process.cwd(), stat)))
    }
  }

  if (opts.middlewares) {
    if (!Array.isArray(opts.middlewares)) {
      throw new Error('[agreed-server] option.middlewares must be an array.');
    }
    opts.middlewares.forEach((fn) => {
      app.use(fn);
    });
  }

  app.use(agreed.middleware(opts));

  const createServer = (appServer = app) => {
    appServer.use((err, req, res, next) => {
      res.statusCode = 500;
      res.send(`Error is occurred : ${err}`);
    });
    const server = appServer.listen(opts.port);
    if (opts.closeTime) {
      setTimeout(server.close, opts.closeTime);
    }
    return server;
  };
  return { 
    // low level
    app, 
    // high level
    createServer 
  };
};

