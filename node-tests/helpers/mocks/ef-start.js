const MockElectronForgeHandle = require('./ef-handle');

class MockElectronForgeStart {
  constructor() {
    this.calls = [];
    this.handle = new MockElectronForgeHandle();
    this.default = this.default.bind(this);
  }

  default() {
    return new Promise((resolve) => {
      this.calls.push({ arguments });

      resolve(this.handle);
    });
  }
}

module.exports = MockElectronForgeStart;
