const { homepage } = require('../../package.json');

const baseUrl = `${homepage}/docs/`;
const guidesUrl = `${baseUrl}guides/`;
const upgradingUrl = `${guidesUrl}upgrading`;
const ciUrl = `${guidesUrl}ci`;
const structureUrl = `${guidesUrl}structure`

module.exports = {
  upgradingUrl,
  ciUrl,
  structureUrl
};