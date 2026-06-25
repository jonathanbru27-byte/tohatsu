"""
Seed script para cargar motores Tohatsu en la base de datos
Ejecutar: python seed_motors.py
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Conexión a MongoDB local
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Catálogo completo de motores Tohatsu
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
        "precio": 1850000,
        "imagen": "https://images.pexels.com/photos/28170856/pexels-photo-28170856.jpeg?auto=compress&cs=tinysrgb&w=400",
        "financiamiento_entrada": 370000,
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
        "precio": 3200000,
        "imagen": "https://images.pexels.com/photos/30094170/pexels-photo-30094170.jpeg?auto=compress&cs=tinysrgb&w=400",
        "financiamiento_entrada": 640000,
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
        "precio": 4500000,
        "imagen": "https://images.pexels.com/photos/9592461/pexels-photo-9592461.jpeg?auto=compress&cs=tinysrgb&w=400",
        "financiamiento_entrada": 900000,
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
        "precio": 3800000,
        "imagen": "https://images.pexels.com/photos/16135856/pexels-photo-16135856.jpeg?auto=compress&cs=tinysrgb&w=400",
        "financiamiento_entrada": 760000,
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
        "precio": 6200000,
        "imagen": "https://images.pexels.com/photos/32967413/pexels-photo-32967413.jpeg?auto=compress&cs=tinysrgb&w=400",
        "financiamiento_entrada": 1240000,
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
        "precio": 8500000,
        "imagen": "https://images.pexels.com/photos/14815453/pexels-photo-14815453.jpeg?auto=compress&cs=tinysrgb&w=400",
        "financiamiento_entrada": 1700000,
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
        "precio": 11500000,
        "imagen": "https://images.pexels.com/photos/8669061/pexels-photo-8669061.jpeg?auto=compress&cs=tinysrgb&w=400",
        "financiamiento_entrada": 2300000,
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
        "precio": 14800000,
        "imagen": "https://images.pexels.com/photos/9381649/pexels-photo-9381649.jpeg?auto=compress&cs=tinysrgb&w=400",
        "financiamiento_entrada": 2960000,
        "financiamiento_cuotas": 48
    }
]

def seed_motors():
    """Inserta los motores Tohatsu en la base de datos"""
    print(f"Conectando a MongoDB: {MONGO_URL[:50]}...")
    
    try:
        # Usar MongoDB desde variable de entorno
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
        
        # Verificar conexión
        client.admin.command('ping')
        print("✅ Conexión exitosa a MongoDB local")
        
        # Limpiar colección existente
        result = db.motors.delete_many({})
        print(f"🗑️  Eliminados {result.deleted_count} motores existentes")
        
        # Insertar nuevos motores
        result = db.motors.insert_many(TOHATSU_MOTORS)
        print(f"✅ Insertados {len(result.inserted_ids)} motores Tohatsu")
        
        # Mostrar resumen
        print("\n📋 Motores cargados:")
        print("-" * 60)
        for motor in TOHATSU_MOTORS:
            precio_formatted = f"${motor['precio']:,.0f}".replace(",", ".")
            print(f"  • {motor['modelo']:<20} | {motor['potencia']:<8} | {precio_formatted}")
        print("-" * 60)
        
        # Verificar
        count = db.motors.count_documents({})
        print(f"\n✅ Total de motores en base de datos: {count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = seed_motors()
    sys.exit(0 if success else 1)
