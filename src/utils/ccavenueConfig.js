/**
 * ccavenueConfig.js
 * ---
 * Resolves the correct CCAvenue credentials and gateway URLs
 * based on the CCAVENUE_ENV environment variable.
 *
 * Modes:
 *   simulator  → Internal test simulator (no external dependency)
 *   uat        → CCAvenue official test environment (test.ccavenue.com)
 *   production → Live CCAvenue (secure.ccavenue.com)
 */

const GATEWAY_URLS = {
  simulator: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/orders/ccavenue-simulator`,
  uat:        'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
  production: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
};

export function getCCAvenueConfig() {
  const env = (process.env.CCAVENUE_ENV || 'simulator').trim().toLowerCase();

  let merchantId, accessCode, workingKey;

  if (env === 'production') {
    merchantId  = process.env.CCAVENUE_PROD_MERCHANT_ID  || process.env.CCAVENUE_MERCHANT_ID;
    accessCode  = process.env.CCAVENUE_PROD_ACCESS_CODE  || process.env.CCAVENUE_ACCESS_CODE;
    workingKey  = process.env.CCAVENUE_PROD_WORKING_KEY  || process.env.CCAVENUE_WORKING_KEY;
  } else if (env === 'uat') {
    merchantId  = process.env.CCAVENUE_UAT_MERCHANT_ID   || process.env.CCAVENUE_MERCHANT_ID;
    accessCode  = process.env.CCAVENUE_UAT_ACCESS_CODE   || process.env.CCAVENUE_ACCESS_CODE;
    workingKey  = process.env.CCAVENUE_UAT_WORKING_KEY   || process.env.CCAVENUE_WORKING_KEY;
  } else {
    // simulator (default)
    merchantId  = process.env.CCAVENUE_MERCHANT_ID  || '123456';
    accessCode  = process.env.CCAVENUE_ACCESS_CODE  || 'ATMD94NG82BY53DMYB';
    workingKey  = process.env.CCAVENUE_WORKING_KEY  || '1D67BA608D9E93E8A7F8DF90E5ABB804';
  }

  const gatewayUrl  = GATEWAY_URLS[env] || GATEWAY_URLS.simulator;
  const redirectUrl = process.env.CCAVENUE_REDIRECT_URL || 'http://localhost:5000/api/orders/ccavenue-response';

  return { env, merchantId, accessCode, workingKey, gatewayUrl, redirectUrl };
}
