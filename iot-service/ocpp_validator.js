const Ajv = require("ajv");
const ajv = new Ajv();

// Basic schema for an OCPP 2.0.1 MeterValues Request
const meterValuesSchema = {
    type: "array",
    items: [
        { type: "integer", const: 2 }, // MessageType.CALL
        { type: "string" },            // UniqueId
        { type: "string", const: "MeterValues" }, // Action
        {
            type: "object",
            properties: {
                evseId: { type: "integer" },
                meterValue: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            timestamp: { type: "string", format: "date-time" },
                            sampledValue: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        value: { type: "number" },
                                        measurand: { type: "string" }
                                    },
                                    required: ["value"]
                                }
                            }
                        },
                        required: ["timestamp", "sampledValue"]
                    }
                }
            },
            required: ["evseId", "meterValue"]
        }
    ],
    minItems: 4,
    maxItems: 4
};

const validateMeterValues = ajv.compile(meterValuesSchema);

function validateOCPPMessage(messageArray) {
    // If it's a MeterValues action, validate against schema
    if (messageArray[2] === 'MeterValues') {
        const valid = validateMeterValues(messageArray);
        if (!valid) {
            console.error("[Validator] Validation errors:", validateMeterValues.errors);
            return { isValid: false, errors: validateMeterValues.errors };
        }
    }
    // Expand to other OCPP messages (Authorize, BootNotification) as needed
    return { isValid: true };
}

module.exports = {
    validateOCPPMessage
};
