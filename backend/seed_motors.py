"""
Seed script para cargar motores Tohatsu en MongoDB Atlas
Ejecutar: python seed_motors.py

Para ejecutar en Render, configura la variable MONGO_URL con tu connection string de Atlas
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Conexión a MongoDB (funciona con local o Atlas)
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'tohatsu_db')

# Catálogo completo de motores Tohatsu con precios en USD
TOHATSU_MOTORS = [
    {
        "modelo": "Tohatsu M3.5B",
        "potencia": "3.5 HP",
        "hp_value": 3,
        "tipo": "2 Tiempos",
        "cilindrada": "74.6 cc",
        "peso_seco": "13 kg",
        "sistema": "Arranque manual, CDI",
        "badge_text": "PORTÁTIL",
        "caracteristicas": "Motor ultraligero ideal para botes inflables y pequeñas embarcaciones. Sistema de enfriamiento por agua. Tanque de combustible integrado de 1.0L. Altura de popa corta (381mm). Ideal para pesca en lagos y ríos.",
        "precio": 1250.00,
        "imagen": "https://images.pexels.com/photos/28170856/pexels-photo-28170856.jpeg?auto=compress&cs=tinysrgb&w=600",
        "financiamiento_entrada": 250.00,
        "financiamiento_cuotas": 24
    },
    {
        "modelo": "Tohatsu MFS6",
        "potencia": "6 HP",
        "hp_value": 6,
        "tipo": "4 Tiempos",
        "cilindrada": "138 cc",
        "peso_seco": "26 kg",
        "sistema": "Arranque manual, EFI disponible",
        "badge_text": "ECO FRIENDLY",
        "caracteristicas": "Motor de 4 tiempos silencioso y económico. Bajo consumo de combustible. Sistema de lubricación por cárter húmedo. Tanque externo de 12L incluido. Altura de popa corta/larga disponible. Perfecto para veleros y botes auxiliares.",
        "precio": 2150.00,
        "imagen": "https://images.pexels.com/photos/30094170/pexels-photo-30094170.jpeg?auto=compress&cs=tinysrgb&w=600",
        "financiamiento_entrada": 430.00,
        "financiamiento_cuotas": 30
    },
    {
        "modelo": "Tohatsu MFS9.9",
        "potencia": "9.9 HP",
        "hp_value": 9,
        "tipo": "4 Tiempos",
        "cilindrada": "209 cc",
        "peso_seco": "38 kg",
        "sistema": "Arranque manual/eléctrico, EFI",
        "badge_text": "BEST SELLER",
        "caracteristicas": "El motor más vendido de la gama. Inyección electrónica EFI para máxima eficiencia. Alternador de 12V/6A. Sistema de alerta de sobrecalentamiento. Ideal para botes de aluminio y fibra hasta 4m. No requiere licencia náutica en muchos países.",
        "precio": 3200.00,
        "imagen": "https://images.pexels.com/photos/9592461/pexels-photo-9592461.jpeg?auto=compress&cs=tinysrgb&w=600",
        "financiamiento_entrada": 640.00,
        "financiamiento_cuotas": 30
    },
    {
        "modelo": "Tohatsu M9.8",
        "potencia": "9.8 HP",
        "hp_value": 9,
        "tipo": "2 Tiempos",
        "cilindrada": "169 cc",
        "peso_seco": "26 kg",
        "sistema": "Arranque manual, CDI",
        "badge_text": "CLÁSICO",
        "caracteristicas": "Motor 2 tiempos de probada confiabilidad. Relación peso-potencia excepcional. Sistema de mezcla de aceite automático opcional. Diseño compacto y fácil mantenimiento. Popular entre pescadores profesionales.",
        "precio": 2650.00,
        "imagen": "https://images.pexels.com/photos/16135856/pexels-photo-16135856.jpeg?auto=compress&cs=tinysrgb&w=600",
        "financiamiento_entrada": 530.00,
        "financiamiento_cuotas": 30
    },
    {
        "modelo": "Tohatsu MX18",
        "potencia": "18 HP",
        "hp_value": 18,
        "tipo": "4 Tiempos EFI",
        "cilindrada": "333 cc",
        "peso_seco": "45 kg",
        "sistema": "Arranque eléctrico, EFI, Power Trim",
        "badge_text": "NUEVO 2025",
        "caracteristicas": "Nueva generación de motores Tohatsu. Sistema EFI de última generación. Power Trim & Tilt eléctrico. Alternador de 12V/12A. Sistema de diagnóstico digital. Garantía extendida de 5 años. Ideal para botes de pesca deportiva.",
        "precio": 4350.00,
        "imagen": "https://images.pexels.com/photos/32967413/pexels-photo-32967413.jpeg?auto=compress&cs=tinysrgb&w=600",
        "financiamiento_entrada": 870.00,
        "financiamiento_cuotas": 36
    },
    {
        "modelo": "Tohatsu MX30",
        "potencia": "30 HP",
        "hp_value": 30,
        "tipo": "4 Tiempos EFI",
        "cilindrada": "526 cc",
        "peso_seco": "72 kg",
        "sistema": "Arranque eléctrico, EFI, Power Trim",
        "badge_text": "JAPAN TECH",
        "caracteristicas": "Motor de media potencia con tecnología japonesa de punta. Inyección multipunto. Sistema de enfriamiento de doble circuito. Caja de cambios Forward-Neutral-Reverse. Compatible con control remoto. Excelente para lanchas de hasta 5.5m.",
        "precio": 5850.00,
        "imagen": "https://images.pexels.com/photos/14815453/pexels-photo-14815453.jpeg?auto=compress&cs=tinysrgb&w=600",
        "financiamiento_entrada": 1170.00,
        "financiamiento_cuotas": 36
    },
    {
        "modelo": "Tohatsu MFS30",
        "potencia": "30 HP",
        "hp_value": 30,
        "tipo": "4 Tiempos",
        "cilindrada": "526 cc",
        "peso_seco": "68 kg",
        "sistema": "Arranque manual/eléctrico, Carburador",
        "badge_text": "CONFIABLE",
        "caracteristicas": "Motor 4 tiempos de la serie MFS. Sistema de carburador de alto rendimiento. Excelente relación calidad-precio. Bajo mantenimiento. Alternador de 12V/10A. Power Tilt manual. Ideal para uso recreativo y pesca artesanal.",
        "precio": 5200.00,
        "imagen": "https://images.pexels.com/photos/847393/pexels-photo-847393.jpeg?auto=compress&cs=tinysrgb&w=600",
        "financiamiento_entrada": 1040.00,
        "financiamiento_cuotas": 36
    },
    {
        "modelo": "Tohatsu MX40",
        "potencia": "40 HP",
        "hp_value": 40,
        "tipo": "4 Tiempos EFI",
        "cilindrada": "866 cc",
        "peso_seco": "87 kg",
        "sistema": "Arranque eléctrico, EFI, Power Trim & Tilt",
        "badge_text": "PRO SERIES",
        "caracteristicas": "Motor profesional para uso intensivo. 3 cilindros en línea. Sistema TLDI de inyección directa disponible. Alternador de alta capacidad 12V/18A. Sistema de alerta múltiple (temperatura, presión de aceite, RPM). Ideal para pesca comercial y turismo náutico.",
        "precio": 7950.00,
        "imagen": "https://images.pexels.com/photos/8669061/pexels-photo-8669061.jpeg?auto=compress&cs=tinysrgb&w=600",
        "financiamiento_entrada": 1590.00,
        "financiamiento_cuotas": 48
    },
    {
        "modelo": "Tohatsu MX50",
        "potencia": "50 HP",
        "hp_value": 50,
        "tipo": "4 Tiempos EFI",
        "cilindrada": "866 cc",
        "peso_seco": "93 kg",
        "sistema": "Arranque eléctrico, EFI, Power Trim & Tilt, TLDI",
        "badge_text": "PREMIUM",
        "caracteristicas": "Tope de gama de la serie MX. Máxima potencia y eficiencia. Sistema TLDI de inyección directa estratificada. Menor consumo y emisiones. Tecnología Variable Valve Timing. Control digital con pantalla multifunción opcional. Garantía premium de 5 años. Para embarcaciones de hasta 6.5m.",
        "precio": 9500.00,
        "imagen": "https://images.pexels.com/photos/9381649/pexels-photo-9381649.jpeg?auto=compress&cs=tinysrgb&w=600",
        "financiamiento_entrada": 1900.00,
        "financiamiento_cuotas": 48
    }
]

def seed_motors():
    """Inserta los motores Tohatsu en la base de datos"""
    print(f"🔌 Conectando a MongoDB...")
    print(f"   URL: {MONGO_URL[:50]}...")
    print(f"   DB: {DB_NAME}")
    
    try:
        # Conectar a MongoDB
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=10000)
        db = client[DB_NAME]
        
        # Verificar conexión
        client.admin.command('ping')
        print("✅ Conexión exitosa a MongoDB")
        
        # Limpiar colección existente
        result = db.motors.delete_many({})
        print(f"🗑️  Eliminados {result.deleted_count} motores existentes")
        
        # Insertar nuevos motores
        result = db.motors.insert_many(TOHATSU_MOTORS)
        print(f"✅ Insertados {len(result.inserted_ids)} motores Tohatsu")
        
        # Mostrar resumen
        print("\n📋 Motores cargados:")
        print("-" * 65)
        for motor in TOHATSU_MOTORS:
            print(f"  • {motor['modelo']:<20} | {motor['potencia']:<8} | ${motor['precio']:,.2f}")
        print("-" * 65)
        
        # Verificar
        count = db.motors.count_documents({})
        print(f"\n✅ Total de motores en base de datos: {count}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def seed_admin():
    """Crea el usuario admin si no existe"""
    from passlib.context import CryptContext
    
    print("\n👤 Verificando usuario admin...")
    
    try:
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=10000)
        db = client[DB_NAME]
        
        admin = db.admins.find_one({"username": "admin"})
        if not admin:
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            db.admins.insert_one({
                "username": "admin",
                "password": pwd_context.hash("admin123")
            })
            print("✅ Usuario admin creado (admin/admin123)")
        else:
            print("✅ Usuario admin ya existe")
        
        client.close()
        return True
    except Exception as e:
        print(f"❌ Error creando admin: {e}")
        return False

def seed_config():
    """Crea la configuración inicial"""
    print("\n⚙️  Verificando configuración...")
    
    try:
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=10000)
        db = client[DB_NAME]
        
        config = db.configuracion.find_one({})
        if not config:
            db.configuracion.insert_one({
                "whatsapp_ventas": "593999999999",
                "whatsapp_repuestos": "593988888888",
                "whatsapp_servicio": "593977777777"
            })
            print("✅ Configuración inicial creada")
        else:
            print("✅ Configuración ya existe")
        
        client.close()
        return True
    except Exception as e:
        print(f"❌ Error creando configuración: {e}")
        return False

if __name__ == "__main__":
    print("=" * 65)
    print("🚤 TOHATSU MOTORS - Seed Script")
    print("=" * 65)
    
    success = seed_motors()
    seed_admin()
    seed_config()
    
    print("\n" + "=" * 65)
    if success:
        print("✅ Seed completado exitosamente!")
    else:
        print("❌ Seed falló")
    print("=" * 65)
    
    sys.exit(0 if success else 1)
