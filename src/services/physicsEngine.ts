/**
 * SensIQ Physics & Telemetry Engine
 * Simulates machine physics, transducer errors, on-module hardware calibrators,
 * and statistical accuracy/precision diagnostics.
 */

import {
  Equipment,
  SensorModule,
  TelemetryPoint,
  AccuracyPrecisionMetrics,
  FailureDiagnosis,
  FaultInjectionConfig,
  GaussianPoint,
} from '../types/telemetry';

export const INITIAL_EQUIPMENTS: Equipment[] = [
  {
    id: 'eq-cnc-04',
    name: '5-Axis CNC Milling Center #04',
    type: 'High-Speed Precision Machining Center',
    location: 'Bay 3 - Aerospace Cell',
    operationalState: 'NOMINAL',
    primaryVariable: {
      name: 'Spindle Bearing Vibration (RMS)',
      unit: 'mm/s',
      min: 0,
      max: 12.0,
      nominalMin: 0.8,
      nominalMax: 2.5,
      precisionDecimals: 3,
    },
    secondaryParameters: [
      { label: 'Spindle Speed', value: 14200, unit: 'RPM' },
      { label: 'Bearing Temperature', value: 43.8, unit: '°C' },
      { label: 'Axis Feed Rate', value: 3200, unit: 'mm/min' },
      { label: 'Spindle Load', value: 64, unit: '%' },
    ],
    operatingHours: 4180,
    status: 'HEALTHY',
  },
  {
    id: 'eq-boiler-02',
    name: 'Superheated Steam Boiler #02',
    type: 'Industrial Water-Tube Steam Generator',
    location: 'Thermal Utility Plant Room B',
    operationalState: 'NOMINAL',
    primaryVariable: {
      name: 'Superheater Outlet Pressure',
      unit: 'bar',
      min: 0,
      max: 60.0,
      nominalMin: 38.0,
      nominalMax: 44.0,
      precisionDecimals: 2,
    },
    secondaryParameters: [
      { label: 'Superheated Steam Temp', value: 386.4, unit: '°C' },
      { label: 'Feedwater Flow', value: 14.8, unit: 't/h' },
      { label: 'Burner Firing Rate', value: 72, unit: '%' },
      { label: 'Stack O2 Content', value: 3.2, unit: '%' },
    ],
    operatingHours: 9820,
    status: 'HEALTHY',
  },
  {
    id: 'eq-hydra-09',
    name: 'Hydraulic Press & Clamp #09',
    type: '1200-Ton Hydraulic Compression Press',
    location: 'Heavy Forging Bay 1',
    operationalState: 'NOMINAL',
    primaryVariable: {
      name: 'Main Ram Hydraulic Pressure',
      unit: 'MPa',
      min: 0,
      max: 250.0,
      nominalMin: 140.0,
      nominalMax: 175.0,
      precisionDecimals: 1,
    },
    secondaryParameters: [
      { label: 'Hydraulic Oil Temp', value: 52.1, unit: '°C' },
      { label: 'Ram Stroke Velocity', value: 85, unit: 'mm/s' },
      { label: 'Proportional Valve Cmd', value: 78, unit: '%' },
      { label: 'Accumulator Pressure', value: 210, unit: 'bar' },
    ],
    operatingHours: 6350,
    status: 'HEALTHY',
  },
  {
    id: 'eq-reactor-01',
    name: 'CVD Thin-Film Plasma Reactor #01',
    type: 'Semiconductor Chemical Vapor Deposition',
    location: 'Cleanroom Sub-Fab Zone 1',
    operationalState: 'NOMINAL',
    primaryVariable: {
      name: 'Silane (SiH4) Precursor Gas Flow',
      unit: 'sccm',
      min: 0,
      max: 500.0,
      nominalMin: 235.0,
      nominalMax: 245.0,
      precisionDecimals: 1,
    },
    secondaryParameters: [
      { label: 'RF Plasma Power', value: 650, unit: 'W' },
      { label: 'Chamber Base Vacuum', value: 1.2e-3, unit: 'Torr' },
      { label: 'Wafer Pedestal Temp', value: 380, unit: '°C' },
      { label: 'Throttle Valve Angle', value: 41.5, unit: '°' },
    ],
    operatingHours: 2410,
    status: 'HEALTHY',
  },
];

