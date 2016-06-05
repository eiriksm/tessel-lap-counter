'use strict';
var config = require('./config');
var tessel = require('tessel');
var ws = require('nodejs-websocket');
var ambientlib = require('ambient-attx4');
var ambient = ambientlib.use(tessel.port[config.tesselPort]);

function logger() {
  console.log.apply(console, arguments);
}

// The level of sound the lap counter makes.
var level = 0.07;
// Such clever use of connection state globally.
var connection = false;

ambient.on('ready', function () {
  logger('ambient ready');
  ambient.setSoundTrigger(level);
  ambient.on('sound-trigger', function() {
    if (connection === false) {
      logger('Not ready to send');
      return;
    }
    if (connection && connection.readyState === connection.OPEN) {
      logger('sending data');
      connection.send('lap');
    }

    // Clear it.
    ambient.clearSoundTrigger();

    // After .5 seconds reset sound trigger.
    setTimeout(function () {
      ambient.setSoundTrigger(level);
    }, 1500);
  });
});

function tryToWs() {
  if (connection === false) {
    connection = undefined;
    connection = ws.connect('ws://' + config.ip + ':' + config.port, function(e) {
      if (!e) {
        logger('This looks OK!');
      }
    });
    connection.on('error', function(e) {
      logger('error in ws', e);
      setTimeout(tryToWs, 3000);
      connection = false;
    });
  }
  else {
    logger('Trying to ws when ws is false');
  }
}
logger('Starting, trying to connect');
tryToWs();
