from playwright.sync_api import sync_playwright, expect
import time

def verify_enhanced_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.on("dialog", lambda dialog: dialog.accept())

        # 1. Load App (Dashboard)
        try:
            page.goto("http://localhost:5173", timeout=10000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        page.wait_for_selector("text=Tablero de Control")
        print("Loaded Dashboard")

        # 2. Add Mechanic
        # Use more specific selector to avoid ambiguity
        page.click("button:has-text('Gestión de Mecánicos')")
        page.fill("input[placeholder='Nombre del Mecánico']", "Mecánico Test")
        page.fill("input[placeholder='Código']", "MTEST-001")
        page.click("button:has(svg.lucide-plus)")
        time.sleep(0.5)
        print("Added Mechanic")

        # 3. Create Reception with File (Simulated)
        # Click the navigation button specifically
        page.click("nav button:has-text('Recepción')")

        # Wait for form
        page.wait_for_selector("input[placeholder*='Nombre Completo']", state="visible", timeout=5000)

        page.fill("input[placeholder*='Nombre Completo']", "Cliente V2")
        page.fill("input[placeholder*='Teléfono']", "809-555-0101")
        page.fill("input[placeholder*='Marca']", "Honda")
        page.fill("input[placeholder*='Modelo']", "Civic")
        page.fill("input[placeholder*='Año']", "2022")
        page.fill("input[placeholder*='Placa']", "A-999999")
        page.fill("textarea", "Revisión General")

        page.click("text=Abrir Orden de Servicio")
        time.sleep(1)
        print("Created Order")

        # 4. Diagnosis: Assign Mechanic and Print View
        page.click("nav button:has-text('Diagnóstico')")
        page.wait_for_selector("text=Cliente V2")
        page.click("text=Cliente V2")

        # Select Mechanic (first select on page)
        # Wait for selects to populate
        time.sleep(1.0) # Increased wait time for Dexie query

        # Select Mechanic
        # The option exists but is hidden (browser native behavior)
        # We can just select it by label directly without waiting for visibility
        page.select_option("select >> nth=0", label="Mecánico Test (MTEST-001)")

        # Add Item
        page.fill("input[placeholder='Descripción']", "Aceite")
        # Item Type select is the second one
        page.select_option("select >> nth=1", "part")
        page.fill("input[placeholder='Precio']", "2500")
        page.click("button:has(svg.lucide-plus)")

        # Check Print View
        page.click("button:has-text('Imprimir')") # Use button selector specifically
        # In print view, "Presupuesto" should be visible

        time.sleep(1) # Wait for render
        page.screenshot(path="verification/6_print_budget.png")

        # We can check content in screenshot logic or text
        # page.wait_for_selector("h1:has-text('Presupuesto')", timeout=5000)

        # Verify text presence
        content = page.content()
        if "Presupuesto" in content and "MTEST-001" in content:
            print("Print View Verified")
        else:
            print("Print View Missing Content")

        page.click("button:has(svg.lucide-x)") # Close print view

        # Submit
        page.click("text=Generar Presupuesto")
        print("Diagnosis Complete")

        # 5. Dashboard Search
        page.click("nav button:has-text('Tablero')")

        # Ensure we are back on dashboard before searching
        page.wait_for_selector("text=Tablero de Control")

        page.fill("input[placeholder*='Buscar']", "Honda")
        time.sleep(2) # Wait for debounce/query
        page.screenshot(path="verification/7_dashboard_search.png")

        expect(page.get_by_text("Cliente V2")).to_be_visible()
        print("Dashboard Search Verified")

        browser.close()

if __name__ == "__main__":
    verify_enhanced_flow()
