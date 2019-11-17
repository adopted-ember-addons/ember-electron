const MockElectronForgeHandle = require('./ef-handle');

class MockElectronForgeStart {
  constructor() {
    this.calls = [];
    this.handle = new MockElectronForgeHandle();
    this.api = {
      start: this.start.bind(this)
    };
  }

  start() {
    this.calls.push(arguments);

    return new Promise((resolve) => {
      resolve(this.handle);
    });
  }
}

module.exports = MockElectronForgeStart;