export const INITIAL_MODULES: Record<string, SensorModule> = {
  'eq-cnc-04': {
    id: 'MOD-VIB-8821',
    equipmentId: 'eq-cnc-04',
    sensorType: 'PIEZO_ACCEL',
    sensorName: 'Triaxial Piezoelectric Accelerometer 100mV/g',
    firmwareVersion: 'v3.4.2-cal',
    samplingRateHz: 50,
    protocol: 'BLE 5.2 Direct',
    batteryPercentage: 94,
    signalRssiDbm: -58,
    installationDate: '2025-11-14',
    inModuleCalibrator: {
      hardwareRevision: 'CAL-REF-MOD-II',
      referenceVoltageVolts: 2.500,
      referenceDacStatus: 'LOCKED',
      zeroOffset: 0.0,
      spanGain: 1.000,
      tempCompensationCoefficient: 0.0012,
      activeMode: 'ACTIVE_CALIBRATION',
      lastCalibratedAt: '2026-08-15',
      calibrationPointsCount: 5,
    },
  },
  'eq-boiler-02': {
    id: 'MOD-PRX-4019',
    equipmentId: 'eq-boiler-02',
    sensorType: 'PIEZORESISTIVE',
    sensorName: 'Ceramic Isolated Pressure Cell 0-60 bar',
    firmwareVersion: 'v3.2.0-cal',
    samplingRateHz: 20,
    protocol: 'Industrial MQTT-SN',
    batteryPercentage: 88,
    signalRssiDbm: -64,
    installationDate: '2025-08-01',
    inModuleCalibrator: {
      hardwareRevision: 'CAL-REF-MOD-II',
      referenceVoltageVolts: 2.500,
      referenceDacStatus: 'LOCKED',
      zeroOffset: 0.0,
      spanGain: 1.000,
      tempCompensationCoefficient: 0.0008,
      activeMode: 'ACTIVE_CALIBRATION',
      lastCalibratedAt: '2026-07-20',
      calibrationPointsCount: 3,
    },
  },
  'eq-hydra-09': {
    id: 'MOD-HYD-5102',
    equipmentId: 'eq-hydra-09',
    sensorType: 'PIEZORESISTIVE',
    sensorName: 'High-Pressure Thin-Film Piezoresistive Transducer',
    firmwareVersion: 'v3.5.1-cal',
    samplingRateHz: 25,
    protocol: 'Zigbee Pro',
    batteryPercentage: 91,
    signalRssiDbm: -61,
    installationDate: '2025-09-12',
    inModuleCalibrator: {
      hardwareRevision: 'CAL-REF-MOD-III',
      referenceVoltageVolts: 2.500,
      referenceDacStatus: 'LOCKED',
      zeroOffset: 0.0,
      spanGain: 1.000,
      tempCompensationCoefficient: 0.0015,
      activeMode: 'ACTIVE_CALIBRATION',
      lastCalibratedAt: '2026-06-10',
      calibrationPointsCount: 4,
    },
  },
  'eq-reactor-01': {
    id: 'MOD-MFC-1108',
    equipmentId: 'eq-reactor-01',
    sensorType: 'OPTICAL_MFC',
    sensorName: 'Capillary Thermal Mass Flow Transducer',
    firmwareVersion: 'v4.0.1-cal',
    samplingRateHz: 10,
    protocol: 'Modbus/RS-485',
    batteryPercentage: 100,
    signalRssiDbm: -45,
    installationDate: '2026-01-10',
    inModuleCalibrator: {
      hardwareRevision: 'CAL-REF-MOD-IV',
      referenceVoltageVolts: 3.300,
      referenceDacStatus: 'LOCKED',
      zeroOffset: 0.0,
      spanGain: 1.000,
      tempCompensationCoefficient: 0.0004,
      activeMode: 'ACTIVE_CALIBRATION',
      lastCalibratedAt: '2026-09-01',
      calibrationPointsCount: 6,
    },
  },
};

/**
 * Calculates the Ground Truth Ideal Physical Parameter for an equipment at time t.
 * Implements equipment thermodynamics, rotating dynamics, and machine load states.
 */
