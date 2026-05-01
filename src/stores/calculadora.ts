import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { MassUnit, TimeUnit } from '../utils/unitConverter'
import { massToMg, formatMg } from '../utils/unitConverter'
import { calculatePerfusion } from '../utils/perfusionCalculator'
import type { PerfusionResult } from '../utils/perfusionCalculator'

export interface Cantidad {
  valor: number
  unidad: string
}

export interface Concentracion {
  valor: number
  unidadMasa: string
  unidadVolumen: string
  porcentaje?: number
}

export interface Presentacion {
  forma: string
  cantidad: Cantidad
  volumen?: Cantidad
  concentracion?: Concentracion
}

export interface Dosis {
  tipo: string
  descripcion: string
}

export interface Farmaco {
  nombre: string
  presentaciones: Presentacion[]
  dosis?: Dosis[]
}

export const VOLUMENES_SUERO = [10, 20, 50, 100, 250, 500] as const
export type VolumenSuero = (typeof VOLUMENES_SUERO)[number]

export const useCalculadoraStore = defineStore('calculadora', () => {
  // ── Suero ────────────────────────────────────────────────────────────────
  const sueroVolumen = ref<VolumenSuero>(100)

  // ── Fármaco ──────────────────────────────────────────────────────────────
  const farmacoBuscado = ref('')
  const farmacoSeleccionado = ref<Farmaco | null>(null)
  const farmacoPresentacion = ref<Presentacion | null>(null)
  const farmacoMasaValor = ref<number | null>(null)
  const farmacoMasaUnidad = ref<MassUnit>('mg')

  // ── Paciente ─────────────────────────────────────────────────────────────
  const pacientePeso = ref<number | null>(70)

  // ── Dosis ────────────────────────────────────────────────────────────────
  const dosisValor = ref<number | null>(null)
  const dosisMasaUnidad = ref<MassUnit>('mcg')
  const dosisPorKg = ref<boolean>(false)
  const dosisTiempoUnidad = ref<TimeUnit>('min')

  // ── Getters ──────────────────────────────────────────────────────────────
  const farmacoMgPorUnidad = computed<number | null>(() => {
    const p = farmacoPresentacion.value
    if (!p) return null
    return massToMg(p.cantidad.valor, p.cantidad.unidad as MassUnit)
  })

  const farmacoTotalMg = computed<number>(() => {
    if (farmacoMasaValor.value === null || farmacoMasaValor.value <= 0) return 0
    return massToMg(farmacoMasaValor.value, farmacoMasaUnidad.value)
  })

  const farmacoEquivalenteUnidades = computed<number | null>(() => {
    const mg = farmacoMgPorUnidad.value
    const total = farmacoTotalMg.value
    if (!mg || total <= 0) return null
    return parseFloat((total / mg).toFixed(3))
  })

  const farmacoTotalLabel = computed(() =>
    farmacoTotalMg.value > 0 ? formatMg(farmacoTotalMg.value) : null
  )

  const dosisUnidadLabel = computed<string>(() => {
    const mass = dosisMasaUnidad.value
    const kg   = dosisPorKg.value ? '/kg' : ''
    const time = dosisTiempoUnidad.value
    return time === 'bolo' ? `${mass}${kg} (bolo)` : `${mass}${kg}/${time}`
  })

  const resultado = computed<PerfusionResult>(() =>
    calculatePerfusion({
      totalDrugMg: farmacoTotalMg.value,
      bagVolumeMl: sueroVolumen.value,
      doseValue: dosisValor.value ?? 0,
      massUnit: dosisMasaUnidad.value,
      perKg: dosisPorKg.value,
      weightKg: pacientePeso.value,
      timeUnit: dosisTiempoUnidad.value,
    })
  )

  // ── Actions ──────────────────────────────────────────────────────────────
  function seleccionarFarmaco(f: Farmaco) {
    farmacoSeleccionado.value = f
    farmacoBuscado.value = f.nombre
    farmacoPresentacion.value = f.presentaciones[0] ?? null
    farmacoMasaValor.value = null
    const u = f.presentaciones[0]?.cantidad.unidad
    farmacoMasaUnidad.value = (u === 'mg' || u === 'mcg' || u === 'g' || u === 'UI') ? u : 'mg'
  }

  function reset() {
    sueroVolumen.value = 100
    farmacoBuscado.value = ''
    farmacoSeleccionado.value = null
    farmacoPresentacion.value = null
    farmacoMasaValor.value = null
    farmacoMasaUnidad.value = 'mg'
    pacientePeso.value = 70
    dosisValor.value = null
    dosisMasaUnidad.value = 'mcg'
    dosisPorKg.value = false
    dosisTiempoUnidad.value = 'min'
  }

  return {
    // State
    sueroVolumen,
    farmacoBuscado, farmacoSeleccionado, farmacoPresentacion, farmacoMasaValor, farmacoMasaUnidad,
    pacientePeso,
    dosisValor, dosisMasaUnidad, dosisPorKg, dosisTiempoUnidad,
    // Getters
    farmacoMgPorUnidad, farmacoTotalMg, farmacoTotalLabel, farmacoEquivalenteUnidades, dosisUnidadLabel, resultado,
    // Actions
    seleccionarFarmaco, reset,
  }
})
