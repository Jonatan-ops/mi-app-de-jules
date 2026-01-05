from playwright.sync_api import sync_playwright

def capture_login():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto("http://localhost:5173")
        page.wait_for_selector("text=Iniciar Sesión")
        page.screenshot(path="verification/login_screen.png")
        browser.close()

if __name__ == "__main__":
    capture_login()