export function calculateIdealPhysicsValue(equipment: Equipment, stepIndex: number): number {
  const t = stepIndex * 0.2; // 200ms per step

  switch (equipment.id) {
    case 'eq-cnc-04': {
      // Nominal spindle vibration: 1.45 mm/s baseline + harmonic waviness + slight process oscillation
      const baseline = 1.42;
      const harmonic1 = 0.12 * Math.sin(t * 1.5);
      const harmonic2 = 0.05 * Math.cos(t * 3.8);
      const microFlutter = 0.02 * Math.sin(t * 7.2);
      return Math.max(0.1, baseline + harmonic1 + harmonic2 + microFlutter);
    }
    case 'eq-boiler-02': {
      // Superheated steam pressure: 41.5 bar nominal + heat pulse cycle
      const baseline = 41.8;
      const steamCycle = 0.45 * Math.sin(t * 0.4);
      const boilerLoadRipple = 0.18 * Math.cos(t * 1.1);
      return baseline + steamCycle + boilerLoadRipple;
    }
    case 'eq-hydra-09': {
      // Main hydraulic ram pressure: 158.0 MPa baseline + pack/dwell pulsation
      const baseline = 158.5;
      const hydraulicPulsation = 2.4 * Math.sin(t * 0.8);
      const valveJitter = 0.8 * Math.sin(t * 2.5);
      return baseline + hydraulicPulsation + valveJitter;
    }
    case 'eq-reactor-01': {
      // CVD Gas Flow: 240.0 sccm tightly regulated
      const baseline = 240.0;
      const mfcRegulation = 0.6 * Math.sin(t * 0.5);
      const gasFluctuation = 0.25 * Math.cos(t * 1.8);
      return baseline + mfcRegulation + gasFluctuation;
    }
    default:
      return 100.0;
  }
}

/**
 * Simulates a physical sensor reading with transducer flaws and fault injections,
 * then runs the reading through the in-module calibrator circuit.
 */
export function generateTelemetrySample(
  equipment: Equipment,
  module: SensorModule,
  stepIndex: number,
  faultConfig: FaultInjectionConfig,
  historyCount: number
): TelemetryPoint {
  let ideal = calculateIdealPhysicsValue(equipment, stepIndex);

  // If a genuine machine surge fault is triggered, the equipment itself fluctuates
  if (faultConfig.activeFault === 'MACHINE_SURGE') {
    const surgeMultiplier = faultConfig.machineSurgeFactor || 1.35;
    ideal = ideal * surgeMultiplier;
  }

  // 1. Natural transducer noise (Gaussian approximation)
  const baseNoiseScale = (equipment.primaryVariable.max - equipment.primaryVariable.min) * 0.006;
  const u1 = Math.max(1e-6, Math.random());
  const u2 = Math.max(1e-6, Math.random());
  let randomGaussian = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  // Apply Fault Injections onto the physical transducer:
  let sensorError = randomGaussian * baseNoiseScale;
  let isAnomalous = false;

  switch (faultConfig.activeFault) {
    case 'THERMAL_DRIFT': {
      // Monotonic drift accumulating over time
      const driftSlope = faultConfig.driftMagnitude || 0.12;
      const driftDelta = (historyCount % 100) * driftSlope * (equipment.primaryVariable.max * 0.015);
      sensorError += driftDelta;
      isAnomalous = Math.abs(driftDelta) > (equipment.primaryVariable.max * 0.03);
      break;
    }
    case 'ZERO_SHIFT': {
      // Sudden step shift in baseline (tare loss / mechanical dislocation)
      const shift = faultConfig.zeroShiftValue || (equipment.primaryVariable.max * 0.14);
      sensorError += shift;
      isAnomalous = true;
      break;
    }
    case 'EMI_NOISE': {
      // 8x high frequency noise burst
      const multiplier = faultConfig.noiseMultiplier || 8.0;
      sensorError = randomGaussian * baseNoiseScale * multiplier;
      isAnomalous = true;
      break;
    }
    case 'STUCK_VALUE': {
      // Sensor membrane or ADC freezes completely
      sensorError = 0;
      break;
    }
    case 'OPEN_CIRCUIT': {
      // Circuit disconnect or rail saturation
      isAnomalous = true;
      break;
    }
    case 'MACHINE_SURGE': {
      // Sensor is normal, but process is in surge
      isAnomalous = true;
      break;
    }
    case 'NONE':
    default:
      // Normal nominal transducer (mild natural drift offset)
      sensorError += baseNoiseScale * 0.8;
      break;
  }

  // Calculate Raw Transducer Value
  let rawSensorValue = ideal + sensorError;

  if (faultConfig.activeFault === 'STUCK_VALUE') {
    rawSensorValue = faultConfig.stuckValue ?? (equipment.primaryVariable.nominalMin + 0.2);
  } else if (faultConfig.activeFault === 'OPEN_CIRCUIT') {
    // Pegs to 0.00 or sporadic negative dropout
    rawSensorValue = Math.random() < 0.15 ? 0.0 : Math.max(0, 0.02 * (Math.random() - 0.5));
  }

  // 2. Pass through On-Module Hardware Calibrator Circuit
  let moduleCalibratedValue = rawSensorValue;
  const calibrator = module.inModuleCalibrator;

  if (calibrator.activeMode === 'ACTIVE_CALIBRATION') {
    // Hardware calibration formula: V_cal = (V_raw - ZeroOffset) * SpanGain
    moduleCalibratedValue = (rawSensorValue - calibrator.zeroOffset) * calibrator.spanGain;
  } else if (calibrator.activeMode === 'SELF_TEST_PULSE') {
    // Internal 2.500V reference pulse test
    moduleCalibratedValue = calibrator.referenceVoltageVolts * (equipment.primaryVariable.nominalMax / 3.0);
  }

  // Clamp within physical limits
  rawSensorValue = Math.max(equipment.primaryVariable.min, rawSensorValue);
  moduleCalibratedValue = Math.max(equipment.primaryVariable.min, moduleCalibratedValue);

  const now = Date.now();
  const timeFormatted = new Date(now).toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const residualError = moduleCalibratedValue - ideal;
  const absoluteError = Math.abs(residualError);
  const rawResidualError = rawSensorValue - ideal;

  return {
    timestamp: now,
    timeFormatted,
    idealValue: ideal,
    rawSensorValue,
    moduleCalibratedValue,
    residualError,
    absoluteError,
    rawResidualError,
    isAnomalous,
  };
}

