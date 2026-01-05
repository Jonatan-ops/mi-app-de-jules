from playwright.sync_api import sync_playwright, expect
import time

def verify_new_features():
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

        print("Loaded")

        # 2. Add Mechanic (Dashboard)
        try:
             page.click("button:has-text('Gestión de Mecánicos')")
             time.sleep(0.5)

             page.fill("input[placeholder='Nombre del Mecánico']", "Mecánico Test")
             page.fill("input[placeholder='Código']", "M1")
             page.click("div.flex.gap-2 > button")
             print("Mechanic added (or attempted)")
        except Exception as e:
             print(f"Could not add mechanic: {e}")

        # Wait for "Recepción" button
        try:
            page.wait_for_selector("button:has-text('Recepción')", timeout=20000)
        except:
            print("Navigation not found. Taking screenshot.")
            page.screenshot(path="verification/debug_nav_fail.png")
            return

        # 3. Test Discard (Cancel) Workflow
        page.click("button:has-text('Recepción')")

        page.wait_for_selector("input[name='name']")
        page.fill("input[name='name']", "Cliente Cancelar")
        page.fill("input[name='brand']", "Test")
        page.fill("input[name='model']", "Car")
        page.fill("textarea[name='issue']", "Prueba Cancelación")

        page.click("button:has-text('Abrir Orden de Servicio')")
        time.sleep(1)

        # Diagnosis
        page.click("button:has-text('Diagnóstico')")
        page.wait_for_selector("text=Cliente Cancelar", timeout=5000)
        page.click("text=Cliente Cancelar")
        time.sleep(1)

        try:
            page.select_option("select >> nth=0", index=1)
        except:
            print("Failed to select mechanic. Index 1 not found?")

        page.fill("input[placeholder='Descripción']", "Item X")
        page.fill("input[placeholder='Precio']", "100")
        page.click("button:has(svg.lucide-plus)")

        page.click("button:has-text('Generar Presupuesto')")
        time.sleep(1)

        # Go to Workshop
        page.click("button:has-text('Taller')")
        page.wait_for_selector("text=Cliente Cancelar")

        # Discard
        card = page.locator("div.bg-white").filter(has_text="Cliente Cancelar").first
        discard_btn = card.locator("button[title='Descartar Presupuesto']")
        discard_btn.click()
        time.sleep(1)

        # Verify hidden
        expect(page.get_by_text("Cliente Cancelar")).to_be_hidden()
        print("Discard Workflow Verified")

        # 4. Test History Detail View
        page.click("button:has-text('Historial')")
        page.fill("input[placeholder*='Buscar']", "Cliente Cancelar")
        time.sleep(1)

        # Check for status Badge "Cancelado"
        expect(page.get_by_text("Cancelado")).to_be_visible()

        page.click("button:has-text('Ver Detalles')")
        time.sleep(0.5)

        # Check modal content specifically
        # The modal container covers the screen
        modal_content = page.locator("div.fixed.inset-0").filter(has_text="Detalle Histórico")
        expect(modal_content.get_by_text("Prueba Cancelación")).to_be_visible()

        print("History Detail Modal Verified")
        page.screenshot(path="verification/v4_final_success.png")

        browser.close()

if __name__ == "__main__":
    verify_new_features()
