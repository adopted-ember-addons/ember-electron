//
// This allows testem to extract the ID of this run so it can communicate with
// the testem server (the query param is added to the test URL by
// test-runner.js)
//
window.getTestemId = function() {
  // FIXME: It should be safe to replace "\?" with "?" below due to context -- need to check though
  // eslint-disable-next-line no-useless-escape
  let match = window.location.search.match(/[\?&]testemId=([^\?&]+)/);

  return match ? match[1] : null;
};
