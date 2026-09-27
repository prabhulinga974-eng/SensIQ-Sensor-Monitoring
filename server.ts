import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SensIQ Edge IoT Telemetry & Diagnostics Gateway',
  });
});

// AI Sensor Health & Root Cause Analysis endpoint using Gemini API
app.post('/api/ai-diagnose', async (req, res) => {
  try {
    const { equipment, module, metrics, recentTelemetry, diagnosis } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'GEMINI_API_KEY is not configured in the environment. Returning edge heuristics.',
        analysis: generateHeuristicAnalysis(equipment, module, metrics, diagnosis),
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are SensIQ, a world-class industrial metrology and predictive maintenance engineer specializing in IoT sensor validation, transducer physics, on-module calibration circuits, and machine diagnostics.

Analyze this live industrial telemetry data for an equipment sensor module:

EQUIPMENT:
- Name: ${equipment.name} (${equipment.type})
- Location: ${equipment.location}
- Operating State: ${equipment.operationalState}
- Monitored Primary Variable: ${equipment.primaryVariable.name} (Range: ${equipment.primaryVariable.min} to ${equipment.primaryVariable.max} ${equipment.primaryVariable.unit})
- Accumulated Operating Hours: ${equipment.operatingHours} hours
- Machine Operating Parameters:
${equipment.secondaryParameters.map((p: any) => `  * ${p.label}: ${p.value} ${p.unit}`).join('\n')}

INSTALLED SENSOR & IN-MODULE CALIBRATOR:
- Module ID: ${module.id} (${module.sensorName})
- Transducer Type: ${module.sensorType}
- Protocol: ${module.protocol} | Sampling Rate: ${module.samplingRateHz} Hz | Battery: ${module.batteryPercentage}%
- In-Module Calibrator HW Revision: ${module.inModuleCalibrator.hardwareRevision}
- Internal Reference Voltage: ${module.inModuleCalibrator.referenceVoltageVolts}V (DAC Status: ${module.inModuleCalibrator.referenceDacStatus})
- Calibrator Zero Offset (b_cal): ${module.inModuleCalibrator.zeroOffset}
- Calibrator Span Gain (m_cal): ${module.inModuleCalibrator.spanGain}
- Calibrator Mode: ${module.inModuleCalibrator.activeMode}
- Last Factory/Field Calibration: ${module.inModuleCalibrator.lastCalibratedAt}

MEASURED TELEMETRY STATISTICAL PERFORMANCE:
- Ideal Machine Physics Reference Value (Mean): ${metrics.idealReferenceValue?.toFixed(3)} ${equipment.primaryVariable.unit}
- Module Received Telemetry Value (Mean): ${metrics.meanReceivedValue?.toFixed(3)} ${equipment.primaryVariable.unit}
- Systematic Residual Bias: ${metrics.systematicBias > 0 ? '+' : ''}${metrics.systematicBias?.toFixed(4)} ${equipment.primaryVariable.unit}
- Standard Deviation (Random Noise σ): ${metrics.standardDeviation?.toFixed(4)} ${equipment.primaryVariable.unit}
- ACCURACY: ${metrics.accuracyPercent?.toFixed(2)}%
- PRECISION (Repeatability): ${metrics.precisionPercent?.toFixed(2)}%
- Signal-to-Noise Ratio (SNR): ${metrics.signalToNoiseRatioDb?.toFixed(1)} dB
- Repeatability Limit (r = 2.77*σ): ${metrics.repeatabilitySpan?.toFixed(4)} ${equipment.primaryVariable.unit}

PRE-CLASSIFIED STATUS:
- Mode: ${diagnosis.mode} (Severity: ${diagnosis.severity})
- Classified as Sensor Fault: ${diagnosis.isSensorFault ? 'YES (Sensor/Transducer defective)' : 'NO (Genuine Machine Process Fault)'}

RECENT TELEMETRY WINDOW (Last 5 data points):
${recentTelemetry.slice(-5).map((pt: any) => `  * t=${pt.timeFormatted}: Ideal=${pt.idealValue.toFixed(2)} | Raw=${pt.rawSensorValue.toFixed(2)} | ModuleCal=${pt.moduleCalibratedValue.toFixed(2)} | Error=${pt.residualError.toFixed(2)}`).join('\n')}

PROVIDE A STRUCTURED METROLOGY & DIAGNOSTIC REPORT WITH:
1. **Executive Metrological Assessment**: Brief 2-3 sentence overview assessing accuracy vs precision divergence.
2. **Sensor vs Machine Differentiation**: Explain explicitly why the disparity between actual value and received value is attributed to sensor failure vs genuine machine process excursion.
3. **Failure Mechanism / Root Cause Analysis**: Physical degradation mechanism (e.g. piezoelectric depoling, thermal zero shift, contact corrosion, EMI coupling, ADC latchup).
4. **On-Module Calibrator Action**: Specific command recommended for the module's in-module calibrator circuit (e.g. Auto-Tare offset register, Two-Point Span adjustment, Digital filter tuning, or Physical replacement).
5. **Estimated Remaining Useful Life (RUL)** of this sensor in hours under current operating conditions.

Format in clean, structured markdown. Be precise, technical, and authoritative.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || 'Diagnostic generation completed.';

    return res.status(200).json({
      success: true,
      analysis: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating AI diagnosis:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate diagnostic report',
    });
  }
});

