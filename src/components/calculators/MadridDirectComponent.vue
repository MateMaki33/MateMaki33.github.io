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

<style scoped>
.btn-glow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 156, 219, 0.08);
  border: 1px solid rgba(45, 156, 219, 0.38);
  color: var(--color-btn-text);
  padding: 0.75rem 1.35rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 8px;
  cursor: pointer;
  min-height: 48px;
  transition: all 0.2s ease;
}

.btn-glow:hover {
  background: rgba(45, 156, 219, 0.2);
  border-color: var(--color-primary);
  box-shadow: 0 0 28px rgba(45, 156, 219, 0.4);
  color: #ffffff;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.score {
  margin: 0.5rem 0 1rem;
  padding: 0.85rem 1rem;
  background: rgba(45, 156, 219, 0.06);
  border: 1px solid rgba(45, 156, 219, 0.2);
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-subtitle);
}

.score p { margin: 0.25rem 0; }

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] { -moz-appearance: textfield; }
</style>
