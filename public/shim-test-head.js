//
// testem looks for a function called getTestemId, and if present, uses it to
// determine the ID of this test run so it can communicate back to the testem
// server -- see https://github.com/testem/testem/commit/4a51acc2fc0c3a23273fea838fd166b4691c2300.
//
// The testemId query param is added to the test URL by test-runner.js.
//
window.getTestemId = function () {
  let match = window.location.search.match(/[?&]testemId=([^?&]+)/);
  return match ? match[1] : null;
};
