# VoltGrid AI: EV Fleet Energy Orchestration ⚡

![VoltGrid Dashboard](https://img.shields.io/badge/Status-MVP_Complete-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)

**VoltGrid** is an Enterprise B2B SaaS platform designed to solve the electrical grid crisis caused by massive commercial Electric Vehicle (EV) fleets. It acts as the "brain" for EV depots, utilizing AI-driven energy orchestration to autonomously control when and how fast buses charge.

By aggressively avoiding peak Time-of-Day (ToD) electricity tariffs and respecting physical transformer limits, VoltGrid guarantees massive financial savings and grid compliance for fleet operators.

---

## 🚀 Features

*   **Unified Dashboard:** A real-time command center displaying active grid tariffs, AI savings, and total active chargers.
*   **Pan-India Tariff Engine:** Automatically scrapes and calculates costs using the official 2024 commercial EV tariffs for 20 Indian States.
*   **AI-Driven Orchestration:** Simulates Reinforcement Learning to intercept charging sessions, avoid expensive ToD hours, and initiate V2G (Vehicle-to-Grid) discharging.
*   **Live OCPP Hardware Integration:** A production-ready WebSocket server capable of communicating directly with physical EV chargers via the Open Charge Point Protocol (OCPP 2.0.1).
*   **Historical Analytics:** Interactive 30-day reporting engine generating compliance and ROI PDF reports.
*   **Multi-Tenant Settings:** Global settings (Transformer Limits, Region) persisted in a PostgreSQL/TimescaleDB cloud database.

---

## 🛠️ Technology Stack

*   **Frontend:** Next.js (React 18), TypeScript, Tailwind CSS, Recharts
*   **Backend:** FastAPI (Python 3.11), asynchronous REST & WebSockets, SQLAlchemy
*   **Database:** PostgreSQL with TimescaleDB (for time-series battery telemetry)
*   **IoT / Messaging:** Eclipse Mosquitto (MQTT Broker), Redis
*   **Infrastructure:** Docker & Docker Compose

---

## 💻 How to Run Locally

This entire microservices architecture is containerized and optimized to run instantly on any machine using Docker.

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/MohanishDas07/EV_Fleet.git
   cd EV_Fleet
   ```
2. Start the entire server stack in the background:
   ```bash
   docker-compose up -d --build
   ```
3. Open your browser and navigate to:
   👉 **http://localhost:3000**

### Simulating Physical Hardware
If you want to see the dashboard react to live, physical data instead of the default AI simulations, you can trigger the hardware simulator:
```bash
docker exec -d evfleet-backend-1 python hardware_simulator.py
```
This script acts as a physical ABB charger and blasts live telemetry over WebSockets to your dashboard.

---

## 📂 Repository Structure

*   `/frontend` - The Next.js React application and UI components.
*   `/backend` - The FastAPI Python server, AI logic, database schemas, and OCPP protocol handlers.
*   `/iot-service` - MQTT broker configuration and validation scripts.
*   `docker-compose.yml` - The blueprint that wires all the microservices together.
