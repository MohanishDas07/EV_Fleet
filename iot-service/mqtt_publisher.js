const mqtt = require('mqtt');

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const client = mqtt.connect(MQTT_URL);

client.on('connect', () => {
    console.log(`[MQTT] Connected to Broker at ${MQTT_URL}`);
});

client.on('error', (err) => {
    console.error(`[MQTT] Connection Error: ${err.message}`);
});

function publishTelemetry(tenantSlug, chargePointId, payload) {
    // Construct the topic to enforce tenant isolation at the message queue level
    const topic = `voltgrid/telemetry/${tenantSlug}/${chargePointId}`;
    
    // Extract relevant data from OCPP MeterValues payload
    // This is scaffolding, actual payload parsing depends on OCPP schema
    const telemetryData = {
        timestamp: new Date().toISOString(),
        power_kw: payload.meterValue[0].sampledValue.find(v => v.measurand === 'Power.Active.Import').value,
        soc_percentage: payload.meterValue[0].sampledValue.find(v => v.measurand === 'SoC').value
    };

    client.publish(topic, JSON.stringify(telemetryData), { qos: 1 }, (err) => {
        if (err) {
            console.error(`[MQTT] Failed to publish to ${topic}: ${err.message}`);
        }
    });
}

module.exports = {
    publishTelemetry
};
