import asyncio
import websockets
import json
import random
import time

async def simulate_charger(charger_id, start_soc):
    uri = f"ws://localhost:8000/api/ocpp/{charger_id}"
    print(f"[{charger_id}] Connecting to VoltGrid Cloud via {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"[{charger_id}] Connected! Sending BootNotification...")
            
            soc = start_soc
            
            while True:
                # Simulate physical charging
                kw = round(random.uniform(40.0, 120.0), 1)
                
                if soc >= 100:
                    soc = 100
                    kw = 0.0
                else:
                    soc += 1  # charge by 1% every tick for fast simulation
                
                payload = {
                    "action": "MeterValues",
                    "soc": soc,
                    "kw": kw
                }
                
                print(f"[{charger_id}] Broadcasting MeterValues: SoC={soc}% | Power={kw}kW")
                await websocket.send(json.dumps(payload))
                
                await asyncio.sleep(2)  # Wait 2 seconds before next tick
                
    except websockets.exceptions.ConnectionClosed:
        print(f"[{charger_id}] Disconnected from VoltGrid.")
    except Exception as e:
        print(f"[{charger_id}] Error: {e}")

async def main():
    print("--- VoltGrid Hardware Simulator Started ---")
    print("Spawning 3 virtual EV chargers...\n")
    
    # Run 3 simulated chargers concurrently
    await asyncio.gather(
        simulate_charger("CHG-01", start_soc=20),
        simulate_charger("CHG-02", start_soc=45),
        simulate_charger("CHG-03", start_soc=88)
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nHardware Simulator Stopped by User.")
