import type { MassUnit, TimeUnit } from './unitConverter'
import { massToMg } from './unitConverter'

export interface PerfusionInput {
  totalDrugMg: number      // mg totales del fármaco en la bolsa
  bagVolumeMl: number      // volumen total de la bolsa (ml)
  doseValue: number        // valor numérico de la dosis deseada
  massUnit: MassUnit       // unidad de masa de la dosis
  perKg: boolean           // ¿dosis ponderada por kg?
  weightKg: number | null  // peso del paciente (si perKg)
  timeUnit: TimeUnit       // min, h, o bolo
}

export interface PerfusionResult {
  concentrationMgMl: number     // mg/ml en la solución preparada
  requiredMgPerHour: number | null
  mlPerHour: number | null      // ritmo de bomba
  mlForBolus: number | null     // ml a administrar si es bolo
  gtasPerMin: number | null     // macrogotero (20 gtas/ml)
  error: string | null
  warnings: string[]
  isValid: boolean
}

const MACROGOTERO = 20  // gotas/ml

export function calculatePerfusion(input: PerfusionInput): PerfusionResult {
  const { totalDrugMg, bagVolumeMl, doseValue, massUnit, perKg, weightKg, timeUnit } = input
  const warnings: string[] = []

  const empty = { concentrationMgMl: 0, requiredMgPerHour: null, mlPerHour: null, mlForBolus: null, gtasPerMin: null }

  if (totalDrugMg <= 0) {
    return { ...empty, error: 'Selecciona fármaco y presentación', warnings, isValid: false }
  }
  if (bagVolumeMl <= 0) {
    return { ...empty, error: 'Selecciona volumen de suero', warnings, isValid: false }
  }
  if (!doseValue || doseValue <= 0) {
    return { ...empty, concentrationMgMl: totalDrugMg / bagVolumeMl, error: 'Introduce la dosis deseada', warnings, isValid: false }
  }

  const concentrationMgMl = totalDrugMg / bagVolumeMl

  let doseMg = massToMg(doseValue, massUnit)

  if (perKg) {
    if (!weightKg || weightKg <= 0) {
      return { ...empty, concentrationMgMl, error: 'Introduce el peso del paciente', warnings, isValid: false }
    }
    if (weightKg < 20 || weightKg > 250) warnings.push(`Peso inusual: ${weightKg} kg — Verificar`)
    doseMg *= weightKg
  }

  // Bolo
  if (timeUnit === 'bolo') {
    const mlForBolus = doseMg / concentrationMgMl
    if (mlForBolus > bagVolumeMl)  warnings.push(`Vol. calculado (${mlForBolus.toFixed(1)} ml) supera el suero`)
    if (mlForBolus > 30)           warnings.push('Volumen de bolo >30 ml — Verificar dosis')
    return { ...empty, concentrationMgMl, mlForBolus, error: null, warnings, isValid: true }
  }

  // Perfusión continua
  const requiredMgPerHour = timeUnit === 'min' ? doseMg * 60 : doseMg
  const mlPerHour = requiredMgPerHour / concentrationMgMl
  const gtasPerMin = (mlPerHour / 60) * MACROGOTERO

  if (mlPerHour > 999) warnings.push('Ritmo > 999 ml/h — Verificar datos')
  if (mlPerHour < 0.5) warnings.push('Ritmo < 0.5 ml/h — Considerar mayor concentración')

  return {
    concentrationMgMl,
    requiredMgPerHour,
    mlPerHour,
    mlForBolus: null,
    gtasPerMin,
    error: null,
    warnings,
    isValid: true,
  }
}
