<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Fórmula de Parkland</button>

    <dialog ref="modal">
      <h2>Reposición hídrica (Parkland)</h2>
      <p class="calc-hint">Volumen total (ml) = 4 × peso (kg) × % SCQ, en las primeras 24h desde la quemadura. Referencia — el clínico realiza el cálculo y ajusta el ritmo.</p>
      <p class="calc-hint">Mitad del volumen en las primeras 8h · el resto en las siguientes 16h.</p>
      <p class="text-muted">Ringer lactato, desde el momento de la quemadura.</p>

      <button class="btn-glow" @click="closeModal">Cerrar</button>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const modal = ref(null)
const openModal = () => modal.value?.showModal()
const closeModal = () => modal.value?.close()
</script>

<style scoped>
.text-muted {
  font-size: 0.82rem;
  color: rgba(228, 239, 248, 0.45);
  margin-top: 0.35rem;
}
</style>
