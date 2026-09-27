import paho.mqtt.client as mqtt
import time
import json
import random
import os

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = 1883

client = mqtt.Client(client_id="voltgrid_simulator")

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Simulator connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}")

client.on_connect = on_connect
try:
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
except Exception as e:
    print(f"Warning: MQTT broker not reachable at {MQTT_BROKER}. Running in dry mode.")

client.loop_start()

PROFILES = ["GERMANY_SMART_LOGISTICS", "JAPAN_V2G_DEPOT", "INDIA_NITI_AAYOG_TOD"]

print("Starting VoltGrid AI Telemetry Simulator...")
print("Publishing high-frequency data to topic 'telemetry/#'")

try:
    while True:
        profile = random.choice(PROFILES)
        charger_id = f"CHG-{random.randint(1, 50):02d}"
        
        # Simulate realistic telemetry
        soc = random.randint(10, 100)
        voltage = round(random.uniform(380, 420), 1)
        
        # If Japan and evening time (simulated), V2G discharge
        if profile == "JAPAN_V2G_DEPOT" and random.random() > 0.8:
            current = -round(random.uniform(50, 120), 1) # Negative current = discharging
            status = "V2G_DISCHARGING"
        else:
            current = round(random.uniform(0, 200), 1)
            status = "CHARGING" if soc < 100 else "IDLE"
            
        payload = {
            "charger_id": charger_id,
            "profile": profile,
            "soc_percentage": soc,
            "voltage_v": voltage,
            "current_a": current,
            "power_kw": round((voltage * current) / 1000, 2),
            "status": status,
            "timestamp": int(time.time() * 1000)
        }
        
        if client.is_connected():
            client.publish(f"telemetry/{charger_id}", json.dumps(payload))
            print(f"Published: {payload}")
            
        time.sleep(0.5) # Publish 2 messages per second
except KeyboardInterrupt:
    print("Simulator stopped.")
    client.loop_stop()
    client.disconnect()