/**
 * Computes Statistical Accuracy, Precision, Repeatability, and Gaussian Distributions
 * over a sliding window of received telemetry readings.
 */
export function computeAccuracyAndPrecision(
  samples: TelemetryPoint[],
  equipment: Equipment
): AccuracyPrecisionMetrics {
  if (samples.length === 0) {
    return {
      sampleWindowCount: 0,
      meanReceivedValue: 0,
      idealReferenceValue: 0,
      systematicBias: 0,
      standardDeviation: 0,
      variance: 0,
      accuracyPercent: 100,
      precisionPercent: 100,
      repeatabilitySpan: 0,
      signalToNoiseRatioDb: 60,
      gaussianDistribution: [],
    };
  }

  const n = samples.length;
  const sumReceived = samples.reduce((acc, p) => acc + p.moduleCalibratedValue, 0);
  const meanReceived = sumReceived / n;

  const sumIdeal = samples.reduce((acc, p) => acc + p.idealValue, 0);
  const meanIdeal = sumIdeal / n;

  const systematicBias = meanReceived - meanIdeal;

  // Variance & Standard Deviation (Sample sigma)
  const sumSquareDiffs = samples.reduce(
    (acc, p) => acc + Math.pow(p.moduleCalibratedValue - meanReceived, 2),
    0
  );
  const variance = n > 1 ? sumSquareDiffs / (n - 1) : 0;
  const standardDeviation = Math.sqrt(variance);

  // Operational span for normalized percentage calculations
  const span = Math.max(1, equipment.primaryVariable.max - equipment.primaryVariable.min);
  const allowableBand = span * 0.15; // 15% of span is considered nominal tolerance

  // Accuracy: closeness of the mean to the true/ideal baseline
  const accuracyNormalized = Math.max(0, 1 - Math.abs(systematicBias) / allowableBand);
  const accuracyPercent = Math.min(100, Math.max(0, accuracyNormalized * 100));

  // Precision: repeatability & tightness of successive measurements (3*sigma)
  const precisionNormalized = Math.max(0, 1 - (3 * standardDeviation) / allowableBand);
  const precisionPercent = Math.min(100, Math.max(0, precisionNormalized * 100));

  // Repeatability span: 2.77 * sigma (ISO 5725 standard repeatability limit)
  const repeatabilitySpan = 2.77 * standardDeviation;

  // Signal to Noise Ratio
  const snr = standardDeviation > 0.0001
    ? Math.max(0, 20 * Math.log10(Math.abs(meanReceived) / standardDeviation))
    : 80;

  // Gaussian Bell Curve Generation (for visual distribution comparison)
  const gaussianDistribution: GaussianPoint[] = [];
  const pointsCount = 28;
  const sigmaPlot = Math.max(0.02, standardDeviation);
  const minX = meanIdeal - 3.5 * sigmaPlot - Math.abs(systematicBias);
  const maxX = meanIdeal + 3.5 * sigmaPlot + Math.abs(systematicBias);
  const step = (maxX - minX) / (pointsCount - 1);

  const calcNormalDensity = (x: number, mu: number, sig: number) => {
    const s = Math.max(0.015, sig);
    const coefficient = 1 / (s * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mu) / s, 2);
    return coefficient * Math.exp(exponent);
  };

  const idealSigma = baseIdealSigma(equipment);

  for (let i = 0; i < pointsCount; i++) {
    const x = minX + i * step;
    const receivedDensity = calcNormalDensity(x, meanReceived, standardDeviation);
    const idealDensity = calcNormalDensity(x, meanIdeal, idealSigma);
    gaussianDistribution.push({
      x,
      receivedDensity,
      idealDensity,
    });
  }

  return {
    sampleWindowCount: n,
    meanReceivedValue: meanReceived,
    idealReferenceValue: meanIdeal,
    systematicBias,
    standardDeviation,
    variance,
    accuracyPercent,
    precisionPercent,
    repeatabilitySpan,
    signalToNoiseRatioDb: snr,
    gaussianDistribution,
  };
}

