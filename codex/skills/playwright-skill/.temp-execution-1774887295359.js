const { chromium } = require('playwright');

const TARGET_URL = 'https://matrix.aihub.ovh';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleMessages.push(text);
    console.log('CONSOLE:', text);
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
    console.log('PAGE ERROR:', err.message);
  });

  // Intercept and log network requests related to billing/subscription
  const networkRequests = [];
  page.on('request', request => {
    const url = request.url();
    if (url.includes('billing') || url.includes('subscription') || url.includes('api')) {
      const entry = { type: 'REQUEST', method: request.method(), url };
      networkRequests.push(entry);
      console.log(`NETWORK REQUEST: ${request.method()} ${url}`);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('billing') || url.includes('subscription') || url.includes('api')) {
      let body = '';
      try {
        body = await response.text();
        if (body.length > 500) body = body.substring(0, 500) + '...';
      } catch (e) {
        body = '[could not read body]';
      }
      const entry = { type: 'RESPONSE', status: response.status(), url, body };
      networkRequests.push(entry);
      console.log(`NETWORK RESPONSE: ${response.status()} ${url}`);
      console.log(`  BODY: ${body}`);
    }
  });

  try {
    console.log('=== STEP 1: Navigate to matrix.aihub.ovh ===');
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    console.log('\n=== STEP 2: Wait 3 seconds for initial load ===');
    await page.waitForTimeout(3000);

    console.log('\n=== STEP 3: Take initial screenshot ===');
    await page.screenshot({ path: '/tmp/matrix-initial.png', fullPage: true });
    console.log('Screenshot saved: /tmp/matrix-initial.png');

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Get current URL (check for redirects)
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    console.log('\n=== STEP 4: Analyze page content ===');

    // Check if there's a PaywallScreen
    const paywallVisible = await page.locator('[class*="paywall"], [class*="Paywall"], #paywall').count();
    console.log('Paywall elements found:', paywallVisible);

    // Check for auth/login elements
    const authSection = await page.locator('#auth, [id*="auth"], [class*="auth"], [class*="Auth"]').count();
    console.log('Auth section elements:', authSection);

    // Check for subscription-related text
    const subscriptionText = await page.locator('text=/subscription|billing|paywall|upgrade|plan/i').count();
    console.log('Subscription-related text elements:', subscriptionText);

    // Check for Google OAuth button
    const googleBtn = await page.locator('[class*="google"], button:has-text("Google"), a:has-text("Google")').count();
    console.log('Google OAuth buttons found:', googleBtn);

    // Get all visible text on page (first 2000 chars)
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('\n=== PAGE TEXT (first 2000 chars) ===');
    console.log(pageText.substring(0, 2000));

    console.log('\n=== STEP 5: Check React app state via evaluate ===');
    const reactState = await page.evaluate(() => {
      // Try to find React root
      const root = document.getElementById('root') || document.getElementById('app');
      if (!root) return 'No React root found';

      // Check for any global state
      const windowKeys = Object.keys(window).filter(k =>
        k.includes('billing') || k.includes('subscription') || k.includes('user') || k.includes('auth')
      );
      return {
        rootExists: !!root,
        rootChildren: root ? root.children.length : 0,
        relevantWindowKeys: windowKeys,
        localStorage: Object.keys(localStorage).reduce((acc, key) => {
          if (key.includes('billing') || key.includes('subscription') || key.includes('user') || key.includes('auth') || key.includes('token')) {
            acc[key] = localStorage.getItem(key);
          }
          return acc;
        }, {})
      };
    });
    console.log('React app state:', JSON.stringify(reactState, null, 2));

    console.log('\n=== STEP 6: Direct test of billing API ===');
    const billingResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/billing/subscription', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const text = await response.text();
        return {
          status: response.status,
          statusText: response.statusText,
          body: text.substring(0, 1000)
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    console.log('Billing API direct call result:', JSON.stringify(billingResult, null, 2));

    // Also try with the full URL
    const billingResultFull = await page.evaluate(async (url) => {
      try {
        const response = await fetch(`${url}/api/billing/subscription`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const text = await response.text();
        return {
          status: response.status,
          statusText: response.statusText,
          body: text.substring(0, 1000)
        };
      } catch (e) {
        return { error: e.message };
      }
    }, TARGET_URL);
    console.log('Billing API full URL call result:', JSON.stringify(billingResultFull, null, 2));

    console.log('\n=== STEP 7: Check all API endpoints ===');
    const apiEndpoints = [
      '/api/billing/subscription',
      '/api/auth/session',
      '/api/user',
      '/api/me',
    ];
    for (const endpoint of apiEndpoints) {
      const result = await page.evaluate(async (ep) => {
        try {
          const r = await fetch(ep);
          const t = await r.text();
          return { status: r.status, body: t.substring(0, 300) };
        } catch (e) {
          return { error: e.message };
        }
      }, endpoint);
      console.log(`API ${endpoint}:`, JSON.stringify(result));
    }

    console.log('\n=== STEP 8: Look for specific UI elements ===');

    // Try to find any visible modals or overlays
    const modals = await page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').count();
    console.log('Modal/dialog elements:', modals);

    // Check for any error messages on page
    const errors = await page.locator('[class*="error"], [class*="Error"], .alert, [role="alert"]').count();
    console.log('Error elements on page:', errors);

    // Final screenshot
    await page.screenshot({ path: '/tmp/matrix-final.png', fullPage: true });
    console.log('Final screenshot saved: /tmp/matrix-final.png');

    // Scroll down to see more
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/matrix-scrolled.png', fullPage: true });
    console.log('Scrolled screenshot saved: /tmp/matrix-scrolled.png');

    console.log('\n=== SUMMARY ===');
    console.log('All console messages:', consoleMessages.length);
    consoleMessages.forEach(m => console.log(' -', m));
    console.log('\nAll network requests captured:', networkRequests.length);
    networkRequests.forEach(r => {
      if (r.type === 'REQUEST') {
        console.log(` REQUEST: ${r.method} ${r.url}`);
      } else {
        console.log(` RESPONSE: ${r.status} ${r.url}`);
        if (r.body) console.log(`   body: ${r.body.substring(0, 200)}`);
      }
    });
    console.log('\nPage errors:', pageErrors.length);
    pageErrors.forEach(e => console.log(' -', e));

  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: '/tmp/matrix-error.png', fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
