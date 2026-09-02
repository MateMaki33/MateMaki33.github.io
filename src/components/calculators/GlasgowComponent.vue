<template>
  <div class="calc-wrapper">
    <button class="btn-glow" @click="openModal">Escala de Glasgow</button>

    <dialog ref="modal">
      <h2>Escala de Glasgow</h2>
      <p class="calc-hint">Referencia — suma los tres componentes (rango 3-15). El cálculo lo realiza el clínico.</p>

      <div class="gcs-block">
        <h3>Apertura ocular</h3>
        <ul>
          <li>Espontánea — 4</li>
          <li>Al habla — 3</li>
          <li>Al dolor — 2</li>
          <li>Ninguna — 1</li>
        </ul>
      </div>

      <div class="gcs-block">
        <h3>Respuesta verbal</h3>
        <ul>
          <li>Orientado — 5</li>
          <li>Confuso — 4</li>
          <li>Inapropiado — 3</li>
          <li>Incomprensible — 2</li>
          <li>Ninguna — 1</li>
        </ul>
      </div>

      <div class="gcs-block">
        <h3>Respuesta motora</h3>
        <ul>
          <li>Obedece órdenes — 6</li>
          <li>Localiza dolor — 5</li>
          <li>Retira al dolor — 4</li>
          <li>Flexión anormal — 3</li>
          <li>Extensión — 2</li>
          <li>Ninguna — 1</li>
        </ul>
      </div>

      <p class="calc-hint">Referencia: 13-15 leve · 9-12 moderado · 3-8 grave.</p>

      <button class="btn" type="button" @click="closeModal">Cerrar</button>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const modal = ref(null);
const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>

<style scoped>
.gcs-block { margin-bottom: 0.85rem; }
.gcs-block h3 {
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-subtitle);
  margin: 0 0 0.3rem;
}
</style>
