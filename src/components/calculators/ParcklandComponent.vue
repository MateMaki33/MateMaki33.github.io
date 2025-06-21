<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Fórmula de Parkland</button>

    <dialog ref="modal">
      <h2>Reposición hídrica (Parkland)</h2>
      <form method="dialog" @submit.prevent>
        <div class="form-group">
          <label>Peso (kg):</label>
          <input type="number" v-model.number="peso" min="0" placeholder="Ej. 70" />
        </div>

        <div class="form-group">
          <label>% SCQ quemada:</label>
          <input type="number" v-model.number="scq" min="0" max="100" placeholder="Ej. 30" />
        </div>

        <div class="score" v-if="volumenTotal">
          <p><strong>Volumen total:</strong> {{ volumenTotal }} ml</p>
          <p><strong>Primeras 8h:</strong> {{ mitad }} ml</p>
          <p><strong>Siguientes 16h:</strong> {{ mitad }} ml</p>
          <p class="text-muted">Desde el momento de la quemadura.</p>
        </div>

        <button class="btn-glow" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const modal = ref(null)

const peso = ref(70)
const scq = ref(0)

const volumenTotal = computed(() => {
  if (!peso.value || !scq.value) return null
  return Math.round(4 * peso.value * scq.value)
})

const mitad = computed(() => {
  return volumenTotal.value ? Math.round(volumenTotal.value / 2) : null
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

input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ff9900;
  background-color: #1a1a1a;
  color: #fff7e6;
  height: 3rem;
  font-size: 1.25rem;
  box-shadow: 0 0 5px #ff9900;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #ffae42;
  box-shadow: 0 0 12px #ffaa33;
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

.text-muted {
  font-size: 0.9rem;
  color: #ffcc99;
  margin-top: 0.5rem;
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

/* Quitar flechas en input number */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
