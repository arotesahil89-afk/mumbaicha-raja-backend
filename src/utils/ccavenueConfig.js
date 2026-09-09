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
  live:       'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
};

export function getCCAvenueConfig() {
  const env = (process.env.CCAVENUE_ENV || 'production').trim().toLowerCase();

  let merchantId, accessCode, workingKey;

  if (env === 'production' || env === 'live') {
    merchantId  = process.env.CCAVENUE_PROD_MERCHANT_ID  || process.env.CCAVENUE_MERCHANT_ID  || '4460067';
    accessCode  = process.env.CCAVENUE_PROD_ACCESS_CODE  || process.env.CCAVENUE_ACCESS_CODE  || 'ATMD94NG82BY53DMYB';
    workingKey  = process.env.CCAVENUE_PROD_WORKING_KEY  || process.env.CCAVENUE_WORKING_KEY  || '1D67BA608D9E93E8A7F8DF90E5ABB804';
  } else if (env === 'uat') {
    merchantId  = process.env.CCAVENUE_UAT_MERCHANT_ID   || process.env.CCAVENUE_MERCHANT_ID  || '4460067';
    accessCode  = process.env.CCAVENUE_UAT_ACCESS_CODE   || process.env.CCAVENUE_ACCESS_CODE  || 'ATKP94NG80BW77PKWB';
    workingKey  = process.env.CCAVENUE_UAT_WORKING_KEY   || process.env.CCAVENUE_WORKING_KEY  || '548488A4DC3A13929E244B7EA6D51486';
  } else {
    // simulator (default)
    merchantId  = process.env.CCAVENUE_MERCHANT_ID  || '4460067';
    accessCode  = process.env.CCAVENUE_ACCESS_CODE  || 'ATMD94NG82BY53DMYB';
    workingKey  = process.env.CCAVENUE_WORKING_KEY  || '1D67BA608D9E93E8A7F8DF90E5ABB804';
  }

  const gatewayUrl  = GATEWAY_URLS[env] || GATEWAY_URLS.production;
  const redirectUrl = process.env.CCAVENUE_REDIRECT_URL || 'https://mumbaicharaja.co/api/orders/ccavenue-response';

  return { env, merchantId, accessCode, workingKey, gatewayUrl, redirectUrl };
}
