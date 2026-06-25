#!/usr/bin/env python3
"""
API Connectivity Test for External Deployment (Vercel)
Tests backend API accessibility and CORS configuration
"""

import requests
import sys

# Backend URL
BASE_URL = "https://outboard-motors.preview.emergentagent.com/api"

# Simulated external origin (like Vercel deployment)
EXTERNAL_ORIGIN = "https://tohatsu-exan.vercel.app"

# Color codes
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def print_test(test_name: str):
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}TEST: {test_name}{RESET}")
    print(f"{BLUE}{'='*70}{RESET}")

def print_success(message: str):
    print(f"{GREEN}✓ {message}{RESET}")

def print_error(message: str):
    print(f"{RED}✗ {message}{RESET}")

def print_info(message: str):
    print(f"  {message}")

def test_cors_preflight():
    """Test CORS preflight request (OPTIONS)"""
    print_test("CORS - Preflight Request (OPTIONS)")
    
    try:
        headers = {
            'Origin': EXTERNAL_ORIGIN,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'content-type'
        }
        
        response = requests.options(
            f"{BASE_URL}/motors",
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'NOT SET')}")
        print_info(f"Access-Control-Allow-Methods: {response.headers.get('Access-Control-Allow-Methods', 'NOT SET')}")
        print_info(f"Access-Control-Allow-Headers: {response.headers.get('Access-Control-Allow-Headers', 'NOT SET')}")
        
        # Check if CORS headers are present
        allow_origin = response.headers.get('Access-Control-Allow-Origin')
        allow_methods = response.headers.get('Access-Control-Allow-Methods')
        
        if allow_origin and (allow_origin == '*' or EXTERNAL_ORIGIN in allow_origin):
            print_success(f"CORS preflight successful! Origin allowed: {allow_origin}")
            if allow_methods:
                print_success(f"Allowed methods: {allow_methods}")
            return True
        else:
            print_error(f"CORS preflight failed. Origin header: {allow_origin}")
            return False
            
    except Exception as e:
        print_error(f"CORS preflight test failed: {str(e)}")
        return False

def test_get_motors_with_cors():
    """Test GET /api/motors with CORS headers"""
    print_test("API Connectivity - GET /api/motors (with CORS)")
    
    try:
        headers = {
            'Origin': EXTERNAL_ORIGIN
        }
        
        response = requests.get(
            f"{BASE_URL}/motors",
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'NOT SET')}")
        print_info(f"Response length: {len(response.text)} bytes")
        
        if response.status_code == 200:
            motors = response.json()
            print_success(f"GET /api/motors successful! Found {len(motors)} motors")
            
            # Check CORS header
            allow_origin = response.headers.get('Access-Control-Allow-Origin')
            if allow_origin and (allow_origin == '*' or EXTERNAL_ORIGIN in allow_origin):
                print_success(f"CORS header present: {allow_origin}")
            else:
                print_error(f"CORS header missing or incorrect: {allow_origin}")
                return False
            
            return True
        else:
            print_error(f"GET /api/motors failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"GET motors test failed: {str(e)}")
        return False

def test_get_calendar_with_cors():
    """Test GET /api/calendar with CORS headers"""
    print_test("API Connectivity - GET /api/calendar (with CORS)")
    
    try:
        headers = {
            'Origin': EXTERNAL_ORIGIN
        }
        
        response = requests.get(
            f"{BASE_URL}/calendar",
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'NOT SET')}")
        
        if response.status_code == 200:
            events = response.json()
            print_success(f"GET /api/calendar successful! Found {len(events)} events")
            
            # Check CORS header
            allow_origin = response.headers.get('Access-Control-Allow-Origin')
            if allow_origin and (allow_origin == '*' or EXTERNAL_ORIGIN in allow_origin):
                print_success(f"CORS header present: {allow_origin}")
            else:
                print_error(f"CORS header missing or incorrect: {allow_origin}")
                return False
            
            return True
        else:
            print_error(f"GET /api/calendar failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"GET calendar test failed: {str(e)}")
        return False

def test_get_config_with_cors():
    """Test GET /api/config with CORS headers"""
    print_test("API Connectivity - GET /api/config (with CORS)")
    
    try:
        headers = {
            'Origin': EXTERNAL_ORIGIN
        }
        
        response = requests.get(
            f"{BASE_URL}/config",
            headers=headers,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'NOT SET')}")
        
        if response.status_code == 200:
            config = response.json()
            print_success(f"GET /api/config successful!")
            print_info(f"WhatsApp Ventas: {config.get('whatsapp_ventas', 'N/A')}")
            print_info(f"WhatsApp Repuestos: {config.get('whatsapp_repuestos', 'N/A')}")
            print_info(f"WhatsApp Servicio: {config.get('whatsapp_servicio', 'N/A')}")
            
            # Check CORS header
            allow_origin = response.headers.get('Access-Control-Allow-Origin')
            if allow_origin and (allow_origin == '*' or EXTERNAL_ORIGIN in allow_origin):
                print_success(f"CORS header present: {allow_origin}")
            else:
                print_error(f"CORS header missing or incorrect: {allow_origin}")
                return False
            
            return True
        else:
            print_error(f"GET /api/config failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"GET config test failed: {str(e)}")
        return False

def test_backend_health():
    """Test basic backend health/connectivity"""
    print_test("Backend Health Check")
    
    try:
        # Try to reach the backend
        response = requests.get(
            f"{BASE_URL}/motors",
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Backend URL: {BASE_URL}")
        
        if response.status_code == 200:
            print_success("Backend is accessible and responding!")
            return True
        else:
            print_error(f"Backend returned status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend - Connection refused")
        return False
    except requests.exceptions.Timeout:
        print_error("Backend request timed out")
        return False
    except Exception as e:
        print_error(f"Backend health check failed: {str(e)}")
        return False

def main():
    """Run all API connectivity tests"""
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}API CONNECTIVITY TEST FOR EXTERNAL DEPLOYMENT (VERCEL){RESET}")
    print(f"{BLUE}Backend URL: {BASE_URL}{RESET}")
    print(f"{BLUE}Simulated Origin: {EXTERNAL_ORIGIN}{RESET}")
    print(f"{BLUE}{'='*70}{RESET}")
    
    results = {
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    def run_test(test_func):
        """Helper to run a test and track results"""
        results["total"] += 1
        result = test_func()
        if result:
            results["passed"] += 1
        else:
            results["failed"] += 1
        return result
    
    # Run tests
    run_test(test_backend_health)
    run_test(test_cors_preflight)
    run_test(test_get_motors_with_cors)
    run_test(test_get_calendar_with_cors)
    run_test(test_get_config_with_cors)
    
    # Summary
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print(f"{BLUE}{'='*70}{RESET}")
    print(f"Total Tests: {results['total']}")
    print(f"{GREEN}Passed: {results['passed']}{RESET}")
    print(f"{RED}Failed: {results['failed']}{RESET}")
    
    if results['failed'] == 0:
        print(f"\n{GREEN}{'='*70}{RESET}")
        print(f"{GREEN}ALL API CONNECTIVITY TESTS PASSED! ✓{RESET}")
        print(f"{GREEN}Backend is ready for external deployment (Vercel){RESET}")
        print(f"{GREEN}{'='*70}{RESET}")
        return 0
    else:
        print(f"\n{RED}{'='*70}{RESET}")
        print(f"{RED}SOME TESTS FAILED! ✗{RESET}")
        print(f"{RED}{'='*70}{RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
