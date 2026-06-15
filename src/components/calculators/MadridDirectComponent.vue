<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Calcular Madrid Direct</button>

    <dialog ref="modal">
      <h2>Escala Madrid Direct</h2>
      <form method="dialog" @submit.prevent>
        <div v-for="(item, index) in escalaItems.slice(0, 5)" :key="index" class="form-group">
          <label>{{ item.nombre }}</label>
          <select v-model.number="seleccion[index]">
            <option v-for="p in item.puntos" :key="p.valor" :value="p.valor">{{ p.descripcion }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Presión Arterial Sistólica</label>
          <input type="number" v-model.number="pas" min="0" />
        </div>

        <div class="form-group">
          <label>Edad</label>
          <input type="number" v-model.number="edad" min="0" />
        </div>

        <div class="score">
          <p>Puntuación Total: <strong>{{ puntuacionTotal }}</strong></p>
          <p>Interpretación: <strong>{{ interpretacion }}</strong></p>
        </div>

        <button class="btn-glow" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import ictusData from '../../collections/ictus.json'

const modal = ref(null)
const escalaItems = ictusData.codigo_ictus.evaluacion_inicial.escala_madrid_direct.items
const interpretacionPuntos = ictusData.codigo_ictus.evaluacion_inicial.escala_madrid_direct.interpretacion_puntuacion

const seleccion = ref([0, 0, 0, 0, 0])
const pas = ref(120)
const edad = ref(65)

const puntuacionBase = computed(() => seleccion.value.reduce((a, b) => a + b, 0))

const penalizacionPAS = computed(() => {
  if (pas.value >= 180 && pas.value <= 189) return 1
  if (pas.value >= 190 && pas.value <= 199) return 2
  if (pas.value >= 200 && pas.value <= 209) return 3
  if (pas.value > 209) return 4
  return 0
})

const penalizacionEdad = computed(() => {
  return edad.value > 85 ? edad.value - 85 : 0
})

const puntuacionTotal = computed(() => {
  return puntuacionBase.value - penalizacionPAS.value - penalizacionEdad.value
})

const interpretacion = computed(() => {
  const score = puntuacionTotal.value
  for (const i of interpretacionPuntos) {
    const [min, max] = i.rango.split('-').map(Number)
    if (score >= min && score <= max) return i.accion
  }
  return 'Fuera de rango'
})

const openModal = () => modal.value?.showModal()
const closeModal = () => modal.value?.close()
</script>
