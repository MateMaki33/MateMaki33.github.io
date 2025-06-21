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
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  gap: 1rem;
}



.score {
  margin: 1rem 0;
  font-size: 1.25rem;
  color: #ffc266;
}

label {
  font-size: var(--font-size-li);
  color: #ffcc99;
}

/* Animación del botón */
.btn-glow {
  position: relative;
  padding: 1rem 2rem;
  color: #fff8f0;
  background: #1a1a1a;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 0 15px rgba(255, 140, 0, 0.4);
  transition: transform 0.3s ease;
}

.btn-glow:hover {
  transform: scale(1.05);
}

.btn-glow::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg, #ff9900, #ffaa33, #ff6600, #ff9900);
  animation: spin 3s linear infinite;
  z-index: -1;
  border-radius: 50%;
}

.btn-glow::after {
  content: "";
  position: absolute;
  inset: 2px;
  background: #1a1a1a;
  border-radius: 10px;
  z-index: -1;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Quitar flechas de inputs number */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
