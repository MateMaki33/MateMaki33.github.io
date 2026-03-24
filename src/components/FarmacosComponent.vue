<template>
  <div class="container farmacos-page">
    <h1>Fármacos</h1>

    <div class="search-wrapper">
      <span class="search-icon" aria-hidden="true">⌕</span>
      <input
        v-model="search"
        placeholder="Buscar fármaco..."
        class="search-input"
        type="text"
        autocomplete="off"
        spellcheck="false"
      />
      <span v-if="search" class="search-clear" @click="search = ''" title="Limpiar">✕</span>
    </div>

    <div class="drug-count">
      <span class="count-num">{{ filteredFarmacos.length }}</span>
      <span class="count-label">fármaco{{ filteredFarmacos.length !== 1 ? 's' : '' }}</span>
    </div>

    <div class="drug-grid">
      <button
        class="drug-btn"
        v-for="f in filteredFarmacos"
        :key="f.nombre"
        @click="openModal(f)"
      >
        <span class="drug-initial">{{ f.nombre.charAt(0) }}</span>
        <span class="drug-name">{{ f.nombre }}</span>
        <span class="drug-arrow">›</span>
      </button>
    </div>

    <dialog ref="modal" class="drug-modal">
      <div class="modal-header">
        <h2>{{ selected?.nombre }}</h2>
        <div class="modal-brands" v-if="selected?.marcas?.length">
          {{ selected.marcas.join(' · ') }}
        </div>
      </div>

      <div class="modal-body">

        <div class="modal-section" v-if="selected?.indicaciones?.length">
          <div class="section-label">Indicaciones</div>
          <ul>
            <li v-for="ind in selected.indicaciones" :key="ind">{{ ind }}</li>
          </ul>
        </div>

        <div class="modal-section" v-if="selected?.contraindicaciones?.length">
          <div class="section-label section-label--red">Contraindicaciones</div>
          <ul>
            <li v-for="c in selected.contraindicaciones" :key="c">{{ c }}</li>
          </ul>
        </div>

        <div class="modal-section" v-if="selected?.precauciones?.length">
          <div class="section-label section-label--amber">Precauciones</div>
          <ul>
            <li v-for="p in selected.precauciones" :key="p">{{ p }}</li>
          </ul>
        </div>

        <div class="modal-section" v-if="selected?.interacciones?.length">
          <div class="section-label section-label--amber">Interacciones</div>
          <ul>
            <li v-for="i in selected.interacciones" :key="i">{{ i }}</li>
          </ul>
        </div>

        <div class="modal-section" v-if="selected?.efectos_secundarios?.length">
          <div class="section-label">Efectos secundarios</div>
          <ul>
            <li v-for="e in selected.efectos_secundarios" :key="e">{{ e }}</li>
          </ul>
        </div>

        <div class="modal-section" v-if="selected?.embarazo">
          <div class="section-label section-label--amber">Embarazo</div>
          <p class="modal-text">{{ selected.embarazo }}</p>
        </div>

        <div class="modal-section" v-if="selected?.presentaciones?.length">
          <div class="section-label">Presentaciones</div>
          <ul>
            <li v-for="(p, i) in selected.presentaciones" :key="i">
              <span v-if="typeof p === 'string'">{{ p }}</span>
              <span v-else>
                <span v-for="(value, key) in p" :key="key">
                  <strong>{{ key.charAt(0).toUpperCase() + key.slice(1) }}:</strong> {{ value }}<br/>
                </span>
              </span>
            </li>
          </ul>
        </div>

        <div class="modal-section dosis-section" v-if="selected?.dosis?.length">
          <div class="section-label section-label--cyan">Dosificación</div>
          <ul>
            <li v-for="d in selected.dosis" :key="d">{{ d }}</li>
          </ul>
        </div>

      </div>

      <form method="dialog" class="modal-footer">
        <button class="btn">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import medicamentos from '../collections/medicamentos_normalizados.json';

const search = ref('')
const modal = ref(null)
const selected = ref(null)

const sortedFarmacos = computed(() =>
  [...medicamentos].sort((a, b) => a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase()))
)

const filteredFarmacos = computed(() => {
  const term = search.value.toLowerCase().trim();
  if (!term) return sortedFarmacos.value;
  return sortedFarmacos.value.filter(f => f.nombre.toLowerCase().startsWith(term));
});