function generateHeuristicAnalysis(equipment: any, module: any, metrics: any, diagnosis: any): string {
  const biasStr = metrics.systematicBias > 0 ? `+${metrics.systematicBias.toFixed(3)}` : metrics.systematicBias.toFixed(3);
  return `### Metrological Forensic Assessment
- **Monitored Asset**: ${equipment.name}
- **Sensor Module**: ${module.id} (${module.sensorName})
- **Calculated Accuracy**: **${metrics.accuracyPercent.toFixed(1)}%** | **Precision**: **${metrics.precisionPercent.toFixed(1)}%**

#### 1. Actual Physics vs. Received Telemetry Differentiation
The edge physics model calculates an ideal expected value of **${metrics.idealReferenceValue.toFixed(2)} ${equipment.primaryVariable.unit}** based on thermodynamic and mechanical machine parameters. The module transmits a mean reading of **${metrics.meanReceivedValue.toFixed(2)} ${equipment.primaryVariable.unit}**, establishing a residual error delta of **${biasStr} ${equipment.primaryVariable.unit}**.
${diagnosis.isSensorFault 
  ? `**Diagnostic Determination**: SENSOR DEFECT. Secondary machine parameters correlate nominally, proving the physical equipment is stable while the transducer measurement chain has suffered calibration drift or electrical noise.` 
  : `**Diagnostic Determination**: TRUE EQUIPMENT EXCURSION. Transducer precision is high (${metrics.precisionPercent.toFixed(1)}%), proving the sensor is functioning accurately while the machine is experiencing a genuine operational anomaly.`}

#### 2. Root Cause Analysis: ${diagnosis.diagnosisTitle}
- **Primary Mechanism**: ${diagnosis.description}
- **Systematic Bias**: ${biasStr} ${equipment.primaryVariable.unit}
- **Random Variance (Noise σ)**: ${metrics.standardDeviation.toFixed(4)} ${equipment.primaryVariable.unit}
- **Repeatability Limit (r)**: ${metrics.repeatabilitySpan.toFixed(3)} ${equipment.primaryVariable.unit}

#### 3. Recommended In-Module Calibrator Action
${diagnosis.requiresCalibratorAction 
  ? `Execute **${diagnosis.recommendedCalibratorAction || 'AUTO_ZERO'}** on module ${module.id}. This will trim the in-module calibrator DAC reference registers and restore measurement accuracy.` 
  : `Maintain current calibrator coefficients. Focus maintenance team on inspecting equipment mechanical components.`}

#### 4. Sensor Health & Maintenance Forecast
- Sensor Operating Hours: ${equipment.operatingHours} hrs
- Confidence Index: ${diagnosis.confidenceScore.toFixed(1)}%
- Action Required: ${diagnosis.suggestedRemedy}`;
}

// Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`SensIQ server running on port ${port}`);
  });
}

setupServer().catch((err) => {
  console.error('Server startup failed:', err);
});
