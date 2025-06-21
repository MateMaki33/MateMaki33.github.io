<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Calcular Glasgow</button>

    <dialog ref="modal">
      <h2>Escala de Glasgow</h2>
      <form method="dialog" @submit.prevent>
        <div class="form-group">
          <label>Apertura ocular:</label>
          <select v-model.number="ocular">
            <option :value="4">Espontánea (4)</option>
            <option :value="3">Al habla (3)</option>
            <option :value="2">Al dolor (2)</option>
            <option :value="1">Ninguna (1)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Respuesta verbal:</label>
          <select v-model.number="verbal">
            <option :value="5">Orientado (5)</option>
            <option :value="4">Confuso (4)</option>
            <option :value="3">Inapropiado (3)</option>
            <option :value="2">Incomprensible (2)</option>
            <option :value="1">Ninguna (1)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Respuesta motora:</label>
          <select v-model.number="motora">
            <option :value="6">Obedece órdenes (6)</option>
            <option :value="5">Localiza dolor (5)</option>
            <option :value="4">Retira al dolor (4)</option>
            <option :value="3">Flexión anormal (3)</option>
            <option :value="2">Extensión (2)</option>
            <option :value="1">Ninguna (1)</option>
          </select>
        </div>

        <div class="score">
          <p>Puntuación total: <strong>{{ total }}</strong></p>
          <p><strong>Interpretación:</strong> {{ interpretacion }}</p>
        </div>

        <button class="btn-glow" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const modal = ref(null);
const ocular = ref(4);
const verbal = ref(5);
const motora = ref(6);

const total = computed(() => ocular.value + verbal.value + motora.value);

const interpretacion = computed(() => {
  const t = total.value;
  if (t >= 13) return 'Traumatismo leve';
  if (t >= 9) return 'Traumatismo moderado';
  return 'Traumatismo grave';
});

const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

select {
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #ff9900;
  color: #fff7e6;
  font-size: 1.1rem;
  border-radius: 8px;
  box-shadow: 0 0 5px #ffaa33;
}

.score {
  margin-top: 1rem;
  font-size: 1.25rem;
  color: #ffc266;
}

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
