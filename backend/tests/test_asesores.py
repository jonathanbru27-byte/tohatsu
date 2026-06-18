"""Tests for /api/asesores CRUD + by-provincia fallback."""
import pytest
import uuid


@pytest.fixture(scope="module")
def created_asesor_ids():
    return []


class TestAsesoresAuth:
    def test_create_asesor_requires_auth(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/asesores",
            json={"nombre": "TEST X", "whatsapp": "593900000000", "provincia": "Guayas"},
            timeout=15,
        )
        # HTTPBearer returns 403 when no credentials are provided
        assert r.status_code in (401, 403), r.text

    def test_update_asesor_requires_auth(self, api_client, base_url):
        r = api_client.put(
            f"{base_url}/api/asesores/000000000000000000000000",
            json={"nombre": "X", "whatsapp": "0", "provincia": "Guayas"},
            timeout=15,
        )
        assert r.status_code in (401, 403)

    def test_delete_asesor_requires_auth(self, api_client, base_url):
        r = api_client.delete(
            f"{base_url}/api/asesores/000000000000000000000000",
            timeout=15,
        )
        assert r.status_code in (401, 403)


class TestAsesoresCRUD:
    def test_list_asesores_public(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/asesores", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_asesor(self, api_client, base_url, auth_headers, created_asesor_ids):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "nombre": f"TEST_Asesor_{unique}",
            "whatsapp": "593911223344",
            "provincia": "Pastaza",  # unlikely to collide
        }
        r = api_client.post(
            f"{base_url}/api/asesores", json=payload, headers=auth_headers, timeout=15
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["nombre"] == payload["nombre"]
        assert data["whatsapp"] == payload["whatsapp"]
        assert data["provincia"] == payload["provincia"]
        assert data.get("id")
        created_asesor_ids.append(data["id"])

        # Verify persistence via GET list
        r2 = api_client.get(f"{base_url}/api/asesores", timeout=15)
        assert r2.status_code == 200
        ids = [a["id"] for a in r2.json()]
        assert data["id"] in ids

    def test_update_asesor(self, api_client, base_url, auth_headers, created_asesor_ids):
        assert created_asesor_ids, "No asesor created"
        asesor_id = created_asesor_ids[0]
        new_payload = {
            "nombre": "TEST_Asesor_Updated",
            "whatsapp": "593955667788",
            "provincia": "Napo",
        }
        r = api_client.put(
            f"{base_url}/api/asesores/{asesor_id}",
            json=new_payload,
            headers=auth_headers,
            timeout=15,
        )
        assert r.status_code == 200, r.text
        assert r.json()["nombre"] == "TEST_Asesor_Updated"
        assert r.json()["provincia"] == "Napo"

        # Verify GET reflects update
        r2 = api_client.get(f"{base_url}/api/asesores", timeout=15)
        updated = next((a for a in r2.json() if a["id"] == asesor_id), None)
        assert updated is not None
        assert updated["nombre"] == "TEST_Asesor_Updated"
        assert updated["provincia"] == "Napo"


class TestAsesoresByProvincia:
    def test_by_provincia_specific_match(self, api_client, base_url, auth_headers, created_asesor_ids):
        """Create an asesor for a unique provincia and verify by-provincia returns it with is_general:false."""
        unique_prov = "Zamora Chinchipe"
        # Clean: delete any existing for that provincia (best-effort)
        listing = api_client.get(f"{base_url}/api/asesores", timeout=15).json()
        for a in listing:
            if a.get("provincia") == unique_prov:
                api_client.delete(
                    f"{base_url}/api/asesores/{a['id']}", headers=auth_headers, timeout=15
                )

        unique = uuid.uuid4().hex[:8]
        payload = {
            "nombre": f"TEST_Zamora_{unique}",
            "whatsapp": "593912345678",
            "provincia": unique_prov,
        }
        c = api_client.post(
            f"{base_url}/api/asesores", json=payload, headers=auth_headers, timeout=15
        )
        assert c.status_code == 200
        created_asesor_ids.append(c.json()["id"])

        r = api_client.get(
            f"{base_url}/api/asesores/by-provincia/{unique_prov}", timeout=15
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("is_general") is False
        assert data.get("provincia") == unique_prov
        assert data.get("whatsapp") == payload["whatsapp"]
        assert data.get("nombre") == payload["nombre"]

    def test_by_provincia_fallback_general(self, api_client, base_url):
        """When no asesor matches, fallback to whatsapp_ventas with is_general:true."""
        # Use a provincia name that no asesor would have
        nonexistent = f"TEST_ProvNonExist_{uuid.uuid4().hex[:6]}"
        r = api_client.get(
            f"{base_url}/api/asesores/by-provincia/{nonexistent}", timeout=15
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("is_general") is True
        assert data.get("provincia") == "General"
        assert data.get("whatsapp")  # non-empty whatsapp_ventas

        # Cross-check with /api/config
        cfg = api_client.get(f"{base_url}/api/config", timeout=15).json()
        assert data["whatsapp"] == cfg["whatsapp_ventas"]


class TestAsesoresCleanup:
    def test_delete_asesores(self, api_client, base_url, auth_headers, created_asesor_ids):
        for asesor_id in list(created_asesor_ids):
            r = api_client.delete(
                f"{base_url}/api/asesores/{asesor_id}",
                headers=auth_headers,
                timeout=15,
            )
            assert r.status_code == 200, r.text
            assert r.json().get("message")

        # Verify deletion
        listing = api_client.get(f"{base_url}/api/asesores", timeout=15).json()
        remaining_ids = {a["id"] for a in listing}
        for asesor_id in created_asesor_ids:
            assert asesor_id not in remaining_ids
        created_asesor_ids.clear()
