'use strict';

const RSVP = require('rsvp');

function MockNWBuilder(options) {
    this.options = options;
}

module.exports = MockElectronBuilder;

MockElectronBuilder.prototype.on = function() {
};

MockElectronBuilder.prototype.build = function() {
  return RSVP.resolve(this.options);
};
