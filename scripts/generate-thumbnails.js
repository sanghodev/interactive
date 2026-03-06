const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const THUMB_DIR = path.join(__dirname, '../public/thumbnails');

if (!fs.existsSync(THUMB_DIR)) {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
}

(async () => {
    console.log("Starting Thumbnail Generation via Puppeteer...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set a high resolution 16:9 monitor size for premium looking thumbnails
    await page.setViewport({ width: 1920, height: 1080 });

    for (let i = 1; i <= 16; i++) {
        const id = i.toString().padStart(2, '0');
        const url = `http://localhost:3000/experiments/${id}`;
        const dest = path.join(THUMB_DIR, `${id}.jpg`);

        console.log(`[${id}/16] Capturing: ${url}`);

        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Wait an additional 2 seconds to let GSAP/Framer Motion intro animations settle on the first frame
            await new Promise(r => setTimeout(r, 2000));

            await page.screenshot({ path: dest, type: 'jpeg', quality: 80 });
            console.log(`  -> Saved to ${dest}`);
        } catch (error) {
            console.error(`  -> Failed to capture ${id}: ${error.message}`);
        }
    }

    await browser.close();
    console.log("Finished generating all 16 thumbnails.");
})();
