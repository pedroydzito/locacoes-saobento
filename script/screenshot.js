import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 630 });

        console.log("Navigating to app...");
        await page.goto('http://127.0.0.1:5000/login', { waitUntil: 'networkidle0' });

        // Wait an extra second to ensure animations finish
        await new Promise(r => setTimeout(r, 1000));

        console.log("Taking screenshot...");
        await page.screenshot({ path: 'client/public/og-image.png' });

        await browser.close();
        console.log("Done!");
    } catch (error) {
        console.error("Script failed:", error);
        process.exit(1);
    }
})();
