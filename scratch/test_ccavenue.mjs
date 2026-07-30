import { decrypt, encrypt } from '../src/utils/ccavutil.js';

// Setup environment variables for test script if not already present
const workingKey = '1D67BA608D9E93E8A7F8DF90E5ABB804';

async function runTest() {
  console.log('--- STARTING CCAVENUE INTEGRATION TEST ---');
  
  // 1. Fetch a product to get a valid product ID
  const prodResponse = await fetch('http://localhost:5000/api/merchandise');
  const prodJson = await prodResponse.json();
  
  // Decrypt if response is encrypted
  let products = prodJson;
  if (prodJson.payload) {
    console.log('Database encryption active. Using a mock product ID...');
  }
  
  const mockProductId = 'mr-polo-2025'; // From product catalog

  // 2. Initiate order creation & payment
  console.log('\n1. Initiating order checkout via CCAvenue...');
  
  const orderPayload = {
    customerName: 'Test Devotee',
    customerEmail: 'devotee@example.com',
    customerPhone: '9876543210',
    deliveryMethod: 'pickup',
    productId: mockProductId,
    productName: 'Official MCR Polo T-Shirt',
    size: 'M: 1',
    quantity: 1,
    unitPrice: 500,
    totalAmount: 512, // 500 + 12 (convenience fee)
    paymentMethod: 'ccavenue'
  };

  const CryptoJS = (await import('crypto-js')).default;
  const SECRET_KEY = 'default-secret-key-123456789012';
  
  const jsonStr = JSON.stringify(orderPayload);
  const ciphertext = CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
  
  const response = await fetch('http://localhost:5000/api/orders/ccavenue-initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: ciphertext })
  });

  const resJson = await response.json();
  if (!resJson.payload) {
    console.error('Failed to get encrypted payload:', resJson);
    return;
  }
  
  // Decrypt response
  const bytes = CryptoJS.AES.decrypt(resJson.payload, SECRET_KEY);
  const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
  const initiateData = JSON.parse(decryptedStr);
  
  console.log('Initiated successfully:', initiateData);
  
  const { encRequest, accessCode, actionUrl } = initiateData;
  if (!encRequest || !actionUrl) {
    console.error('Verification failed: encRequest or actionUrl is missing!');
    return;
  }
  
  // 3. Post to simulator
  console.log('\n2. Posting to simulator...');
  const simResponse = await fetch('http://localhost:5000/api/orders/ccavenue-simulator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `encRequest=${encodeURIComponent(encRequest)}&access_code=${accessCode}`
  });
  
  const html = await simResponse.text();
  console.log('Simulator rendered page successfully! Length:', html.length);
  
  // Extract success encResp from html using regex
  const match = html.match(/name="encResp" value="([^"]+)"/);
  if (!match) {
    console.error('Failed to find encResp in simulator HTML!');
    return;
  }
  
  const encResp = match[1];
  
  // 4. Post response to callback endpoint
  console.log('\n3. Posting success response back to callback handler...');
  const callbackResponse = await fetch('http://localhost:5000/api/orders/ccavenue-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `encResp=${encodeURIComponent(encResp)}`,
    redirect: 'manual' // We want to inspect the redirect URL
  });
  
  const redirectUrl = callbackResponse.headers.get('location');
  console.log('Callback completed. Redirect location:', redirectUrl);
  
  if (redirectUrl && redirectUrl.includes('status=success')) {
    console.log('\n🎉 SUCCESS: E2E payment flow verified successfully!');
  } else {
    console.error('\n❌ FAILURE: Redirect URL does not indicate success:', redirectUrl);
  }
}

runTest().catch(console.error);
