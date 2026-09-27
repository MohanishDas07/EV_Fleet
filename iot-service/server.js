const WebSocket = require('ws');
const mqttPublisher = require('./mqtt_publisher');

const PORT = process.env.PORT || 3001;
const wss = new WebSocket.Server({ port: PORT });

console.log(`[IoT Service] OCPP WebSocket server running on port ${PORT}`);

// Scaffolding for highly concurrent OCPP 2.0.1 connections
wss.on('connection', (ws, req) => {
    // Extract charge point ID and tenant slug from the URL
    // Expected format: wss://iot.voltgrid.com/ocpp/1.6/{tenant_slug}/{charge_point_id}
    const urlParts = req.url.split('/');
    const tenantSlug = urlParts[urlParts.length - 2] || 'unknown-tenant';
    const chargePointId = urlParts[urlParts.length - 1] || 'unknown-cp';

    console.log(`[IoT Service] New connection from CP: ${chargePointId} (Tenant: ${tenantSlug})`);

    ws.on('message', (message) => {
        try {
            // OCPP messages are typically JSON arrays: [MessageTypeId, UniqueId, Action, Payload]
            const ocppData = JSON.parse(message);
            const action = ocppData[2];
            const payload = ocppData[3];

            if (action === 'MeterValues') {
                // Route telemetry to the MQTT Broker for the Python Celery workers to ingest
                mqttPublisher.publishTelemetry(tenantSlug, chargePointId, payload);
            }

            // Acknowledge the message (Scaffolding response)
            const response = [3, ocppData[1], {}]; // CallResult
            ws.send(JSON.stringify(response));

        } catch (err) {
            console.error(`[IoT Service] Error parsing message: ${err.message}`);
        }
    });

    ws.on('close', () => {
        console.log(`[IoT Service] Connection closed for CP: ${chargePointId}`);
    });
});
