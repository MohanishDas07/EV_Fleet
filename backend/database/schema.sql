-- Enable TimescaleDB extension for high-performance time-series data
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Tenants Table (Fleet Operators)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vin VARCHAR(100) UNIQUE NOT NULL,
    battery_capacity_kwh NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chargers Table
CREATE TABLE chargers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    charge_point_id VARCHAR(100) UNIQUE NOT NULL, -- OCPP Identity
    max_power_kw NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Telemetry Table (TimescaleDB Hypertable)
CREATE TABLE charger_telemetry (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    charger_id UUID NOT NULL REFERENCES chargers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    power_kw NUMERIC(10, 2) NOT NULL,
    soc_percentage NUMERIC(5, 2), -- Battery State of Charge
    energy_transferred_kwh NUMERIC(10, 2)
);

-- Convert to TimescaleDB Hypertable partitioned by time
SELECT create_hypertable('charger_telemetry', 'time');

-------------------------------------------------------------------------------
-- Row Level Security (RLS) Configuration
-------------------------------------------------------------------------------

-- Enable RLS on all tenant-specific tables to ensure strict data isolation
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE charger_telemetry ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- The FastAPI backend will set 'app.current_tenant' before executing queries
-- e.g., SET LOCAL app.current_tenant = 'tenant-a-uuid';

CREATE POLICY tenant_isolation_policy_vehicles ON vehicles
    USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_policy_chargers ON chargers
    USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY tenant_isolation_policy_telemetry ON charger_telemetry
    USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- Create indexes for performance
CREATE INDEX idx_vehicles_tenant ON vehicles(tenant_id);
CREATE INDEX idx_chargers_tenant ON chargers(tenant_id);
CREATE INDEX idx_telemetry_tenant ON charger_telemetry(tenant_id, time DESC);

-------------------------------------------------------------------------------
-- Global Settings Persistence (Phase 11)
-------------------------------------------------------------------------------
CREATE TABLE tenant_settings (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    max_load_kw INTEGER DEFAULT 200,
    state_name VARCHAR(100) DEFAULT 'Delhi',
    state_rate NUMERIC(10, 2) DEFAULT 4.00,
    aggressiveness VARCHAR(50) DEFAULT 'aggressive',
    v2g_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA for MVP
INSERT INTO tenants (id, name, slug) VALUES ('11111111-1111-1111-1111-111111111111', 'Demo Tenant A', 'tenant-a') ON CONFLICT DO NOTHING;
INSERT INTO tenant_settings (tenant_id) VALUES ('11111111-1111-1111-1111-111111111111') ON CONFLICT DO NOTHING;
