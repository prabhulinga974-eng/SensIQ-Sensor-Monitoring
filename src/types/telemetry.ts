/**
 * SensIQ Industrial Sensor Health & Calibration Architecture Types
 */

export type OperationalState = 'IDLE' | 'RAMP_UP' | 'NOMINAL' | 'HIGH_LOAD' | 'MAINTENANCE';

export type SensorType = 
  | 'PIEZO_ACCEL'       // Vibration Accelerometer (g / mm/s)
  | 'PT100_RTD'         // High-Precision Temperature (°C)
  | 'PIEZORESISTIVE'    // Fluid / Steam Pressure (bar / PSI)
  | 'OPTICAL_MFC';      // Mass Flow Controller (sccm)

export type TransmissionProtocol = 'BLE 5.2 Direct' | 'Industrial MQTT-SN' | 'Zigbee Pro' | 'Modbus/RS-485';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  operationalState: OperationalState;
  primaryVariable: {
    name: string;
    unit: string;
    min: number;
    max: number;
    nominalMin: number;
    nominalMax: number;
    precisionDecimals: number;
  };
  secondaryParameters: {
    label: string;
    value: number;
    unit: string;
  }[];
  operatingHours: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface InModuleCalibrator {
  hardwareRevision: string;
  referenceVoltageVolts: number;
  referenceDacStatus: 'LOCKED' | 'TRIMMING' | 'UNLOCKED';
  zeroOffset: number; // b_cal in engineering units
  spanGain: number;   // m_cal, default 1.0000
  tempCompensationCoefficient: number;
  activeMode: 'HARDWARE_BYPASS' | 'ACTIVE_CALIBRATION' | 'SELF_TEST_PULSE';
  lastCalibratedAt: string;
  calibrationPointsCount: number;
}

export interface SensorModule {
  id: string;
  equipmentId: string;
  sensorType: SensorType;
  sensorName: string;
  firmwareVersion: string;
  samplingRateHz: number;
  protocol: TransmissionProtocol;
  batteryPercentage: number;
  signalRssiDbm: number;
  inModuleCalibrator: InModuleCalibrator;
  installationDate: string;
}

export interface TelemetryPoint {
  timestamp: number;
  timeFormatted: string;
  idealValue: number;          // Ground truth from equipment physics engine
  rawSensorValue: number;      // Raw physical transducer reading before calibrator
  moduleCalibratedValue: number; // Reading transmitted by the module after in-module calibration
  residualError: number;       // module - ideal
  absoluteError: number;       // |module - ideal|
  rawResidualError: number;    // raw - ideal
  isAnomalous: boolean;
}

export interface GaussianPoint {
  x: number;
  receivedDensity: number;
  idealDensity: number;
}

export interface AccuracyPrecisionMetrics {
  sampleWindowCount: number;
  meanReceivedValue: number;
  idealReferenceValue: number;
  systematicBias: number;
  standardDeviation: number; // sigma
  variance: number;
  accuracyPercent: number;
  precisionPercent: number;
  repeatabilitySpan: number; // 2.77 * sigma
  signalToNoiseRatioDb: number;
  gaussianDistribution: GaussianPoint[];
}

export type FailureMode = 
  | 'NOMINAL_HEALTHY'
  | 'CALIBRATION_DRIFT'
  | 'ZERO_POINT_SHIFT'
  | 'SENSOR_FROZEN'
  | 'EXCESSIVE_NOISE'
  | 'OPEN_CIRCUIT_DROPOUT'
  | 'MACHINE_PROCESS_FAULT';

export interface FailureDiagnosis {
  mode: FailureMode;
  severity: 'NOMINAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isSensorFault: boolean; // true = sensor defective, false = true equipment distress
  diagnosisTitle: string;
  description: string;
  evidenceList: string[];
  confidenceScore: number; // 0 - 100
  suggestedRemedy: string;
  requiresCalibratorAction: boolean;
  recommendedCalibratorAction?: 'AUTO_ZERO' | 'TWO_POINT_SPAN' | 'FILTER_RESET' | 'HARDWARE_REPLACE';
}

export type ActiveFaultType = 
  | 'NONE'
  | 'THERMAL_DRIFT'
  | 'ZERO_SHIFT'
  | 'STUCK_VALUE'
  | 'EMI_NOISE'
  | 'OPEN_CIRCUIT'
  | 'MACHINE_SURGE';

export interface FaultInjectionConfig {
  activeFault: ActiveFaultType;
  driftMagnitude: number;
  noiseMultiplier: number;
  stuckValue: number | null;
  zeroShiftValue: number;
  machineSurgeFactor: number;
}
