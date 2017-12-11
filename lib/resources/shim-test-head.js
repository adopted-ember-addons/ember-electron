//
// This allows testem to extract the ID of this run so it can communicate with
// the testem server (the query param is added to the test URL by
// test-runner.js)
//
window.getTestemId = function() {
  let match = window.location.search.match(/[\?&]testemId=([^\?&]+)/);

  return match ? match[1] : null;
};
