'use strict';
const requireDir = require('./helpers/require-dir');
const path = require('path');
const request = require('sonos-discovery/lib/helpers/request');
const logger = require('sonos-discovery/lib/helpers/logger');

function HttpAPI(discovery, settings) {

  const port = settings.port;
  const webroot = settings.webroot;
  const actions = {};

  this.getWebRoot = function () {
    return webroot;
  };

  this.getPort = function () {
    return port;
  };

  this.discovery = discovery;

  discovery.on('transport-state', function (player) {
    invokeWebhook('transport-state', player);
  });

  discovery.on('topology-change', function (topology) {
    invokeWebhook('topology-change', topology);
  });

  discovery.on('volume-change', function (volumeChange) {
    invokeWebhook('volume-change', volumeChange);
  });

  discovery.on('mute-change', function (muteChange) {
    invokeWebhook('mute-change', muteChange);
  });

  // this handles registering of all actions
  this.registerAction = function (action, handler) {
    actions[action] = handler;
  };

  //load modularized actions
  requireDir(path.join(__dirname, './actions'), (registerAction) => {
    registerAction(this);
  });

  this.requestHandler = function (req, res) { // This function is the entry point of the http server for sonos. 
    if (req.url === '/favicon.ico') { // We check that it's a favicon. 
      res.end();
      return;
    }

    if (discovery.zones.length === 0) { // We check that there is available sonos devices
      const msg = 'No system has yet been discovered. Please see https://github.com/jishi/node-sonos-http-api/issues/77 if it doesn\'t resolve itself in a few seconds.';
      logger.error(msg);
      sendResponse(500, { status: 'error', error: msg });
      return;
    }

    const params = req.url.substring(1).split('/'); // We get params into an array. 
    
    // parse decode player name considering decode errors
    let player;
    try {
      player = discovery.getPlayer(decodeURIComponent(params[0]));
    } catch (error) {
      logger.error(`Unable to parse supplied URI component (${params[0]})`, error);
      return sendResponse(500, { status: 'error', error: error.message, stack: error.stack });
    }

    const opt = {}; // opt is a dictionnary that will contains the different parts of the query
  
  
    if (player) {
      opt.action = (params[1] || '').toLowerCase(); // action : musicsearch
      logger.debug((params[1] || '').toLowerCase());
      opt.values = params.splice(2);  // We remove the first two elements of the params. 
      logger.debug(params.splice(2));
    } else {
      player = discovery.getAnyPlayer();
      opt.action = (params[0] || '').toLowerCase();
      opt.values = params.splice(1);
    }

    function sendResponse(code, body) {
      var jsonResponse = JSON.stringify(body);
      res.statusCode = code;
      res.setHeader('Content-Length', Buffer.byteLength(jsonResponse));
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      res.write(new Buffer(jsonResponse));
      res.end();
    }

    opt.player = player;
    handleAction(opt) // the handleAction will be responsible to parse the options dict and dispatch to correct methods
    .then((response) => {
      if (!response || response.constructor.name === 'IncomingMessage') {
        response = { status: 'success' };
      } else if (Array.isArray(response) && response.length > 0 && response[0].constructor.name === 'IncomingMessage') {
        response = { status: 'success' };
      }

      sendResponse(200, response);
    }).catch((error) => {
      logger.error(error);
      sendResponse(500, { status: 'error', error: error.message, stack: error.stack });
    });
  };


  function handleAction(options) {
    var player = options.player;

    if (!actions[options.action]) { // We check that the actions exist in the options. 
      return Promise.reject({ error: 'action \'' + options.action + '\' not found' });
    }

    logger.debug(`${options.values}`)
    return actions[options.action](player, options.values);  //  / ! \  / ! \  ANOTHER ENTRY POINT. METHOD DISPATCH HAPPENS HERE / ! \  / ! \  

  }

  function invokeWebhook(type, data) {
    var typeName = "type";
    var dataName = "data";
    if (!settings.webhook) return;

    if (settings.webhookType) { typeName = settings.webhookType; }
    if (settings.webhookData) { dataName = settings.webhookData; }

    const jsonBody = JSON.stringify({
      [typeName]: type,
      [dataName]: data
    });

    const body = new Buffer(jsonBody, 'utf8');

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': body.length
      }
    if (settings.webhookHeaderName && settings.webhookHeaderContents) {
      headers[settings.webhookHeaderName] = settings.webhookHeaderContents;
    }

    request({
      method: 'POST',
      uri: settings.webhook,
      headers: headers,
      body
    })
    .catch(function (err) {
      logger.error('Could not reach webhook endpoint', settings.webhook, 'for some reason. Verify that the receiving end is up and running.');
      logger.error(err);
    })
  }

}

module.exports = HttpAPI;
