(function (window) {
    // Exit immediately if we're not running in Electron
    if (!window.ELECTRON) {
        return;
    }

    function setQUnitAdapter(serverURL) {
        var socket = io(serverURL);

        socket.on('connect', function () {
            // connected to testem server
            socket.emit('browser-login', 'Electron', '1');
        });

        socket.on('start-tests', function () {
            // testem indicated we should re-run
            socket.disconnect();
            window.location.reload();
        });

        qunitAdapter(socket);
    }

    // Adapted from Testem's default qunit-adapter.
    function qunitAdapter(socket) {
        var currentTest, currentModule;

        var id = 1;

        var results = {
            failed: 0,
            passed: 0,
            total: 0,
            tests: []
        };

        QUnit.log(function (details) {
            var item = {
                passed: details.result,
                message: details.message
            }

            if (!details.result) {
                item.actual = details.actual;
                item.expected = details.expected;
            }

            currentTest.items.push(item);
        });

        QUnit.testStart(function (details) {
            currentTest = {
                id: id++,
                name: (currentModule ? currentModule + ': ' : '') + details.name,
                items: []
            };
            socket.emit('tests-start');
        });

        QUnit.testDone(function (details) {
            currentTest.failed = details.failed;
            currentTest.passed = details.passed;
            currentTest.total = details.total;

            results.total++;

            if (currentTest.failed > 0) {
                results.failed++;
            } else {
                results.passed++;
            }

            results.tests.push(currentTest);
            socket.emit('test-result', currentTest);
        });

        QUnit.moduleStart(function (details) {
            currentModule = details.name;
        });

        QUnit.done(function (details) {
            results.runDuration = details.runtime;
            socket.emit('all-test-results', results);
        });
    }

    window.addEventListener('load', function () {
        setQUnitAdapter(process.env.ELECTRON_TESTEM_SERVER_URL);
    });
}(this));