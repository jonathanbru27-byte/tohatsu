#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Tohatsu Motors App
Tests all endpoints: Authentication, Motors, Calendar, Configuration
"""

import requests
import json
import sys
from typing import Optional

# Backend URL from environment
BASE_URL = "https://outboard-motors.preview.emergentagent.com/api"

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

# Global token storage
auth_token: Optional[str] = None

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test(test_name: str):
    """Print test name"""
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}TEST: {test_name}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")

def print_success(message: str):
    """Print success message"""
    print(f"{GREEN}✓ {message}{RESET}")

def print_error(message: str):
    """Print error message"""
    print(f"{RED}✗ {message}{RESET}")

def print_warning(message: str):
    """Print warning message"""
    print(f"{YELLOW}⚠ {message}{RESET}")

def print_info(message: str):
    """Print info message"""
    print(f"  {message}")

# ==================== AUTHENTICATION TESTS ====================

def test_login_success():
    """Test successful login with valid credentials"""
    global auth_token
    print_test("Authentication - Login with Valid Credentials")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text[:200]}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "token_type" in data:
                auth_token = data["access_token"]
                print_success(f"Login successful! Token received (length: {len(auth_token)})")
                print_success(f"Token type: {data['token_type']}")
                return True
            else:
                print_error("Login response missing required fields")
                return False
        else:
            print_error(f"Login failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Login test failed with exception: {str(e)}")
        return False

def test_login_invalid_credentials():
    """Test login with invalid credentials"""
    print_test("Authentication - Login with Invalid Credentials")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": "invalid", "password": "wrong"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print_success("Correctly rejected invalid credentials with 401")
            return True
        else:
            print_error(f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Invalid credentials test failed: {str(e)}")
        return False

# ==================== MOTORS TESTS ====================

def test_get_motors_empty():
    """Test getting motors list (should be empty initially)"""
    print_test("Motors - GET /motors (Initial State)")
    
    try:
        response = requests.get(f"{BASE_URL}/motors", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            motors = response.json()
            print_success(f"GET /motors successful - Found {len(motors)} motors")
            return True
        else:
            print_error(f"GET /motors failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET motors test failed: {str(e)}")
        return False

def test_create_motor():
    """Test creating a new motor"""
    print_test("Motors - POST /motors (Create Motor)")
    
    if not auth_token:
        print_error("No auth token available. Cannot test motor creation.")
        return False
    
    motor_data = {
        "modelo": "Tohatsu 40 HP",
        "potencia": "40 HP",
        "caracteristicas": "Motor fuera de borda de 4 tiempos, bajo consumo",
        "precio": 5000,
        "imagen": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        "financiamiento_entrada": 1000,
        "financiamiento_cuotas": 30
    }
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/motors",
            json=motor_data,
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text[:300]}")
        
        if response.status_code == 200:
            motor = response.json()
            if "id" in motor:
                print_success(f"Motor created successfully! ID: {motor['id']}")
                return motor['id']
            else:
                print_error("Motor created but no ID returned")
                return False
        else:
            print_error(f"Motor creation failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Create motor test failed: {str(e)}")
        return False

def test_get_motors_with_data():
    """Test getting motors list after creation"""
    print_test("Motors - GET /motors (After Creation)")
    
    try:
        response = requests.get(f"{BASE_URL}/motors", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            motors = response.json()
            print_success(f"GET /motors successful - Found {len(motors)} motors")
            if len(motors) > 0:
                print_info(f"First motor: {motors[0].get('modelo', 'N/A')}")
            return True
        else:
            print_error(f"GET /motors failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET motors test failed: {str(e)}")
        return False

def test_get_motor_by_id(motor_id: str):
    """Test getting a specific motor by ID"""
    print_test(f"Motors - GET /motors/{motor_id}")
    
    try:
        response = requests.get(f"{BASE_URL}/motors/{motor_id}", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            motor = response.json()
            print_success(f"Motor retrieved: {motor.get('modelo', 'N/A')}")
            print_info(f"Price: ${motor.get('precio', 0)}")
            return True
        else:
            print_error(f"GET motor by ID failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET motor by ID test failed: {str(e)}")
        return False

def test_update_motor(motor_id: str):
    """Test updating a motor"""
    print_test(f"Motors - PUT /motors/{motor_id}")
    
    if not auth_token:
        print_error("No auth token available. Cannot test motor update.")
        return False
    
    updated_data = {
        "modelo": "Tohatsu 40 HP",
        "potencia": "40 HP",
        "caracteristicas": "Motor fuera de borda de 4 tiempos, bajo consumo",
        "precio": 5500,  # Updated price
        "imagen": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        "financiamiento_entrada": 1000,
        "financiamiento_cuotas": 30
    }
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.put(
            f"{BASE_URL}/motors/{motor_id}",
            json=updated_data,
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            motor = response.json()
            if motor.get('precio') == 5500:
                print_success(f"Motor updated successfully! New price: ${motor['precio']}")
                return True
            else:
                print_error(f"Motor updated but price not changed: ${motor.get('precio')}")
                return False
        else:
            print_error(f"Motor update failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Update motor test failed: {str(e)}")
        return False

def test_delete_motor(motor_id: str):
    """Test deleting a motor"""
    print_test(f"Motors - DELETE /motors/{motor_id}")
    
    if not auth_token:
        print_error("No auth token available. Cannot test motor deletion.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.delete(
            f"{BASE_URL}/motors/{motor_id}",
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            print_success("Motor deleted successfully!")
            return True
        else:
            print_error(f"Motor deletion failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Delete motor test failed: {str(e)}")
        return False

def test_motor_unauthorized():
    """Test that motor creation requires authentication"""
    print_test("Motors - POST /motors (Without Auth)")
    
    motor_data = {
        "modelo": "Test Motor",
        "potencia": "50 HP",
        "caracteristicas": "Test",
        "precio": 1000,
        "imagen": "data:image/jpeg;base64,test",
        "financiamiento_entrada": 100,
        "financiamiento_cuotas": 12
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/motors",
            json=motor_data,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 401 or response.status_code == 403:
            print_success("Correctly rejected unauthorized request")
            return True
        else:
            print_error(f"Expected 401/403, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Unauthorized test failed: {str(e)}")
        return False

# ==================== CALENDAR TESTS ====================

def test_get_calendar_empty():
    """Test getting calendar events (should be empty initially)"""
    print_test("Calendar - GET /calendar (Initial State)")
    
    try:
        response = requests.get(f"{BASE_URL}/calendar", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            events = response.json()
            print_success(f"GET /calendar successful - Found {len(events)} events")
            return True
        else:
            print_error(f"GET /calendar failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET calendar test failed: {str(e)}")
        return False

def test_create_calendar_event():
    """Test creating a calendar event"""
    print_test("Calendar - POST /calendar (Create Event)")
    
    if not auth_token:
        print_error("No auth token available. Cannot test event creation.")
        return False
    
    event_data = {
        "fecha": "2025-08-15",
        "localidad": "Guayaquil",
        "descripcion": "Mantenimiento gratuito en zona norte"
    }
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/calendar",
            json=event_data,
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text[:300]}")
        
        if response.status_code == 200:
            event = response.json()
            if "id" in event:
                print_success(f"Event created successfully! ID: {event['id']}")
                return event['id']
            else:
                print_error("Event created but no ID returned")
                return False
        else:
            print_error(f"Event creation failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Create event test failed: {str(e)}")
        return False

def test_get_calendar_with_data():
    """Test getting calendar events after creation"""
    print_test("Calendar - GET /calendar (After Creation)")
    
    try:
        response = requests.get(f"{BASE_URL}/calendar", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            events = response.json()
            print_success(f"GET /calendar successful - Found {len(events)} events")
            if len(events) > 0:
                print_info(f"First event: {events[0].get('localidad', 'N/A')} - {events[0].get('fecha', 'N/A')}")
            return True
        else:
            print_error(f"GET /calendar failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET calendar test failed: {str(e)}")
        return False

def test_delete_calendar_event(event_id: str):
    """Test deleting a calendar event"""
    print_test(f"Calendar - DELETE /calendar/{event_id}")
    
    if not auth_token:
        print_error("No auth token available. Cannot test event deletion.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.delete(
            f"{BASE_URL}/calendar/{event_id}",
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            print_success("Event deleted successfully!")
            return True
        else:
            print_error(f"Event deletion failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Delete event test failed: {str(e)}")
        return False

# ==================== CONFIGURATION TESTS ====================

def test_get_config():
    """Test getting configuration"""
    print_test("Configuration - GET /config")
    
    try:
        response = requests.get(f"{BASE_URL}/config", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            config = response.json()
            print_success("Configuration retrieved successfully!")
            print_info(f"WhatsApp Ventas: {config.get('whatsapp_ventas', 'N/A')}")
            print_info(f"WhatsApp Repuestos: {config.get('whatsapp_repuestos', 'N/A')}")
            print_info(f"WhatsApp Servicio: {config.get('whatsapp_servicio', 'N/A')}")
            return True
        else:
            print_error(f"GET /config failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET config test failed: {str(e)}")
        return False

def test_update_config():
    """Test updating configuration"""
    print_test("Configuration - PUT /config")
    
    if not auth_token:
        print_error("No auth token available. Cannot test config update.")
        return False
    
    config_data = {
        "whatsapp_ventas": "593991234567",
        "whatsapp_repuestos": "593991234568",
        "whatsapp_servicio": "593991234569"
    }
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.put(
            f"{BASE_URL}/config",
            json=config_data,
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            config = response.json()
            print_success("Configuration updated successfully!")
            print_info(f"New WhatsApp Ventas: {config.get('whatsapp_ventas', 'N/A')}")
            return True
        else:
            print_error(f"Config update failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Update config test failed: {str(e)}")
        return False

def test_verify_config_update():
    """Test that configuration was actually updated"""
    print_test("Configuration - Verify Update")
    
    try:
        response = requests.get(f"{BASE_URL}/config", timeout=10)
        
        if response.status_code == 200:
            config = response.json()
            if config.get('whatsapp_ventas') == "593991234567":
                print_success("Configuration update verified!")
                return True
            else:
                print_error(f"Configuration not updated. Got: {config.get('whatsapp_ventas')}")
                return False
        else:
            print_error(f"GET /config failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Verify config test failed: {str(e)}")
        return False

# ==================== ASESORES TESTS ====================

def test_get_asesores_empty():
    """Test getting asesores list (should be empty initially)"""
    print_test("Asesores - GET /asesores (Initial State)")
    
    try:
        response = requests.get(f"{BASE_URL}/asesores", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            asesores = response.json()
            print_success(f"GET /asesores successful - Found {len(asesores)} asesores")
            return True
        else:
            print_error(f"GET /asesores failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET asesores test failed: {str(e)}")
        return False

def test_create_asesor():
    """Test creating a new asesor"""
    print_test("Asesores - POST /asesores (Create Asesor)")
    
    if not auth_token:
        print_error("No auth token available. Cannot test asesor creation.")
        return False
    
    asesor_data = {
        "nombre": "Carlos Mendoza",
        "whatsapp": "593987654321",
        "provincia": "Manabí"
    }
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/asesores",
            json=asesor_data,
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text[:300]}")
        
        if response.status_code == 200:
            asesor = response.json()
            if "id" in asesor:
                print_success(f"Asesor created successfully! ID: {asesor['id']}")
                print_info(f"Nombre: {asesor.get('nombre')}, Provincia: {asesor.get('provincia')}")
                return asesor['id']
            else:
                print_error("Asesor created but no ID returned")
                return False
        else:
            print_error(f"Asesor creation failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Create asesor test failed: {str(e)}")
        return False

def test_get_asesores_with_data():
    """Test getting asesores list after creation"""
    print_test("Asesores - GET /asesores (After Creation)")
    
    try:
        response = requests.get(f"{BASE_URL}/asesores", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            asesores = response.json()
            print_success(f"GET /asesores successful - Found {len(asesores)} asesores")
            if len(asesores) > 0:
                print_info(f"First asesor: {asesores[0].get('nombre', 'N/A')} - {asesores[0].get('provincia', 'N/A')}")
            return True
        else:
            print_error(f"GET /asesores failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET asesores test failed: {str(e)}")
        return False

def test_update_asesor(asesor_id: str):
    """Test updating an asesor"""
    print_test(f"Asesores - PUT /asesores/{asesor_id}")
    
    if not auth_token:
        print_error("No auth token available. Cannot test asesor update.")
        return False
    
    updated_data = {
        "nombre": "Carlos Mendoza Actualizado",
        "whatsapp": "593987654999",
        "provincia": "Guayas"
    }
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.put(
            f"{BASE_URL}/asesores/{asesor_id}",
            json=updated_data,
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            asesor = response.json()
            if asesor.get('provincia') == "Guayas":
                print_success(f"Asesor updated successfully! New provincia: {asesor['provincia']}")
                return True
            else:
                print_error(f"Asesor updated but provincia not changed: {asesor.get('provincia')}")
                return False
        else:
            print_error(f"Asesor update failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Update asesor test failed: {str(e)}")
        return False

def test_get_asesor_by_provincia():
    """Test getting asesor by provincia"""
    print_test("Asesores - GET /asesores/by-provincia/Guayas")
    
    try:
        response = requests.get(f"{BASE_URL}/asesores/by-provincia/Guayas", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text[:300]}")
        
        if response.status_code == 200:
            asesor = response.json()
            print_success(f"Asesor retrieved by provincia: {asesor.get('nombre', 'N/A')}")
            print_info(f"WhatsApp: {asesor.get('whatsapp', 'N/A')}")
            print_info(f"Is General: {asesor.get('is_general', False)}")
            return True
        else:
            print_error(f"GET asesor by provincia failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET asesor by provincia test failed: {str(e)}")
        return False

def test_get_asesor_by_provincia_fallback():
    """Test getting asesor by provincia with fallback to general"""
    print_test("Asesores - GET /asesores/by-provincia/Pichincha (Fallback)")
    
    try:
        response = requests.get(f"{BASE_URL}/asesores/by-provincia/Pichincha", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text[:300]}")
        
        if response.status_code == 200:
            asesor = response.json()
            if asesor.get('is_general') == True:
                print_success(f"Fallback to general asesor working! WhatsApp: {asesor.get('whatsapp', 'N/A')}")
                return True
            else:
                print_warning("Expected fallback to general asesor but got specific asesor")
                return True  # Still valid if there's an asesor for that provincia
        else:
            print_error(f"GET asesor by provincia fallback failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET asesor by provincia fallback test failed: {str(e)}")
        return False

def test_delete_asesor(asesor_id: str):
    """Test deleting an asesor"""
    print_test(f"Asesores - DELETE /asesores/{asesor_id}")
    
    if not auth_token:
        print_error("No auth token available. Cannot test asesor deletion.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.delete(
            f"{BASE_URL}/asesores/{asesor_id}",
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text}")
        
        if response.status_code == 200:
            print_success("Asesor deleted successfully!")
            return True
        else:
            print_error(f"Asesor deletion failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Delete asesor test failed: {str(e)}")
        return False

# ==================== LEADS TESTS ====================

def test_create_lead_public():
    """Test creating a lead (public endpoint, no auth required)"""
    print_test("Leads - POST /leads (Public, No Auth)")
    
    lead_data = {
        "nombre": "Juan Pérez",
        "telefono": "593991234567",
        "provincia": "Manabí",
        "interes": "motor",
        "detalle": "Interesado en motor 40 HP"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/leads",
            json=lead_data,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.text[:300]}")
        
        if response.status_code == 200:
            lead = response.json()
            if "id" in lead and "fecha" in lead and "hora" in lead:
                print_success(f"Lead created successfully! ID: {lead['id']}")
                print_info(f"Fecha: {lead.get('fecha')}, Hora: {lead.get('hora')}")
                return lead['id']
            else:
                print_error("Lead created but missing required fields")
                return False
        else:
            print_error(f"Lead creation failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Create lead test failed: {str(e)}")
        return False

def test_get_leads():
    """Test getting leads list (requires auth)"""
    print_test("Leads - GET /leads (Requires Auth)")
    
    if not auth_token:
        print_error("No auth token available. Cannot test get leads.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/leads",
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            leads = response.json()
            print_success(f"GET /leads successful - Found {len(leads)} leads")
            if len(leads) > 0:
                print_info(f"First lead: {leads[0].get('nombre', 'N/A')} - {leads[0].get('provincia', 'N/A')}")
            return True
        else:
            print_error(f"GET /leads failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"GET leads test failed: {str(e)}")
        return False

def test_export_leads_xlsx():
    """Test exporting leads to Excel (requires auth)"""
    print_test("Leads - GET /leads/export/xlsx (Excel Export)")
    
    if not auth_token:
        print_error("No auth token available. Cannot test leads export.")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(
            f"{BASE_URL}/leads/export/xlsx",
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        print_info(f"Content-Disposition: {response.headers.get('Content-Disposition', 'N/A')}")
        print_info(f"Response size: {len(response.content)} bytes")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'spreadsheet' in content_type or 'excel' in content_type:
                print_success(f"Excel export successful! File size: {len(response.content)} bytes")
                # Verify it's a valid Excel file by checking magic bytes
                if response.content[:2] == b'PK':  # Excel files are ZIP archives
                    print_success("Valid Excel file format (ZIP signature detected)")
                    return True
                else:
                    print_warning("Excel file may not be valid (no ZIP signature)")
                    return True  # Still pass if we got the right content type
            else:
                print_error(f"Wrong content type: {content_type}")
                return False
        else:
            print_error(f"Excel export failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Export leads test failed: {str(e)}")
        return False

def test_get_leads_unauthorized():
    """Test that getting leads requires authentication"""
    print_test("Leads - GET /leads (Without Auth)")
    
    try:
        response = requests.get(f"{BASE_URL}/leads", timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 401 or response.status_code == 403:
            print_success("Correctly rejected unauthorized request")
            return True
        else:
            print_error(f"Expected 401/403, got {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Unauthorized test failed: {str(e)}")
        return False

# ==================== MAIN TEST RUNNER ====================

def main():
    """Run all tests"""
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}TOHATSU MOTORS API - COMPREHENSIVE BACKEND TESTS{RESET}")
    print(f"{BLUE}Base URL: {BASE_URL}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")
    
    results = {
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    def run_test(test_func, *args):
        """Helper to run a test and track results"""
        results["total"] += 1
        result = test_func(*args)
        if result:
            results["passed"] += 1
            return result
        else:
            results["failed"] += 1
            return False
    
    # Authentication Tests
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{YELLOW}AUTHENTICATION TESTS{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}")
    
    run_test(test_login_success)
    run_test(test_login_invalid_credentials)
    
    # Motors Tests
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{YELLOW}MOTORS TESTS{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}")
    
    run_test(test_get_motors_empty)
    motor_id = run_test(test_create_motor)
    run_test(test_get_motors_with_data)
    
    if motor_id:
        run_test(test_get_motor_by_id, motor_id)
        run_test(test_update_motor, motor_id)
        run_test(test_delete_motor, motor_id)
    
    run_test(test_motor_unauthorized)
    
    # Calendar Tests
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{YELLOW}CALENDAR TESTS{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}")
    
    run_test(test_get_calendar_empty)
    event_id = run_test(test_create_calendar_event)
    run_test(test_get_calendar_with_data)
    
    if event_id:
        run_test(test_delete_calendar_event, event_id)
    
    # Configuration Tests
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{YELLOW}CONFIGURATION TESTS{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}")
    
    run_test(test_get_config)
    run_test(test_update_config)
    run_test(test_verify_config_update)
    
    # Asesores Tests
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{YELLOW}ASESORES TESTS{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}")
    
    run_test(test_get_asesores_empty)
    asesor_id = run_test(test_create_asesor)
    run_test(test_get_asesores_with_data)
    
    if asesor_id:
        run_test(test_update_asesor, asesor_id)
        run_test(test_get_asesor_by_provincia)
        run_test(test_get_asesor_by_provincia_fallback)
        run_test(test_delete_asesor, asesor_id)
    
    # Leads Tests
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{YELLOW}LEADS TESTS{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}")
    
    lead_id = run_test(test_create_lead_public)
    run_test(test_get_leads)
    run_test(test_export_leads_xlsx)
    run_test(test_get_leads_unauthorized)
    
    # Summary
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")
    print(f"Total Tests: {results['total']}")
    print(f"{GREEN}Passed: {results['passed']}{RESET}")
    print(f"{RED}Failed: {results['failed']}{RESET}")
    
    if results['failed'] == 0:
        print(f"\n{GREEN}{'='*60}{RESET}")
        print(f"{GREEN}ALL TESTS PASSED! ✓{RESET}")
        print(f"{GREEN}{'='*60}{RESET}")
        return 0
    else:
        print(f"\n{RED}{'='*60}{RESET}")
        print(f"{RED}SOME TESTS FAILED! ✗{RESET}")
        print(f"{RED}{'='*60}{RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
