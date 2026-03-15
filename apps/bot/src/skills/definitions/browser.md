---
name: browser
description: Browse the web, take screenshots, fill forms, and automate browser tasks via Browserbase. Use when asked to visit a URL, scrape a page, or interact with a website.
---

## Browser Automation

Use the browser tools for web browsing, screenshots, form filling, and web scraping.

### Quick Start

```python
# 1. Create a session
result = await browser_create_session(starting_url="https://example.com")
session_id = result["session_id"]
connect_url = result["connect_url"]

# 2. Use Playwright to interact
# Install: pip install playwright
from playwright.async_api import async_playwright

async with async_playwright() as p:
    browser = await p.chromium.connect_over_cdp(connect_url)
    page = browser.contexts[0].pages[0]

    # Navigate, click, type, screenshot
    await page.goto("https://example.com")
    await page.screenshot(path="/work/screenshot.png")
    content = await page.content()

# 3. Close when done
await browser_close_session(session_id=session_id)
```

### Available Tools

| Tool | Description |
|------|-------------|
| `browser_create_session` | Create a Browserbase session. Returns `session_id`, `connect_url`, `live_view_url` |
| `browser_download_files` | Download files from session to workspace |
| `browser_close_session` | Release session resources |

### Parameters for `browser_create_session`

- `starting_url` (str): URL to open initially
- `viewport_width` (int, default 1024): Browser width
- `viewport_height` (int, default 768): Browser height
- `enable_proxies` (bool): Use proxy for the session
- `timeout_seconds` (int, default 300): Session timeout

### Tips

- Always close sessions when done to free resources
- Use `page.wait_for_selector()` before interacting with dynamic elements
- For scraping, prefer `page.evaluate()` with JavaScript over parsing HTML
- Save screenshots to `/work/` for sharing via Slack
- Sessions persist across script runs if not closed — reuse the `connect_url`
