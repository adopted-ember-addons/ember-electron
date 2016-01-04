(function (window) {
    // Exit immediately if we're not running in Electron
    if (!window.ELECTRON) {
        return;
    }

    // Log QUnit results to the console so they show up
    // in the `Electron` process output.
    function log(content) {
        var content = '[qunit-logger] ' + content;
        console.log(content);
        window.process.stdout.write(content);
    }

    function setQUnitAdapter() {
        var testCount = 0;

        QUnit.begin(function (details) {
            if (details.totalTests >= 1) {
                log('1..' + details.totalTests);
            }
        });

        QUnit.testDone(function (details) {
            testCount++;
            if (details.failed === 0) {
                log('ok ' + testCount + ' - ' + details.module + ' # ' + details.name);
            }
        });

        QUnit.log(function (details) {
            if (details.result !== true) {
                var actualTestCount = testCount + 1;
                log('# ' + JSON.stringify(details));
                log('not ok ' + actualTestCount + ' - ' + details.module + ' - ' + details.name);
            }
        });

        QUnit.done(function (details) {
            log('# done' + (details.failed === 0 ? '' : ' with errors'));
        });
    }

    window.addEventListener('load', setQUnitAdapter);
}(this));
