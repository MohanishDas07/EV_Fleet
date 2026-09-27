import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_synthetic_route_data(num_records=1000, start_date="2026-06-01"):
    """
    Generates synthetic historical data for fixed-route commercial fleets.
    This data represents past trips and is used to train the XGBoost arrival/SoC predictors.
    """
    np.random.seed(42)
    start = datetime.strptime(start_date, "%Y-%m-%d")
    
    data = []
    for _ in range(num_records):
        route_id = np.random.choice([1, 2, 3, 4, 5])
        departure_time = start + timedelta(days=np.random.randint(0, 30), hours=np.random.randint(6, 10))
        
        # Route logic: Route 1 is short, Route 5 is long
        duration_hours = route_id * 1.5 + np.random.normal(0, 0.2)
        arrival_time = departure_time + timedelta(hours=duration_hours)
        
        initial_soc = np.random.uniform(80, 100) # Fleet usually leaves fully charged
        soc_drain = route_id * 12 + np.random.normal(0, 5) # Longer routes drain more
        final_soc = max(5, initial_soc - soc_drain) # Don't go below 5%
        
        weather_index = np.random.uniform(0, 1) # 0 is clear, 1 is heavy rain/snow (affects SoC)
        traffic_density = np.random.uniform(0, 1) # 0 is clear, 1 is heavy traffic
        
        data.append({
            "route_id": route_id,
            "departure_time": departure_time,
            "arrival_time": arrival_time,
            "duration_hours": duration_hours,
            "initial_soc": initial_soc,
            "final_soc": final_soc,
            "weather_index": weather_index,
            "traffic_density": traffic_density
        })
        
    return pd.DataFrame(data)

def generate_tod_tariff_grid(date_str):
    """
    Generates a MoP Time-of-Day (ToD) tariff grid for a given day.
    9 AM to 4 PM (16:00) is 0.8x (Solar Hours).
    Other hours are 1.0x or 1.2x (Peak).
    """
    hours = np.arange(24)
    multipliers = np.ones(24)
    
    # Solar Hours (0.8x)
    multipliers[9:16] = 0.8
    
    # Peak Hours (e.g., 6 PM to 10 PM -> 1.2x)
    multipliers[18:22] = 1.2
    
    return pd.DataFrame({
        "hour": hours,
        "tariff_multiplier": multipliers
    })

if __name__ == "__main__":
    print("Generating synthetic route data...")
    df_routes = generate_synthetic_route_data(100)
    print(df_routes.head())
    
    print("\nGenerating ToD Tariff Grid...")
    df_tariffs = generate_tod_tariff_grid("2026-06-21")
    print(df_tariffs)
    
    # Save to CSV for the AI module to consume during training
    # df_routes.to_csv("synthetic_routes.csv", index=False)
    # df_tariffs.to_csv("tod_tariffs.csv", index=False)
