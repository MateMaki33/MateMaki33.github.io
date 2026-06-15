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
  color: #f87171;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.45rem 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  margin-top: 0.5rem;
}
</style>
