from fastapi import FastAPI, Depends, Header, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import random
import time
import json
import asyncio
import os
from sqlalchemy import create_engine, text
from pydantic import BaseModel

app = FastAPI(title="VoltGrid API", description="AI Energy Orchestration - Phase 5 Simulator")

# Connect to TimescaleDB
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://voltgrid_admin:secure_password@timescaledb:5432/voltgrid_db")
engine = create_engine(DATABASE_URL)

# Add CORS so Next.js can fetch from it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulated Official Data Profiles
PROFILES = {
    "germany": {
        "description": "Germany Smart Logistics (Cost-Driven Solar Shifting)",
        "curve": [
            {"time": "08:00", "kw": 80, "limit": 200},
            {"time": "09:00", "kw": 120, "limit": 200},
            {"time": "10:00", "kw": 190, "limit": 200}, # Peak Solar
            {"time": "11:00", "kw": 195, "limit": 200},
            {"time": "12:00", "kw": 195, "limit": 200},
            {"time": "13:00", "kw": 180, "limit": 200},
            {"time": "14:00", "kw": 160, "limit": 200},
            {"time": "15:00", "kw": 100, "limit": 200},
            {"time": "16:00", "kw": 50, "limit": 200},
            {"time": "17:00", "kw": 20, "limit": 200},  # Avoid evening grid peak
            {"time": "18:00", "kw": 0, "limit": 200},
            {"time": "19:00", "kw": 0, "limit": 200},
        ],
        "tariff_multiplier": "0.8x (Solar)",
        "fleet_soc_avg": 85,
        "savings": "€ 1,450"
    },
    "japan": {
        "description": "Japan Depot Microgrid (3-Peak & V2G Discharge)",
        "curve": [
            {"time": "08:00", "kw": 40, "limit": 200},
            {"time": "09:00", "kw": 150, "limit": 200}, # Morning Dispatch Peak
            {"time": "10:00", "kw": 90, "limit": 200},
            {"time": "11:00", "kw": 60, "limit": 200},
            {"time": "12:00", "kw": 120, "limit": 200}, # Midday Return Peak
            {"time": "13:00", "kw": 80, "limit": 200},
            {"time": "14:00", "kw": 80, "limit": 200},
            {"time": "15:00", "kw": 100, "limit": 200},
            {"time": "16:00", "kw": 180, "limit": 200}, # Evening Return Peak
            {"time": "17:00", "kw": 190, "limit": 200},
            {"time": "18:00", "kw": -50, "limit": 200}, # V2G Discharging back to grid!
            {"time": "19:00", "kw": -100, "limit": 200}, # V2G Discharging
        ],
        "tariff_multiplier": "1.5x (Peak V2G)",
        "fleet_soc_avg": 62,
        "savings": "¥ 84,000"
    },
    "india": {
        "description": "India NITI Aayog ToD (Solar Shift + Night Depot)",
        "curve": [
            {"time": "08:00", "kw": 30, "limit": 200},
            {"time": "09:00", "kw": 40, "limit": 200},
            {"time": "10:00", "kw": 180, "limit": 200}, # Solar ToD starts (-20% tariff)
            {"time": "11:00", "kw": 195, "limit": 200},
            {"time": "12:00", "kw": 195, "limit": 200},
            {"time": "13:00", "kw": 185, "limit": 200},
            {"time": "14:00", "kw": 180, "limit": 200},
            {"time": "15:00", "kw": 170, "limit": 200},
            {"time": "16:00", "kw": 80, "limit": 200},  # Solar ToD ends
            {"time": "17:00", "kw": 20, "limit": 200},
            {"time": "18:00", "kw": 0, "limit": 200},   # Peak Evening Penalty (+20% tariff)
            {"time": "19:00", "kw": 0, "limit": 200},
        ],
        "tariff_multiplier": "0.8x (ToD Solar)",
        "fleet_soc_avg": 78,
        "savings": "₹ 52,400"
    }
}

# LIVE WEBSOCKET STATE (In-Memory for MVP)
active_chargers = {} # Format: {"CHG-01": {"soc": 45, "kw": 50, "status": "Charging", "last_seen": timestamp}}

@app.websocket("/api/ocpp/{charger_id}")
async def ocpp_endpoint(websocket: WebSocket, charger_id: str):
    await websocket.accept()
    # Initialize charger state
    active_chargers[charger_id] = {"soc": 0, "kw": 0, "status": "Connected", "last_seen": time.time()}
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            if payload.get("action") == "MeterValues":
                # Update global state with live telemetry from physical hardware
                active_chargers[charger_id].update({
                    "soc": payload.get("soc", 0),
                    "kw": payload.get("kw", 0),
                    "status": "Charging" if payload.get("kw", 0) > 0 else "Idle",
                    "last_seen": time.time()
                })
    except WebSocketDisconnect:
        # Charger disconnected, remove from active list
        if charger_id in active_chargers:
            del active_chargers[charger_id]

@app.get("/api/telemetry/power")
def get_power_curve(profile: str = Query("germany")):
    if profile not in PROFILES:
        profile = "germany"
    
    data = dict(PROFILES[profile])
    
    # DYNAMIC CALCULATION: Override hardcoded avg_soc with live WebSocket data if chargers are connected
    if len(active_chargers) > 0:
        total_soc = sum(c["soc"] for c in active_chargers.values())
        true_avg = round(total_soc / len(active_chargers))
        data["fleet_soc_avg"] = true_avg
        
    return data

