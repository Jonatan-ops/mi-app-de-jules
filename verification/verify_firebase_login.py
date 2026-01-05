from playwright.sync_api import sync_playwright
import time
import random

def verify_login_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        try:
            page.goto("http://localhost:5173", timeout=10000)
            page.wait_for_selector("text=Iniciar Sesión", timeout=5000)
        except Exception as e:
            print(f"Login screen not found: {e}")
            return

        rand_id = random.randint(1000, 9999)
        email = f"test{rand_id}@taller.com"
        password = "password123"

        try:
            page.click("text=¿No tienes cuenta? Regístrate")
            page.fill("input[type='email']", email)
            page.fill("input[type='password']", password)
            page.click("button[type='submit']")

            # Wait for either Success (Sidebar) or Error
            try:
                page.wait_for_selector("aside", timeout=10000)
                print(f"Successfully registered and logged in as {email}")
                page.screenshot(path="verification/firebase_success.png")
            except:
                # Check for error message
                error_loc = page.locator("div.bg-red-50")
                if error_loc.is_visible():
                    print(f"Registration Error: {error_loc.inner_text()}")
                else:
                    print("Registration timed out with no error message.")
                page.screenshot(path="verification/firebase_fail.png")

        except Exception as e:
            print(f"Flow failed: {e}")

        browser.close()

if __name__ == "__main__":
    verify_login_flow()
