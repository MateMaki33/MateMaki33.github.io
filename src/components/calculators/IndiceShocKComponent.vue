<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Índice de Shock</button>

    <dialog ref="modal">
      <h2>Índice de Shock</h2>
      <p class="calc-hint">Índice = Frecuencia cardiaca ÷ Tensión arterial sistólica. Referencia — el clínico calcula el valor.</p>
      <p class="calc-hint">Un valor &gt; 0,9 sugiere hipoperfusión — valorar necesidad de transfusión según criterio clínico.</p>

      <button class="btn-glow" @click="closeModal">Cerrar</button>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";

const modal = ref(null);
const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>
