class MockElectronForgeHandle {
  constructor() {
    this.handles = {};
    this.exitImmediately = true;
  }

  trigger(method = '') {
    if (this.handles[method]) {
      this.handles[method]();
    }
  }

  on(handle, method) {
    this.handles[handle] = method;

    if (this.exitImmediately && handle === 'exit') {
      method();
    }
  }
}

module.exports = MockElectronForgeHandle;
