import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('http://localhost:3000/oportunidades')
        await page.wait_for_timeout(2000)
        await page.screenshot(path='/Users/vtlombardi/.gemini/antigravity/brain/cc16f64e-8f3e-47a0-9b39-0e0a13ec5877/debug_snapshot.png', full_page=True)
        await browser.close()

asyncio.run(main())
