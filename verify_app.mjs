import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const FILE = 'file:///c:/Users/ShadrackAmihanda/OneDrive%20-%20Verst%20Carbon/Documents/GitHub/onyxhawk_phone_application/index.html';
const OUT  = 'c:/Users/ShadrackAmihanda/OneDrive - Verst Carbon/Documents/GitHub/onyxhawk_phone_application/verify_shots/';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx     = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page    = await ctx.newPage();

const errors = [];
page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
page.on('console',  m => { if (m.type() === 'error') errors.push('[console.error] ' + m.text()); });

// 1. Load landing
await page.goto(FILE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.screenshot({ path: OUT + '01_landing.png' });
const landingTitle = await page.locator('text=Book a Service').first().isVisible().catch(() => false);
console.log('1. Landing loaded, "Book a Service" visible:', landingTitle);

// 2. Navigate to Payments tab directly via nav
await page.locator('button', { hasText: 'Book a Service' }).first().click();
await page.waitForTimeout(500);
// Click the Pay nav tab
await page.locator('button.nav-btn', { hasText: 'Pay' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: OUT + '02_payments_empty.png' });
const payTitle = await page.locator('h2', { hasText: 'No Payments Yet' }).isVisible().catch(() => false);
const payTab   = await page.locator('button.nav-btn', { hasText: 'Pay' }).isVisible().catch(() => false);
console.log('Pay tab in nav visible:', payTab);
console.log('Payments screen — empty state visible:', payTitle);
// go back to book
await page.locator('button', { hasText: 'Book a Service' }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: OUT + '02_book.png' });
const stepBarBook = await page.locator('text=BOOK').first().isVisible().catch(() => false);
console.log('2. Book screen — StepBar "BOOK" visible:', stepBarBook);

// 3. Fill the form
try {
  await page.locator('div').filter({ hasText: /^🏠/ }).first().click();
  await page.waitForTimeout(200);
} catch(e) { console.log('  service select fallback'); }
await page.fill('input[placeholder="Full Name"]', 'Test User');
await page.fill('input[type="tel"]', '0712345678');
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0,10);
await page.fill('input[type="date"]', tomorrow);
await page.locator('button', { hasText: '10:00 AM' }).click();
await page.waitForTimeout(200);
// location textarea
const locationField = page.locator('textarea').first();
await locationField.fill('Westlands, Nairobi');
await page.screenshot({ path: OUT + '03_book_filled.png' });
console.log('3. Form filled');

// 4. Click Review Booking
const reviewBtn = page.locator('button', { hasText: /Review Booking/ });
const reviewBtnVisible = await reviewBtn.isVisible().catch(() => false);
console.log('4. "Review Booking" button visible:', reviewBtnVisible);
if (reviewBtnVisible) {
  await reviewBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + '04_review.png' });
  const reviewH2 = await page.locator('h2', { hasText: 'Review Booking' }).isVisible().catch(() => false);
  const stepBar2 = await page.locator('text=REVIEW').first().isVisible().catch(() => false);
  console.log('   Review screen h2 visible:', reviewH2);
  console.log('   StepBar "REVIEW" active:', stepBar2);
} else {
  console.log('   SKIP — Review button not found, capturing page content:');
  console.log(await page.locator('body').innerText().then(t => t.slice(0,400)));
}

// 5. Confirm & Pay
const confirmBtn = page.locator('button', { hasText: /Confirm/ });
const confirmVisible = await confirmBtn.isVisible().catch(() => false);
console.log('5. "Confirm & Pay" button visible:', confirmVisible);
if (confirmVisible) {
  await confirmBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + '05_pay.png' });
  const stkBtn    = await page.locator('button', { hasText: /STK Push/ }).isVisible().catch(() => false);
  const stepBar3  = await page.locator('text=PAY').first().isVisible().catch(() => false);
  const phoneInp  = await page.locator('input[type="tel"]').last().inputValue().catch(() => 'n/a');
  console.log('   Pay screen — StepBar "PAY" visible:', stepBar3);
  console.log('   Pay screen — STK Push button visible:', stkBtn);
  console.log('   Pay screen — phone pre-filled:', phoneInp);
}

await browser.close();
console.log('\nScreenshots saved to:', OUT);
if (errors.length) console.log('\nJS ERRORS:\n', errors.join('\n'));
else console.log('No JS errors detected.');
