class MockElectronForgeStart {
  constructor() {
    this.calls = [];
    this.default = this.default.bind(this);
  }

  default() {
    return new Promise((resolve) => {
      resolve();
    });
  }
}

module.exports = MockElectronForgeStart;