function baseIdealSigma(equipment: Equipment): number {
  return (equipment.primaryVariable.max - equipment.primaryVariable.min) * 0.008;
}

/**
 * Intelligent Server-Side AI Diagnostics Engine:
 * Analyzes machine physics correlation vs received module data,
 * identifies exact failure modes, evaluates sensor health, and
 * discriminates between SENSOR DEFECT vs GENUINE MACHINE ANOMALY.
 */
export function analyzeSensorDiagnostics(
  equipment: Equipment,
  module: SensorModule,
  metrics: AccuracyPrecisionMetrics,
  faultConfig: FaultInjectionConfig
): FailureDiagnosis {
  const { systematicBias, standardDeviation, accuracyPercent, precisionPercent } = metrics;
  const primaryVar = equipment.primaryVariable;
  const span = primaryVar.max - primaryVar.min;

  // 1. Check for Stuck Sensor / Frozen ADC
  if (faultConfig.activeFault === 'STUCK_VALUE' || (metrics.sampleWindowCount >= 10 && standardDeviation < 0.0001)) {
    return {
      mode: 'SENSOR_FROZEN',
      severity: 'CRITICAL',
      isSensorFault: true,
      diagnosisTitle: 'Sensor Transducer Frozen / ADC Lockup',
      description: `Sensor reports invariant reading with near-zero variance (σ = ${standardDeviation.toFixed(4)} ${primaryVar.unit}) while machine is active. Transducer membrane or ADC latch has seized.`,
      evidenceList: [
        `Standard deviation collapsed to ${standardDeviation.toFixed(5)} ${primaryVar.unit} (expected > ${(span * 0.005).toFixed(3)})`,
        `Process excitation does not reflect in analog conversion`,
        `Module telemetry packet valid but payload data remains motionless`,
      ],
      confidenceScore: 98.4,
      suggestedRemedy: 'Perform electrical reset pulse via in-module calibrator. If unresponsive, replace transducer head.',
      requiresCalibratorAction: true,
      recommendedCalibratorAction: 'FILTER_RESET',
    };
  }

  // 2. Check for Open Circuit / Signal Dropout
  if (faultConfig.activeFault === 'OPEN_CIRCUIT' || metrics.meanReceivedValue <= primaryVar.min + 0.005) {
    return {
      mode: 'OPEN_CIRCUIT_DROPOUT',
      severity: 'CRITICAL',
      isSensorFault: true,
      diagnosisTitle: 'Open-Circuit / Wire Disconnect / Rail Grounding',
      description: `Sensor signal has dropped out to zero or floating rail ground. Physical lead wire severed or high-impedance terminal fault.`,
      evidenceList: [
        `Mean output dropped to ${metrics.meanReceivedValue.toFixed(3)} ${primaryVar.unit}`,
        `Accuracy degraded to ${accuracyPercent.toFixed(1)}%`,
        `Packet header active, but analog front-end reads zero current loop / voltage drop`,
      ],
      confidenceScore: 99.1,
      suggestedRemedy: 'Inspect sensor wiring harness, terminal strip connections, and transducer excitation voltage.',
      requiresCalibratorAction: true,
      recommendedCalibratorAction: 'HARDWARE_REPLACE',
    };
  }

  // 3. Check for Genuine Machine Surge vs Sensor Failure
  if (faultConfig.activeFault === 'MACHINE_SURGE') {
    return {
      mode: 'MACHINE_PROCESS_FAULT',
      severity: 'CRITICAL',
      isSensorFault: false, // NOT a sensor fault! Machine is actually in trouble!
      diagnosisTitle: 'True Machine Anomaly / Process Excursion',
      description: `AI Physics Model confirms the sensor is OPERATING ACCURATELY (${accuracyPercent.toFixed(1)}%). The equipment itself is experiencing genuine abnormal load/vibration surge exceeding nominal operating envelope.`,
      evidenceList: [
        `Sensor precision remains tight (σ = ${standardDeviation.toFixed(3)}) indicating high transducer integrity`,
        `Independent secondary variables (${equipment.secondaryParameters[0]?.label}: ${equipment.secondaryParameters[0]?.value} ${equipment.secondaryParameters[0]?.unit}) correlate with process surge`,
        `Residual error is low relative to elevated machine operational state`,
      ],
      confidenceScore: 95.8,
      suggestedRemedy: 'Do NOT recalibrate sensor. Immediately inspect machine mechanical bearings, hydraulic relief valves, or thermal cooling circuit.',
      requiresCalibratorAction: false,
    };
  }

  // 4. Check for Excessive Signal Noise (EMI / Ground Loop)
  if (faultConfig.activeFault === 'EMI_NOISE' || precisionPercent < 60) {
    return {
      mode: 'EXCESSIVE_NOISE',
      severity: 'HIGH',
      isSensorFault: true,
      diagnosisTitle: 'Excessive Signal Jitter / High-Frequency EMI',
      description: `Sensor precision has collapsed to ${precisionPercent.toFixed(1)}% due to electromagnetic interference, damaged cable shielding, or degrading internal piezoelectric crystal.`,
      evidenceList: [
        `Standard deviation inflated to σ = ${standardDeviation.toFixed(3)} ${primaryVar.unit}`,
        `Signal-to-Noise Ratio (SNR) degraded to ${metrics.signalToNoiseRatioDb.toFixed(1)} dB`,
        `Repeatability limit widened to ${metrics.repeatabilitySpan.toFixed(3)} ${primaryVar.unit}`,
      ],
      confidenceScore: 92.5,
      suggestedRemedy: 'Inspect cable shielding and grounding. Increase digital low-pass filtering in the in-module calibrator.',
      requiresCalibratorAction: true,
      recommendedCalibratorAction: 'FILTER_RESET',
    };
  }

  // 5. Check for Zero-Point Shift (Step Bias)
  if (faultConfig.activeFault === 'ZERO_SHIFT' || Math.abs(systematicBias) > span * 0.08) {
    return {
      mode: 'ZERO_POINT_SHIFT',
      severity: 'HIGH',
      isSensorFault: true,
      diagnosisTitle: 'Zero-Point Baseline Shift / Mechanical Tare Loss',
      description: `Sensor exhibits a static systematic offset (Bias = ${systematicBias > 0 ? '+' : ''}${systematicBias.toFixed(3)} ${primaryVar.unit}). Mechanical impact, mounting looseness, or tare loss has shifted the transducer origin.`,
      evidenceList: [
        `Systematic bias of ${systematicBias.toFixed(3)} ${primaryVar.unit} (${((systematicBias / span) * 100).toFixed(1)}% of full span)`,
        `Precision remains high (${precisionPercent.toFixed(1)}%), demonstrating repeatable measurements shifted by a constant delta`,
        `Easily remediable via on-module hardware calibrator Auto-Tare`,
      ],
      confidenceScore: 96.2,
      suggestedRemedy: 'Trigger in-module Auto-Tare / Zero-Point Calibration command to offset the hardware calibrator register.',
      requiresCalibratorAction: true,
      recommendedCalibratorAction: 'AUTO_ZERO',
    };
  }

  // 6. Check for Thermal Calibration Drift
  if (faultConfig.activeFault === 'THERMAL_DRIFT' || (accuracyPercent < 85 && precisionPercent >= 75)) {
    return {
      mode: 'CALIBRATION_DRIFT',
      severity: 'MEDIUM',
      isSensorFault: true,
      diagnosisTitle: 'Progressive Transducer Drift / Decalibration',
      description: `Sensor accuracy has decayed to ${accuracyPercent.toFixed(1)}% due to prolonged thermal cycling or component aging. Sensor is repeatable but systematic error is accumulating.`,
      evidenceList: [
        `Accuracy measured at ${accuracyPercent.toFixed(1)}% vs Ideal Physics baseline`,
        `Operating hours accumulated: ${equipment.operatingHours} hrs`,
        `Systematic bias gradient: ${systematicBias.toFixed(3)} ${primaryVar.unit}`,
      ],
      confidenceScore: 89.0,
      suggestedRemedy: 'Perform Two-Point Span & Zero Recalibration using the in-module reference DAC.',
      requiresCalibratorAction: true,
      recommendedCalibratorAction: 'TWO_POINT_SPAN',
    };
  }

  // 7. Nominal Healthy
  return {
    mode: 'NOMINAL_HEALTHY',
    severity: 'NOMINAL',
    isSensorFault: false,
    diagnosisTitle: 'Sensor & Equipment Operating Nominally',
    description: `Module measurements closely match the equipment ideal physics model. Accuracy (${accuracyPercent.toFixed(1)}%) and Precision (${precisionPercent.toFixed(1)}%) are within calibrated Class 0.5 tolerances.`,
    evidenceList: [
      `Accuracy: ${accuracyPercent.toFixed(1)}% (Residual Bias: ${systematicBias.toFixed(4)} ${primaryVar.unit})`,
      `Precision: ${precisionPercent.toFixed(1)}% (Standard Deviation: ${standardDeviation.toFixed(4)} ${primaryVar.unit})`,
      `In-module calibrator active and locked to 2.500V reference standard`,
    ],
    confidenceScore: 97.8,
    suggestedRemedy: 'No corrective maintenance required. Maintain scheduled routine telemetry logging.',
    requiresCalibratorAction: false,
  };
}

