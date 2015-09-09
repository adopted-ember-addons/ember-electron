'use strict';

module.exports = function () {
    switch (process.platform) {
    case 'darwin':
        return process.arch === 'x64' ? 'osx64' : 'osx32';

    case 'win32':
        return (process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) ? 'win64' : 'win32';

    case 'linux':
        return process.arch === 'x64' ? 'linux64' : 'linux32';
    }
};