const openModal = (f) => {
  selected.value = f;
  modal.value?.showModal();
}
</script>

<style scoped>
/* ── Page layout ── */
.farmacos-page {
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}

/* ── Search ── */
.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: var(--color-primary);
  opacity: 0.7;
  pointer-events: none;
  line-height: 1;
}

.search-input {
  width: 100%;
  padding: 0.85rem 2.75rem 0.85rem 2.75rem;
  border-radius: 10px;
  border: 1px solid rgba(45, 156, 219, 0.3);
  background: rgba(5, 16, 30, 0.95);
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: 1rem;
  height: auto;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(45, 156, 219, 0.15);
}

.search-input::placeholder {
  color: rgba(228, 239, 248, 0.3);
}

.search-clear {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(228, 239, 248, 0.4);
  cursor: pointer;
  font-size: 0.85rem;
  transition: color 0.15s ease;
  line-height: 1;
  padding: 0.25rem;
}

.search-clear:hover {
  color: var(--color-subtitle);
}

/* ── Drug count ── */
.drug-count {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  align-self: flex-start;
  padding-left: 0.25rem;
}

.count-num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-subtitle);
}

.count-label {
  font-family: var(--font-display);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(228, 239, 248, 0.4);
}

/* ── Drug Grid ── */
.drug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.6rem;
  width: 100%;
}

/* ── Drug Button ── */
.drug-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(10, 26, 46, 0.8);
  border: 1px solid rgba(45, 156, 219, 0.2);
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
  min-height: 48px;
  position: relative;
  overflow: hidden;
}

.drug-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-primary);
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 2px;
}

.drug-btn:hover {
  background: rgba(45, 156, 219, 0.1);
  border-color: rgba(45, 156, 219, 0.45);
  transform: translateX(2px);
}

.drug-btn:hover::before {
  opacity: 1;
}

.drug-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 6px;
  background: rgba(45, 156, 219, 0.12);
  border: 1px solid rgba(45, 156, 219, 0.2);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-subtitle);
  text-transform: uppercase;
}

.drug-name {
  flex: 1;
  font-size: 0.88rem;
  line-height: 1.3;
}

.drug-arrow {
  color: rgba(45, 156, 219, 0.4);
  font-size: 1.1rem;
  font-weight: 700;
  transition: color 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
}

.drug-btn:hover .drug-arrow {
  color: var(--color-primary);
  transform: translateX(2px);
}

/* ── Modal ── */
.drug-modal {
  max-width: min(92vw, 680px);
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 14px;
  padding: 0;
  box-shadow: var(--shadow-dialog);
}

.drug-modal::backdrop {
  background: rgba(2, 11, 22, 0.9);
  backdrop-filter: blur(8px);
}

.modal-header {
  padding: 1.5rem 2rem 1.25rem;
  border-bottom: 1px solid rgba(45, 156, 219, 0.15);
  position: sticky;
  top: 0;
  background: var(--color-card-bg);
  z-index: 1;
}

.modal-header h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-subtitle);
  margin: 0 0 0.35rem;
  -webkit-text-fill-color: var(--color-subtitle);
  border-bottom: none;
  padding: 0;
}

.modal-brands {
  font-size: 0.82rem;
  color: rgba(228, 239, 248, 0.45);
  letter-spacing: 0.04em;
  font-style: italic;
}

.modal-body {
  padding: 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.section-label {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary);
  padding-bottom: 0.3rem;
  border-bottom: 1px solid rgba(45, 156, 219, 0.15);
  margin-bottom: 0.25rem;
}

.section-label--red   { color: #f87171; border-bottom-color: rgba(248, 113, 113, 0.2); }
.section-label--amber { color: var(--neon-orange); border-bottom-color: rgba(245, 158, 11, 0.2); }
.section-label--cyan  { color: var(--color-subtitle); }

.modal-text {
  font-size: 0.9rem;
  color: rgba(228, 239, 248, 0.75);
  line-height: 1.55;
  margin: 0;
}

.dosis-section {
  background: rgba(45, 156, 219, 0.05);
  border: 1px solid rgba(45, 156, 219, 0.18);
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.modal-footer {
  padding: 1rem 2rem 1.5rem;
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(45, 156, 219, 0.1);
}

/* Responsive */
@media (max-width: 600px) {
  .drug-grid {
    grid-template-columns: 1fr;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }
}
</style>
