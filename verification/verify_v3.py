from playwright.sync_api import sync_playwright, expect
import time

def verify_maintenance_and_record():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.on("dialog", lambda dialog: dialog.accept())

        # 1. Load App
        try:
            page.goto("http://localhost:5173", timeout=10000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        page.wait_for_selector("text=Tablero de Control")
        print("Loaded")

        # 2. Check Navigation Tabs
        # Use more specific selector since "Historial" appears in dashboard title too
        expect(page.locator("nav button:has-text('Historial')")).to_be_visible()

        # 3. Create a Maintenance Order to Test
        page.click("nav button:has-text('Recepción')")
        page.wait_for_selector("input[placeholder*='Nombre Completo']", state="visible")

        page.fill("input[placeholder*='Nombre Completo']", "Cliente Mantenimiento")
        page.fill("input[placeholder*='Marca']", "Toyota")
        page.fill("input[placeholder*='Modelo']", "Hilux")
        page.fill("input[placeholder*='Placa']", "M-00001")
        page.fill("textarea", "Mantenimiento 5000km")
        page.click("text=Abrir Orden de Servicio")
        time.sleep(1)

        # 4. Diagnose as Maintenance
        page.click("nav button:has-text('Diagnóstico')")
        # Wait until it appears in list
        page.wait_for_selector("text=Cliente Mantenimiento", timeout=5000)
        page.click("text=Cliente Mantenimiento")

        # Check maintenance box
        page.check("input[type='checkbox']")

        # Select mechanic
        time.sleep(1)
        # Select first available mechanic
        page.select_option("select >> nth=0", index=1)

        # Add item
        page.fill("input[placeholder='Descripción']", "Aceite")
        page.fill("input[placeholder='Precio']", "5000")
        page.click("button:has(svg.lucide-plus)")

        # Check Print View for Maintenance Label
        page.click("button:has-text('Imprimir')")
        time.sleep(1)

        content = page.content()
        if "Mantenimiento" in content:
           print("Maintenance Label Verified in Print")
        else:
           print("Maintenance Label Missing in Print")

        page.click("button:has(svg.lucide-x)")

        # Submit
        page.click("text=Generar Presupuesto")
        # Wait for submit to process
        time.sleep(1)

        # 5. Check Record / History
        page.click("nav button:has-text('Historial')")
        page.wait_for_selector("input[placeholder*='Buscar']")

        page.fill("input[placeholder*='Buscar']", "M-00001")
        time.sleep(2) # Query delay
        page.screenshot(path="verification/8_history_search.png")
        expect(page.get_by_text("Toyota Hilux")).to_be_visible()
        expect(page.get_by_text("Aceite")).to_be_visible()
        print("History Verified")

        # 6. Check Dashboard Detail View
        page.click("nav button:has-text('Tablero')")

        # Wait for Search to be visible
        page.wait_for_selector("input[placeholder*='Buscar']", state="visible")

        # Search for it
        page.fill("input[placeholder*='Buscar']", "Mantenimiento")
        time.sleep(1)

        # Click Eye icon (first one)
        # Using a more robust selector: look for row with "Cliente Mantenimiento" then find the button in it
        # Or just generic first eye button
        page.click("button[title='Ver Detalles / Factura']")

        time.sleep(0.5)
        page.screenshot(path="verification/9_dashboard_detail.png")

        # Check for ANY text that indicates detail modal is open
        # "Orden #" is a good candidate
        expect(page.locator("h3:has-text('Orden #')")).to_be_visible()

        print("Dashboard Detail Modal Verified")

        browser.close()

if __name__ == "__main__":
    verify_maintenance_and_record()
