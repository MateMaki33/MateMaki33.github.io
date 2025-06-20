<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Índice de Shock</button>

    <dialog ref="modal">
      <h2>Indice Shock</h2>
      <form method="dialog" @submit.prevent>
        <div class="form-group">
          <label>Frecuencia Cardiaca:</label>
          <input type="number" v-model.number="fc" min="0" />
        </div>

        <div class="form-group">
          <label>Tensión Sistólica:</label>
          <input type="number" v-model.number="tas" min="0" />
        </div>

        <div class="score">
          <p>
            Índice: <strong>{{ indiceShock.toFixed(2) }}</strong>
          </p>
          <p v-if="transfusion" class="active">NECESARIO TRANSFUNDIR</p>
        </div>

        <button class="btn-glow" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const modal = ref(null);
const fc = ref(0);
const tas = ref(0);

const indiceShock = computed(() => {
  if (tas.value === 0 || isNaN(fc.value) || isNaN(tas.value)) {
    return 0;
  }
  return fc.value / tas.value;
});

const transfusion = computed(() => {
  return indiceShock.value > 0.9;
});

const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>

<style scoped>
.active {
  display: block;
  color: red;
  font-size: var(--font-size-li);
}
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
.grid {
  max-width: 90vw !important;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
