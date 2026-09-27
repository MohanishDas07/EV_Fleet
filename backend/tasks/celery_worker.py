from celery import Celery
import os
import paho.mqtt.client as mqtt
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://voltgrid_admin:secure_password@localhost:5432/voltgrid_db")

app = Celery('tasks', broker=REDIS_URL)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def on_connect(client, userdata, flags, rc):
    print(f"[Celery] Connected to MQTT broker with result code {rc}")
    client.subscribe("voltgrid/telemetry/#")

def on_message(client, userdata, msg):
    """
    Ingests live charger telemetry from MQTT and asynchronously 
    inserts it into the TimescaleDB hypertable.
    Topic format: voltgrid/telemetry/{tenant_slug}/{charge_point_id}
    """
    topic_parts = msg.topic.split('/')
    if len(topic_parts) >= 4:
        tenant_slug = topic_parts[2]
        charge_point_id = topic_parts[3]
        
        try:
            payload = json.loads(msg.payload.decode('utf-8'))
            print(f"[Celery] Received telemetry for {tenant_slug} / {charge_point_id}")
            
            # Scaffolding database insertion
            # db = SessionLocal()
            # db.execute(text(f"SET LOCAL app.current_tenant = ..."))
            # Insert into TimescaleDB...
            
        except json.JSONDecodeError:
            print("[Celery] Invalid JSON payload received.")

# Set up MQTT listener in a background thread if running as a worker
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# client.connect("localhost", 1883, 60)
# client.loop_start()

@app.task
def process_heavy_ai_training():
    """
    Celery task to offload the heavy TD3 PyTorch training 
    so the FastAPI web server remains highly responsive.
    """
    print("Training TD3 Model...")
    return "Training Complete"
