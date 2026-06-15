<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Calcular qSOFA</button>

    <dialog ref="modal">
      <h2>qSOFA</h2>
      <form method="dialog" @submit.prevent>
        <div class="form-group">
          <label>Frecuencia Respiratoria (≥22):</label>
          <input type="number" v-model.number="fr" min="0" />
        </div>

        <div class="form-group">
          <label>Tensión Sistólica (≤100 mmHg):</label>
          <input type="number" v-model.number="tas" min="0" />
        </div>

        <div class="form-group">
          <label>Escala de Glasgow (&lt;15):</label>
          <input type="number" v-model.number="glasgow" min="3" max="15" />
        </div>

        <div class="score">
          <p>Puntuación qSOFA: <strong>{{ qsofaScore }}</strong></p>
        </div>

        <button class="btn-glow" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const modal = ref(null)

const fr = ref(0)
const tas = ref(0)
const glasgow = ref(15)

const qsofaScore = computed(() => {
  let score = 0
  if (fr.value >= 22) score++
  if (tas.value <= 100) score++
  if (glasgow.value < 15) score++
  return score
})

const openModal = () => modal.value?.showModal()
const closeModal = () => modal.value?.close()
</script>
