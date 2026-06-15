<template>
  <div class="calc-wrapper">
    <button class="btn-glow" @click="openModal">Calcular Glasgow</button>

    <dialog ref="modal">
      <h2>Escala de Glasgow</h2>
      <form method="dialog" @submit.prevent>

        <div class="form-group">
          <label>Apertura ocular</label>
          <select v-model.number="ocular">
            <option :value="4">Espontánea (4)</option>
            <option :value="3">Al habla (3)</option>
            <option :value="2">Al dolor (2)</option>
            <option :value="1">Ninguna (1)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Respuesta verbal</label>
          <select v-model.number="verbal">
            <option :value="5">Orientado (5)</option>
            <option :value="4">Confuso (4)</option>
            <option :value="3">Inapropiado (3)</option>
            <option :value="2">Incomprensible (2)</option>
            <option :value="1">Ninguna (1)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Respuesta motora</label>
          <select v-model.number="motora">
            <option :value="6">Obedece órdenes (6)</option>
            <option :value="5">Localiza dolor (5)</option>
            <option :value="4">Retira al dolor (4)</option>
            <option :value="3">Flexión anormal (3)</option>
            <option :value="2">Extensión (2)</option>
            <option :value="1">Ninguna (1)</option>
          </select>
        </div>

        <div class="score-panel" :class="scoreClass">
          <div class="score-value">{{ total }}</div>
          <div class="score-details">
            <div class="score-label">Glasgow</div>
            <div class="score-interpretation">{{ interpretacion }}</div>
          </div>
        </div>

        <button class="btn" type="button" @click="closeModal">Cerrar</button>
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
  if (t >= 9)  return 'Traumatismo moderado';
  return 'Traumatismo grave';
});

const scoreClass = computed(() => {
  const t = total.value;
  if (t >= 13) return 'score-mild';
  if (t >= 9)  return 'score-moderate';
  return 'score-severe';
});

const openModal  = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>
