<template>
  <div v-if="standalone" class="calc-page">
    <h1>qSOFA</h1>
    <p class="calc-hint">Referencia — suma 1 punto por cada criterio presente. El cálculo lo realiza el clínico.</p>

    <ul>
      <li>Frecuencia respiratoria ≥ 22 rpm — 1 punto</li>
      <li>Tensión arterial sistólica ≤ 100 mmHg — 1 punto</li>
      <li>Glasgow &lt; 15 — 1 punto</li>
    </ul>

    <p class="calc-hint">Puntuación ≥ 2 → mayor riesgo de mal pronóstico; valorar sepsis según criterio clínico.</p>
  </div>

  <div v-else class="grid">
    <button class="btn-glow" @click="openModal">qSOFA</button>

    <dialog ref="modal">
      <h2>qSOFA</h2>
      <p class="calc-hint">Referencia — suma 1 punto por cada criterio presente. El cálculo lo realiza el clínico.</p>

      <ul>
        <li>Frecuencia respiratoria ≥ 22 rpm — 1 punto</li>
        <li>Tensión arterial sistólica ≤ 100 mmHg — 1 punto</li>
        <li>Glasgow &lt; 15 — 1 punto</li>
      </ul>

      <p class="calc-hint">Puntuación ≥ 2 → mayor riesgo de mal pronóstico; valorar sepsis según criterio clínico.</p>

      <button class="btn-glow" @click="closeModal">Cerrar</button>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  standalone: { type: Boolean, default: false },
})

const modal = ref(null)
const openModal = () => modal.value?.showModal()
const closeModal = () => modal.value?.close()
</script>

<style scoped>
.calc-page { max-width: 640px; margin: 0 auto; }
</style>
