const MockElectronForgeHandle = require('./ef-handle');

class MockElectronForgeStart {
  constructor() {
    this.calls = [];
    this.handle = new MockElectronForgeHandle();
    this.default = this.default.bind(this);
  }

  default() {
    this.calls.push({ arguments });

    return new Promise((resolve) => {
      resolve(this.handle);
    });
  }
}

module.exports = MockElectronForgeStart;
