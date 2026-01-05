from playwright.sync_api import sync_playwright

def verify_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Desktop viewport
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto("http://localhost:5173")
        try:
            page.wait_for_selector("aside", timeout=5000) # Check for sidebar
            page.screenshot(path="verification/layout_sidebar.png")
            print("Layout verified")
        except:
            print("Sidebar not found")
        browser.close()

if __name__ == "__main__":
    verify_layout()
