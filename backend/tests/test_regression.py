"""Regression tests for motors, calendar, repuestos, config."""
import uuid
import pytest


class TestMotorsRegression:
    def test_list_motors(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/motors", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_motors_crud_flow(self, api_client, base_url, auth_headers):
        payload = {
            "modelo": f"TEST_Motor_{uuid.uuid4().hex[:6]}",
            "potencia": "9.9 HP",
            "hp_value": 9,
            "precio": 1234.5,
            "imagen": "",
            "financiamiento_entrada": 200.0,
        }
        r = api_client.post(
            f"{base_url}/api/motors", json=payload, headers=auth_headers, timeout=15
        )
        assert r.status_code == 200, r.text
        motor = r.json()
        mid = motor["id"]
        assert motor["modelo"] == payload["modelo"]

        # GET by id
        rg = api_client.get(f"{base_url}/api/motors/{mid}", timeout=15)
        assert rg.status_code == 200
        assert rg.json()["modelo"] == payload["modelo"]

        # UPDATE
        upd = {**payload, "modelo": payload["modelo"] + "_UPD", "hp_value": 15}
        ru = api_client.put(
            f"{base_url}/api/motors/{mid}", json=upd, headers=auth_headers, timeout=15
        )
        assert ru.status_code == 200
        assert ru.json()["hp_value"] == 15

        # DELETE
        rd = api_client.delete(
            f"{base_url}/api/motors/{mid}", headers=auth_headers, timeout=15
        )
        assert rd.status_code == 200

        # Verify gone
        rg2 = api_client.get(f"{base_url}/api/motors/{mid}", timeout=15)
        assert rg2.status_code in (404, 400)


class TestCalendarRegression:
    def test_list_calendar(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/calendar", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_calendar_crud_flow(self, api_client, base_url, auth_headers):
        payload = {
            "titulo": "TEST_Event",
            "fecha": "2026-12-31",
            "hora": "10:00",
            "localidad": "TEST_City",
            "descripcion": "TEST evento",
        }
        r = api_client.post(
            f"{base_url}/api/calendar", json=payload, headers=auth_headers, timeout=15
        )
        assert r.status_code == 200, r.text
        eid = r.json()["id"]

        upd = {**payload, "titulo": "TEST_Event_UPD"}
        ru = api_client.put(
            f"{base_url}/api/calendar/{eid}", json=upd, headers=auth_headers, timeout=15
        )
        assert ru.status_code == 200
        assert ru.json()["titulo"] == "TEST_Event_UPD"

        rd = api_client.delete(
            f"{base_url}/api/calendar/{eid}", headers=auth_headers, timeout=15
        )
        assert rd.status_code == 200


class TestRepuestosRegression:
    def test_list_repuestos(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/repuestos", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0  # seeded

    def test_repuestos_crud(self, api_client, base_url, auth_headers):
        payload = {
            "nombre": f"TEST_Rep_{uuid.uuid4().hex[:6]}",
            "descripcion": "TEST",
            "precio": 9.99,
            "categoria": "Test",
            "stock": 5,
        }
        r = api_client.post(
            f"{base_url}/api/repuestos", json=payload, headers=auth_headers, timeout=15
        )
        assert r.status_code == 200, r.text
        rid = r.json()["id"]
        rd = api_client.delete(
            f"{base_url}/api/repuestos/{rid}", headers=auth_headers, timeout=15
        )
        assert rd.status_code == 200


class TestConfigRegression:
    def test_get_config(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/config", timeout=15)
        assert r.status_code == 200
        data = r.json()
        for k in ("whatsapp_ventas", "whatsapp_repuestos", "whatsapp_servicio"):
            assert k in data and data[k]
