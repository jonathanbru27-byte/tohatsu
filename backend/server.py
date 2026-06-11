from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "tohatsu_secret_key_2025_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class Motor(BaseModel):
    id: Optional[str] = None
    modelo: str
    potencia: str
    caracteristicas: str
    precio: float
    imagen: str  # base64
    financiamiento_entrada: float
    financiamiento_cuotas: int = 30

class MotorCreate(BaseModel):
    modelo: str
    potencia: str
    caracteristicas: str
    precio: float
    imagen: str
    financiamiento_entrada: float
    financiamiento_cuotas: int = 30

class CalendarioEvento(BaseModel):
    id: Optional[str] = None
    fecha: str
    localidad: str
    descripcion: str

class CalendarioEventoCreate(BaseModel):
    fecha: str
    localidad: str
    descripcion: str

class Configuracion(BaseModel):
    whatsapp_ventas: str
    whatsapp_repuestos: str
    whatsapp_servicio: str

class AdminUser(BaseModel):
    username: str
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# ==================== AUTH FUNCTIONS ====================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.admins.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return user

# ==================== SEED DATA ====================

async def seed_initial_data():
    # Create admin user if not exists
    admin_exists = await db.admins.find_one({"username": "admin"})
    if not admin_exists:
        admin = {
            "username": "admin",
            "password": get_password_hash("admin123")
        }
        await db.admins.insert_one(admin)
        logger.info("Admin user created: username=admin, password=admin123")
    
    # Create default configuration if not exists
    config_exists = await db.configuracion.find_one({})
    if not config_exists:
        config = {
            "whatsapp_ventas": "593999999999",
            "whatsapp_repuestos": "593988888888",
            "whatsapp_servicio": "593977777777"
        }
        await db.configuracion.insert_one(config)
        logger.info("Default configuration created")

# ==================== ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Tohatsu Motors API"}

# Auth endpoints
@api_router.post("/auth/login", response_model=Token)
async def login(admin: AdminLogin):
    user = await db.admins.find_one({"username": admin.username})
    if not user or not verify_password(admin.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# Motor endpoints
@api_router.get("/motors", response_model=List[Motor])
async def get_motors():
    motors = await db.motors.find().to_list(1000)
    return [Motor(id=str(motor["_id"]), **{k: v for k, v in motor.items() if k != "_id"}) for motor in motors]

@api_router.get("/motors/{motor_id}", response_model=Motor)
async def get_motor(motor_id: str):
    try:
        motor = await db.motors.find_one({"_id": ObjectId(motor_id)})
        if not motor:
            raise HTTPException(status_code=404, detail="Motor no encontrado")
        return Motor(id=str(motor["_id"]), **{k: v for k, v in motor.items() if k != "_id"})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/motors", response_model=Motor)
async def create_motor(motor: MotorCreate, current_user: dict = Depends(get_current_user)):
    motor_dict = motor.dict()
    result = await db.motors.insert_one(motor_dict)
    motor_dict["id"] = str(result.inserted_id)
    return Motor(**motor_dict)

@api_router.put("/motors/{motor_id}", response_model=Motor)
async def update_motor(motor_id: str, motor: MotorCreate, current_user: dict = Depends(get_current_user)):
    try:
        motor_dict = motor.dict()
        await db.motors.update_one({"_id": ObjectId(motor_id)}, {"$set": motor_dict})
        motor_dict["id"] = motor_id
        return Motor(**motor_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/motors/{motor_id}")
async def delete_motor(motor_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = await db.motors.delete_one({"_id": ObjectId(motor_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Motor no encontrado")
        return {"message": "Motor eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Calendar endpoints
@api_router.get("/calendar", response_model=List[CalendarioEvento])
async def get_calendar():
    eventos = await db.calendario.find().to_list(1000)
    return [CalendarioEvento(id=str(evento["_id"]), **{k: v for k, v in evento.items() if k != "_id"}) for evento in eventos]

@api_router.post("/calendar", response_model=CalendarioEvento)
async def create_evento(evento: CalendarioEventoCreate, current_user: dict = Depends(get_current_user)):
    evento_dict = evento.dict()
    result = await db.calendario.insert_one(evento_dict)
    evento_dict["id"] = str(result.inserted_id)
    return CalendarioEvento(**evento_dict)

@api_router.put("/calendar/{evento_id}", response_model=CalendarioEvento)
async def update_evento(evento_id: str, evento: CalendarioEventoCreate, current_user: dict = Depends(get_current_user)):
    try:
        evento_dict = evento.dict()
        await db.calendario.update_one({"_id": ObjectId(evento_id)}, {"$set": evento_dict})
        evento_dict["id"] = evento_id
        return CalendarioEvento(**evento_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.delete("/calendar/{evento_id}")
async def delete_evento(evento_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = await db.calendario.delete_one({"_id": ObjectId(evento_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
        return {"message": "Evento eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Configuration endpoints
@api_router.get("/config", response_model=Configuracion)
async def get_config():
    config = await db.configuracion.find_one({})
    if not config:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    return Configuracion(**{k: v for k, v in config.items() if k != "_id"})

@api_router.put("/config", response_model=Configuracion)
async def update_config(config: Configuracion, current_user: dict = Depends(get_current_user)):
    config_dict = config.dict()
    await db.configuracion.update_one({}, {"$set": config_dict}, upsert=True)
    return config

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await seed_initial_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