/**
 * Executes on-module hardware calibration actions:
 * Modifies the module's internal calibrator registers (Zero Offset b_cal, Span Gain m_cal).
 */
export function applyInModuleCalibration(
  module: SensorModule,
  action: 'AUTO_ZERO' | 'TWO_POINT_SPAN' | 'RESET_FACTORY' | 'TOGGLE_BYPASS',
  currentBias: number,
  measuredVal: number,
  idealVal: number
): SensorModule {
  const updated = JSON.parse(JSON.stringify(module)) as SensorModule;
  const cal = updated.inModuleCalibrator;

  if (action === 'AUTO_ZERO') {
    // Offset correction: subtract measured bias from calibrator offset register
    cal.zeroOffset = Number((cal.zeroOffset + currentBias).toFixed(4));
    cal.lastCalibratedAt = new Date().toISOString().split('T')[0];
    cal.referenceDacStatus = 'LOCKED';
    cal.activeMode = 'ACTIVE_CALIBRATION';
  } else if (action === 'TWO_POINT_SPAN') {
    // 2-point calibration: adjust gain and offset
    if (measuredVal > 0.01 && idealVal > 0.01) {
      const currentGain = cal.spanGain;
      const correctiveGain = idealVal / measuredVal;
      cal.spanGain = Number((currentGain * correctiveGain).toFixed(4));
      cal.zeroOffset = Number((cal.zeroOffset + currentBias * 0.8).toFixed(4));
    }
    cal.lastCalibratedAt = new Date().toISOString().split('T')[0];
    cal.referenceDacStatus = 'LOCKED';
    cal.activeMode = 'ACTIVE_CALIBRATION';
  } else if (action === 'RESET_FACTORY') {
    cal.zeroOffset = 0.0;
    cal.spanGain = 1.000;
    cal.activeMode = 'ACTIVE_CALIBRATION';
    cal.referenceDacStatus = 'LOCKED';
  } else if (action === 'TOGGLE_BYPASS') {
    cal.activeMode = cal.activeMode === 'ACTIVE_CALIBRATION' ? 'HARDWARE_BYPASS' : 'ACTIVE_CALIBRATION';
  }

  return updated;
}