@app.get("/api/fleet/status")
def get_fleet_status(profile: str = Query("germany")):
    fleet = []
    
    # If we have live WebSocket connections, use them!
    if len(active_chargers) > 0:
        for charger_id, data in active_chargers.items():
            fleet.append({
                "id": f"LIVE-EV-{charger_id[-2:]}",
                "charger": charger_id,
                "soc": data["soc"],
                "kw": data["kw"],
                "status": data["status"],
                "time": "Live (WS)"
            })
    else:
        # Fallback to simulated data if no hardware is connected
        buses = ["BUS-402", "BUS-405", "BUS-410", "VAN-101", "VAN-102", "TRK-900"]
        for i, bus in enumerate(buses):
            soc = random.randint(15, 100)
            kw = round(random.uniform(0, 150), 1)
            
            status = "Charging"
            if soc == 100:
                status = "Complete"
                kw = 0
            elif profile == "japan" and random.random() > 0.7:
                status = "V2G Discharging"
                kw = -round(random.uniform(20, 50), 1)
            elif soc < 30:
                status = "Fast Charge"
                
            fleet.append({
                "id": bus,
                "charger": f"CHG-0{i+1}",
                "soc": soc,
                "kw": kw,
                "status": status,
                "time": "Simulated"
            })
            
    return {"data": fleet}

# Database Models & Routes
class SettingsUpdate(BaseModel):
    max_load_kw: int
    state_name: str
    state_rate: float
    aggressiveness: str
    v2g_enabled: bool

@app.get("/api/settings")
def get_settings():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT max_load_kw, state_name, state_rate, aggressiveness, v2g_enabled FROM tenant_settings WHERE tenant_id = '11111111-1111-1111-1111-111111111111'")).first()
            if result:
                return dict(result._mapping)
    except Exception as e:
        print(f"DB Error: {e}")
    
    return {
        "max_load_kw": 200, "state_name": "Delhi", "state_rate": 4.00, 
        "aggressiveness": "aggressive", "v2g_enabled": True
    }

@app.post("/api/settings")
def update_settings(settings: SettingsUpdate):
    try:
        with engine.begin() as conn:
            conn.execute(text("""
                UPDATE tenant_settings 
                SET max_load_kw = :m, state_name = :n, state_rate = :r, aggressiveness = :a, v2g_enabled = :v
                WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
            """), {"m": settings.max_load_kw, "n": settings.state_name, "r": settings.state_rate, "a": settings.aggressiveness, "v": settings.v2g_enabled})
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/analytics/historical")
def get_historical_analytics():
    base_rate = 4.00
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT state_rate FROM tenant_settings WHERE tenant_id = '11111111-1111-1111-1111-111111111111'")).first()
            if result:
                base_rate = result[0]
    except:
        pass
        
    data = []
    # Generate 30 days of data ending today
    for i in range(30, 0, -1):
        day = f"Day {-i}"
        base_cost = random.randint(15000, 20000) * float(base_rate)
        optimized_cost = base_cost * 0.82 # Simulated 18% savings average
        data.append({
            "name": day,
            "Baseline Cost": round(base_cost),
            "AI Optimized Cost": round(optimized_cost)
        })
    return {"data": data}

# Comprehensive list of Indian States and official SERC EV HT Commercial Tariffs (Base Rates in INR) for 2024
INDIAN_STATES_TARIFFS = [
    {"state": "Andhra Pradesh", "rate": 6.70},
    {"state": "Assam", "rate": 7.00},
    {"state": "Bihar", "rate": 7.50},
    {"state": "Chhattisgarh", "rate": 6.92}, # Official CSERC ACoS single-part tariff
    {"state": "Delhi", "rate": 4.00},        # DERC official HT tariff
    {"state": "Gujarat", "rate": 4.00},
    {"state": "Haryana", "rate": 5.55},
    {"state": "Himachal Pradesh", "rate": 5.50},
    {"state": "Jharkhand", "rate": 6.25},
    {"state": "Karnataka", "rate": 5.00},    # BESCOM official EV rate
    {"state": "Kerala", "rate": 5.50},
    {"state": "Madhya Pradesh", "rate": 6.00},
    {"state": "Maharashtra", "rate": 6.90},  # MERC official HT EV charging rate
    {"state": "Odisha", "rate": 5.50},
    {"state": "Punjab", "rate": 6.00},
    {"state": "Rajasthan", "rate": 6.00},
    {"state": "Tamil Nadu", "rate": 8.00},
    {"state": "Telangana", "rate": 6.00},
    {"state": "Uttar Pradesh", "rate": 7.30},
    {"state": "West Bengal", "rate": 6.50}
]

@app.get("/api/tariffs/states")
def get_state_tariffs():
    return {"states": INDIAN_STATES_TARIFFS}

@app.post("/api/tariffs/sync")
def sync_live_tariffs():
    """
    Simulates a background crawler hitting an aggregator API (like AEEE)
    and updating the official state tariffs globally.
    For this demo, we simulate a nationwide ₹1.50/kWh price hike across the board.
    """
    global INDIAN_STATES_TARIFFS
    updated_tariffs = []
    
    for state in INDIAN_STATES_TARIFFS:
        # Simulate an official price increase fetched from the web scraper
        new_rate = round(state["rate"] + 1.50, 2)
        updated_tariffs.append({
            "state": state["state"],
            "rate": new_rate
        })
    
    # Update the global "database"
    INDIAN_STATES_TARIFFS = updated_tariffs
    
    return {"status": "success", "message": "Scraper synced 20 states from official SERC sources. Applied +₹1.50/kWh update.", "states": INDIAN_STATES_TARIFFS}
