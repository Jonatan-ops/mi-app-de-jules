from playwright.sync_api import sync_playwright, expect
import time

def verify_app_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Handle dialogs
        page.on("dialog", lambda dialog: dialog.accept())

        # 1. Navigate to the app (default port for Vite is 5173)
        try:
            page.goto("http://localhost:5173", timeout=10000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        # Wait for app to load
        page.wait_for_selector("text=FD Auto Repair")

        print("Navigated to App")

        # 2. Reception: Create a new order
        page.click("text=Recepción")

        # Fill form
        page.fill("input[name='name']", "Juan Perez")
        page.fill("input[name='phone']", "555-0123")
        page.fill("input[name='brand']", "Toyota")
        page.fill("input[name='model']", "Corolla")
        page.fill("input[name='year']", "2020")
        page.fill("input[name='plate']", "ABC-123")
        page.fill("textarea[name='issue']", "Ruido en el motor al encender")

        # Submit
        page.click("text=Abrir Orden de Servicio")
        # Dialog handled by listener

        time.sleep(1) # Wait for state update
        page.screenshot(path="verification/1_reception_filled.png")
        print("Reception Step Complete")

        # 3. Diagnosis
        page.click("text=Diagnóstico")
        page.wait_for_selector("text=Juan Perez")
        page.click("text=Juan Perez") # Select the order

        page.fill("textarea", "Motor de arranque defectuoso") # Diagnosis text

        # Add Item
        page.fill("input[placeholder='Descripción (Repuesto o Mano de Obra)']", "Motor de Arranque")
        page.select_option("select", "part")
        page.fill("input[placeholder='Precio']", "150.00")
        page.click("button:has(svg.lucide-plus)") # Add button

        # Add Labor
        page.fill("input[placeholder='Descripción (Repuesto o Mano de Obra)']", "Instalación")
        page.select_option("select", "labor")
        page.fill("input[placeholder='Precio']", "50.00")
        page.click("button:has(svg.lucide-plus)")

        page.screenshot(path="verification/2_diagnosis_filled.png")

        page.click("text=Generar Presupuesto")
        # Dialog handled by listener
        print("Diagnosis Step Complete")

        # 4. Workshop (Taller)
        page.click("text=Taller")

        # Approve
        page.wait_for_selector("text=Pendientes de Aprobación")
        page.click("text=Cliente Aprobó")
        # Dialog handled by listener

        print("Approved order")

        # Wait for transition to "En Reparación" section
        # The order should disappear from Approval and appear in Repair
        page.wait_for_selector("text=Terminar Trabajo", timeout=5000)

        time.sleep(0.5)
        page.screenshot(path="verification/3_workshop_in_progress.png")

        # Finish
        page.click("text=Terminar Trabajo")
        # Dialog handled by listener

        print("Workshop Step Complete")

        # 5. Cashier (Caja)
        page.click("text=Caja")
        page.wait_for_selector("text=Toyota Corolla")
        page.screenshot(path="verification/4_cashier_list.png")

        page.click("button:has(svg.lucide-dollar-sign)") # Click pay icon
        page.wait_for_selector("text=Total a Pagar")

        page.screenshot(path="verification/5_invoice.png")

        page.click("text=Pago en Efectivo")
        # Dialog handled by listener

        print("Cashier Step Complete")

        # Verify list empty
        time.sleep(0.5)
        expect(page.get_by_text("No hay vehículos listos")).to_be_visible()

        browser.close()

if __name__ == "__main__":
    verify_app_flow()
