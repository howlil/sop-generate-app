/**
 * E2E Testing untuk Sistem Informasi SOP - Frontend
 * Menggunakan Puppeteer untuk browser automation
 */

const puppeteer = require('puppeteer');

async function runTests() {
  const browser = await puppeteer.launch({ 
    headless: false, // Lihat browser bergerak
    slowMo: 500 // Delay 500ms agar terlihat jelas
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  console.log('🚀 Memulai E2E Testing...');
  
  try {
    // Test 1: Homepage
    console.log('\n📋 Test 1: Loading Homepage');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'test-screenshots/1-homepage.png' });
    
    const title = await page.title();
    console.log(`✅ Page title: ${title}`);
    
    // Test 2: Verify hero section
    console.log('\n📋 Test 2: Verify Hero Section');
    const heroTitle = await page.$eval('h1, [class*="text-4xl"], [class*="text-5xl"]', el => el.textContent);
    console.log(`✅ Hero title: ${heroTitle}`);
    await page.screenshot({ path: 'test-screenshots/2-hero-section.png' });
    
    // Test 3: Click Login button
    console.log('\n📋 Test 3: Click Login Button');
    await page.waitForSelector('button, a');
    await page.click('button');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'test-screenshots/3-login-page.png' });
    
    console.log('✅ Navigated to login page');
    
    // Test 4: Fill login form (jika ada)
    console.log('\n📋 Test 4: Fill Login Form');
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (emailInput) {
      await page.type('input[type="email"], input[name="email"]', 'test@example.com');
      await page.screenshot({ path: 'test-screenshots/4-filled-email.png' });
      console.log('✅ Email filled');
    }
    
    // Test 5: Navigate to other pages
    console.log('\n📋 Test 5: Navigate to Different Pages');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Click "Mulai Sekarang" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const mulaiBtn = buttons.find(btn => btn.textContent.includes('Mulai'));
      if (mulaiBtn) mulaiBtn.click();
    });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/5-after-mulai.png' });
    console.log('✅ Clicked "Mulai Sekarang"');
    
    console.log('\n✅ Semua test selesai!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('test-screenshots')) {
  fs.mkdirSync('test-screenshots');
}

runTests();
