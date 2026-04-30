import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { MassUnit, TimeUnit } from '../utils/unitConverter'
import { parseQuantityToMg, formatMg } from '../utils/unitConverter'
import { calculatePerfusion } from '../utils/perfusionCalculator'
import type { PerfusionResult } from '../utils/perfusionCalculator'

export interface Presentacion {
  forma: string
  cantidad: string
  volumen?: string
  diluyente?: string
}

export interface Farmaco {
  nombre: string
  marcas?: string[]
  presentaciones: Presentacion[]
  indicaciones?: string[]
  dosis?: string[]
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
  const farmacoCantidad = ref<number>(1)
  const farmacoMgManual = ref<number | null>(null)

  // ── Paciente ─────────────────────────────────────────────────────────────
  const pacientePeso = ref<number | null>(70)

  // ── Dosis ────────────────────────────────────────────────────────────────
  const dosisValor = ref<number | null>(null)
  const dosisMasaUnidad = ref<MassUnit>('mcg')
  const dosisPorKg = ref<boolean>(false)
  const dosisTiempoUnidad = ref<TimeUnit>('min')

  // ── Getters ──────────────────────────────────────────────────────────────
  const farmacoMgPorUnidad = computed<number | null>(() => {
    if (farmacoPresentacion.value?.cantidad) {
      const mg = parseQuantityToMg(farmacoPresentacion.value.cantidad)
      if (mg !== null) return mg
    }
    return farmacoMgManual.value
  })

  const farmacoTotalMg = computed<number>(() => {
    const mg = farmacoMgPorUnidad.value
    return mg !== null ? mg * farmacoCantidad.value : 0
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
    farmacoCantidad.value = 1
    farmacoMgManual.value = null
  }

  function reset() {
    sueroVolumen.value = 100
    farmacoBuscado.value = ''
    farmacoSeleccionado.value = null
    farmacoPresentacion.value = null
    farmacoCantidad.value = 1
    farmacoMgManual.value = null
    pacientePeso.value = 70
    dosisValor.value = null
    dosisMasaUnidad.value = 'mcg'
    dosisPorKg.value = false
    dosisTiempoUnidad.value = 'min'
  }

  return {
    // State
    sueroVolumen,
    farmacoBuscado, farmacoSeleccionado, farmacoPresentacion, farmacoCantidad, farmacoMgManual,
    pacientePeso,
    dosisValor, dosisMasaUnidad, dosisPorKg, dosisTiempoUnidad,
    // Getters
    farmacoMgPorUnidad, farmacoTotalMg, farmacoTotalLabel, dosisUnidadLabel, resultado,
    // Actions
    seleccionarFarmaco, reset,
  }
})
