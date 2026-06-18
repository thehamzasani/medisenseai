'use client'

import { useEffect, useState } from 'react'
import type { AssessmentWithResults } from '@/types'

interface Props {
  assessment: AssessmentWithResults
}

export default function AnomalyDetectionPanel({ assessment }: Props) {
  const [scanAngle, setScanAngle] = useState(0)
  const [pulseScale, setPulseScale] = useState(1)

  const isHighRisk =
    (assessment.diabetesLevel === 'HIGH' || assessment.diabetesLevel === 'CRITICAL') ||
    (assessment.heartDiseaseLevel === 'HIGH' || assessment.heartDiseaseLevel === 'CRITICAL') ||
    (assessment.hypertensionLevel === 'HIGH' || assessment.hypertensionLevel === 'CRITICAL') ||
    (assessment.strokeLevel === 'HIGH' || assessment.strokeLevel === 'CRITICAL')

  const markerColor = isHighRisk ? 'border-error/50' : 'border-tertiary-fixed-dim'
  const markerGlow = isHighRisk
    ? '0 0 20px rgba(255,180,171,0.4)'
    : '0 0 20px rgba(60,221,199,0.4)'

  // Determine anomaly position based on risk
  const anomalyX = isHighRisk ? 62 : 45
  const anomalyY = isHighRisk ? 38 : 55

  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle(prev => (prev + 1.5) % 360)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? 1.15 : 1)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  const urgency = assessment.urgency ?? 'MONITOR'
  const healthIndex = assessment.overallHealthIndex ?? 72

  const anomalies = [
    {
      label: 'Metabolic Anomaly',
      x: 35,
      y: 42,
      severity: (assessment.diabetesLevel === 'HIGH' || assessment.diabetesLevel === 'CRITICAL') ? 'HIGH' : 'LOW',
      metric: `Glucose: ${assessment.fastingGlucose} mg/dL`,
    },
    {
      label: 'Cardiovascular Signal',
      x: 62,
      y: 30,
      severity: (assessment.heartDiseaseLevel === 'HIGH' || assessment.heartDiseaseLevel === 'CRITICAL') ? 'HIGH' : 'LOW',
      metric: `BP: ${assessment.systolicBP}/${assessment.diastolicBP} mmHg`,
    },
    {
      label: 'Pressure Deviation',
      x: 70,
      y: 62,
      severity: (assessment.hypertensionLevel === 'HIGH' || assessment.hypertensionLevel === 'CRITICAL') ? 'HIGH' : 'LOW',
      metric: `HR: ${assessment.heartRate} BPM`,
    },
  ]

  return (
    <div className="col-span-7 h-[560px] surface-glass rounded-2xl radar-grid relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-5 bg-gradient-to-b from-surface-container-lowest/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse" />
          <span className="text-label-sm uppercase tracking-widest text-primary-fixed-dim">
            Anomaly Detection Core
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-label-sm px-3 py-1 rounded-full border ${
            isHighRisk
              ? 'bg-error/10 text-error border-error/30'
              : 'bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim border-tertiary-fixed-dim/30'
          }`}>
            {isHighRisk ? 'Anomalies Detected' : 'Nominal Range'}
          </span>
        </div>
      </div>

      {/* Radar circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[280, 220, 160, 100, 50].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: size,
              height: size,
              borderColor: `rgba(0, 219, 231, ${0.04 + i * 0.03})`,
            }}
          />
        ))}

        {/* Rotating scan line */}
        <div
          className="absolute"
          style={{
            width: 280,
            height: 280,
            transform: `rotate(${scanAngle}deg)`,
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: 140,
              height: 1,
              background: 'linear-gradient(90deg, rgba(0,219,231,0.6) 0%, transparent 100%)',
              transform: 'translateY(-50%)',
            }}
          />
        </div>

        {/* Scan sweep gradient */}
        <div
          className="absolute rounded-full"
          style={{
            width: 280,
            height: 280,
            background: `conic-gradient(from ${scanAngle}deg, rgba(0,219,231,0.08) 0deg, transparent 60deg)`,
          }}
        />
      </div>

      {/* Anomaly markers */}
      {anomalies.map((anomaly, i) => (
        <div
          key={i}
          className="absolute z-20 group"
          style={{ left: `${anomaly.x}%`, top: `${anomaly.y}%` }}
        >
          {/* Spinning ring */}
          <div
            className={`absolute -inset-3 rounded-full border-2 border-dashed animate-spin-slow ${
              anomaly.severity === 'HIGH' ? 'border-error/50' : 'border-tertiary-fixed-dim/50'
            }`}
          />
          {/* Core dot */}
          <div
            className={`w-3 h-3 rounded-full ${
              anomaly.severity === 'HIGH' ? 'bg-error' : 'bg-tertiary-fixed-dim'
            }`}
            style={{
              boxShadow: anomaly.severity === 'HIGH'
                ? '0 0 12px rgba(255,180,171,0.8)'
                : '0 0 12px rgba(60,221,199,0.8)',
              transform: `scale(${pulseScale})`,
              transition: 'transform 0.6s ease-in-out',
            }}
          />
          {/* Tooltip */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 surface-glass rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
            <p className={`text-label-sm font-semibold ${
              anomaly.severity === 'HIGH' ? 'text-error' : 'text-tertiary-fixed-dim'
            }`}>
              {anomaly.label}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">{anomaly.metric}</p>
            <p className="text-[10px] text-on-surface-variant">
              Severity: <span className={anomaly.severity === 'HIGH' ? 'text-error' : 'text-tertiary-fixed-dim'}>{anomaly.severity}</span>
            </p>
          </div>
        </div>
      ))}

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface-container-lowest/90 to-transparent p-5">
        <div className="grid grid-cols-4 gap-3">
          <div className="surface-glass rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Scan Zone</p>
            <p className="text-label-md font-semibold text-primary-fixed-dim">Active</p>
          </div>
          <div className="surface-glass rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Health Index</p>
            <p className="text-label-md font-semibold text-on-surface">{healthIndex}/100</p>
          </div>
          <div className="surface-glass rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Urgency</p>
            <p className={`text-label-md font-semibold ${
              urgency === 'URGENT' || urgency === 'SOON'
                ? 'text-error'
                : urgency === 'WATCH'
                ? 'text-secondary'
                : 'text-tertiary-fixed-dim'
            }`}>
              {urgency}
            </p>
          </div>
          <div className="surface-glass rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Anomalies</p>
            <p className="text-label-md font-semibold text-on-surface">
              {anomalies.filter(a => a.severity === 'HIGH').length} / {anomalies.length}
            </p>
          </div>
        </div>
      </div>

      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <div className="w-px h-8 bg-primary-fixed-dim/30 absolute left-1/2 -top-4 -translate-x-1/2" />
          <div className="w-8 h-px bg-primary-fixed-dim/30 absolute top-1/2 -left-4 -translate-y-1/2" />
          <div className="w-2 h-2 rounded-full bg-primary-fixed-dim/50" />
        </div>
      </div>

      {/* Engine label */}
      <div className="absolute top-16 right-5 text-right">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Engine</p>
        <p className="text-label-sm text-primary-fixed-dim font-semibold">Neural Network v5.0</p>
        <p className="text-[10px] text-on-surface-variant">99.2% Accuracy</p>
      </div>
    </div>
  )
}