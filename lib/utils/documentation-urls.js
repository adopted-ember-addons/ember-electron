const { homepage } = require('../../package.json');

const baseUrl = `${homepage}/docs/`;
const guidesUrl = `${baseUrl}guides/`;
const upgradingUrl = `${guidesUrl}upgrading`;
const ciUrl = `${guidesUrl}ci`;
const structureUrl = `${guidesUrl}structure`

const faqUrl = `${baseUrl}faq/`;
const routingAndAssetLoadingUrl = `${faqUrl}routing-and-asset-loading`

module.exports = {
  upgradingUrl,
  ciUrl,
  structureUrl,
  routingAndAssetLoadingUrl
};