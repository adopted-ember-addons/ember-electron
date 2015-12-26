'use strict';

var path        = require('path');
var mockery     = require('mockery');
var expect      = require('../../helpers/expect');

describe('The command to start Electron', function() {
    var fixturePath;

    before(function() {
        fixturePath = path.resolve(__dirname, '..', '..', 'fixtures');
    });

    describe('when the `electron-prebuilt` npm package is installed', function() {
        before(function() {
            mockery.enable({
                useCleanCache: true,
                warnOnUnregistered: false
            });
        });

        after(function() {
            mockery.disable();
        });

        describe('and the platform is Mac', function() {
            var findElectron;

            before(function() {
                mockery.registerMock('os', {
                    platform: function() {
                        return 'darwin';
                    }
                });

                findElectron = require('../../../lib/helpers/find-electron');
            });

            after(function() {
                mockery.deregisterMock('os');
                mockery.resetCache();
            });

            it('should be `node_modules/electron-prebuilt/dist/Electron.app/Contents/MacOS/Electron`', function() {
                var project = {
                    root: path.join(fixturePath, 'project-darwin')
                };

                var electron = findElectron(project);
                var expectedElectron = ['node_modules', 'electron-prebuilt', 'dist', 'Electron.app', 'Contents', 'MacOS', 'Electron'].join(path.sep);

                expect(electron).to.contain(expectedElectron);
            });
        });

        describe('and the platform is Windows', function() {
            var findElectron;

            before(function() {
                mockery.registerMock('os', {
                    platform: function() {
                        return 'win32';
                    }
                });

                findElectron = require('../../../lib/helpers/find-electron');
            });

            after(function() {
                mockery.deregisterMock('os');
                mockery.resetCache();
            });

            it('should be `node_modules/electron/electronjs/electron.exe`', function() {
                var project = {
                    root: path.join(fixturePath, 'project-win32')
                };

                var electron = findElectron(project);
                var expectedElectron = ['node_modules', 'electron-prebuilt', 'dist', 'electron.exe'].join(path.sep);

                expect(electron).to.contain(expectedElectron);
            });
        });

        describe('and the platform is not Mac or Windows (aka Linux)', function() {
            var findElectron;

            before(function() {
                mockery.registerMock('os', {
                    platform: function() {
                        return 'linux';
                    }
                });

                findElectron = require('../../../lib/helpers/find-electron');
            });

            after(function() {
                mockery.deregisterMock('os');
                mockery.resetCache();
            });

            it('should be `node_modules/electron-prebuilt/dist/electron`', function() {
                var project = {
                    root: path.join(fixturePath, 'project-linux')
                };

                var electron = findElectron(project);
                var expectedElectron = ['node_modules', 'electron-prebuilt', 'dist', 'electron'].join(path.sep);

                expect(electron).to.contain(expectedElectron);
            });
        });
    });

    describe('when the `electron-prebuilt` npm package is not installed', function() {
        var findElectron, _envElectron;

        before(function() {
            findElectron = require('../../../lib/helpers/find-electron');
        });

        beforeEach(function() {
            _envElectron = process.env.ELECTRON_PATH;
        });

        afterEach(function() {
            process.env.ELECTRON_PATH = _envElectron;
        });

        describe('and the `ELECTRON_PATH` environment variable is set', function() {
            it('should be the value of `ELECTRON_PATH`', function() {
                var project = {
                    root: path.join(fixturePath, 'project-empty')
                };

                var envElectron = '/custom/path/to/nw';
                process.env.ELECTRON_PATH = envElectron;

                var nw = findElectron(project);
                expect(nw).to.equal(envElectron);
            });
        });

        describe('and the `ELECTRON_PATH` environment variable is not set', function() {
            it('should be `electron`', function() {
                var project = {
                    root: path.join(fixturePath, 'project-empty')
                };

                delete process.env.ELECTRON_PATH;

                var electron = findElectron(project);
                expect(electron).to.equal('Electron');
            });
        });
    });
});
