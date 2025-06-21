<template>
  <div class="container">
    <h1>Fármacos</h1>

    <input
      v-model="search"
      placeholder="Buscar fármaco..."
      class="input"
      type="text"
    />

    <div class="grid scrollable">
      <button
        class="btn"
        v-for="f in filteredFarmacos"
        :key="f.nombre"
        @click="openModal(f)"
      >
        {{ f.nombre }}
      </button>
    </div>

    <dialog ref="modal" class="wide-modal">
      <h2>{{ selected?.nombre }}</h2>
      <div class="modal-content">
        <p><strong>Marcas:</strong> {{ selected?.marcas?.join(', ') || '—' }}</p>
        <p><strong>Indicaciones:</strong></p>
        <ul><li v-for="ind in selected?.indicaciones" :key="ind">{{ ind }}</li></ul>

        <p><strong>Contraindicaciones:</strong></p>
        <ul><li v-for="c in selected?.contraindicaciones" :key="c">{{ c }}</li></ul>

        <p v-if="selected?.precauciones?.length"><strong>Precauciones:</strong></p>
        <ul><li v-for="p in selected?.precauciones" :key="p">{{ p }}</li></ul>

        <p v-if="selected?.interacciones?.length"><strong>Interacciones:</strong></p>
        <ul><li v-for="i in selected?.interacciones" :key="i">{{ i }}</li></ul>

        <p v-if="selected?.efectos_secundarios?.length"><strong>Efectos secundarios:</strong></p>
        <ul><li v-for="e in selected?.efectos_secundarios" :key="e">{{ e }}</li></ul>

        <p v-if="selected?.embarazo"><strong>Embarazo:</strong> {{ selected.embarazo }}</p>

        <p><strong>Presentaciones:</strong></p>
        <ul>
          <li v-for="(p, i) in selected?.presentaciones" :key="i">
            <span v-if="typeof p === 'string'">{{ p }}</span>
            <span v-else>
              <span v-for="(value, key) in p" :key="key">
                <strong>{{ key.charAt(0).toUpperCase() + key.slice(1) }}:</strong> {{ value }}<br/>
              </span>
            </span>
          </li>
        </ul>

        <p><strong>Dosis:</strong></p>
        <ul><li v-for="d in selected?.dosis" :key="d">{{ d }}</li></ul>
      </div>

      <form method="dialog">
        <button class="btn btn-close">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import medicamentos from '../collections/medicamentos_normalizados.json'; // Asegúrate de que la ruta sea correcta

const search = ref('')
const modal = ref(null)
const selected = ref(null)

const sortedFarmacos = computed(() =>
  [...medicamentos].sort((a, b) => a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase()))
)

const filteredFarmacos = computed(() => {
  const searchTerm = search.value.toLowerCase().trim(); 

  if (!searchTerm) {
    return sortedFarmacos.value;
  }

  return sortedFarmacos.value.filter(f =>
    f.nombre.toLowerCase().startsWith(searchTerm) 
  );
});


const openModal = (f) => {
  selected.value = f
  modal.value?.showModal()
}
</script>

<style scoped>
/* Estilos generales para el contenedor */
.container {
overflow-y: scroll;
}
/* Estilos para el input de búsqueda */


/* Estilos para el modal */
.wide-modal {
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  background-color: #2a2a2a; /* Fondo oscuro del modal */
  border: 1px solid var(--neon-orange);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.wide-modal::backdrop {
  background-color: rgba(0, 0, 0, 0.6);
}

.wide-modal h2 {
  color: var(--neon-orange);
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.modal-content {
  margin: 1rem 0;
  font-size: 1.1rem;
  color: var(--color-text);
  line-height: 1.6;
}

.modal-content p {
  margin-bottom: 0.75rem;
}

.modal-content strong {
  color: var(--neon-orange); /* Un tono más claro del primario para resaltar */
}

.modal-content ul {
  margin-left: 1.5rem;
  list-style-type: disc; /* Puntos para las listas */
  padding-left: 0; /* Asegura que la lista se alinee correctamente */
  margin-bottom: 0.75rem;
}

.modal-content li {
  margin-bottom: 0.25rem;
}

/* Botón de cerrar modal */
.btn-close {
  display: block;
  margin: 1.5rem auto 0;
  background-color: var(--neon-orange); 
  border-color: var(--neon-orange);
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
}

.btn-close:hover {
  background-color:  #bd2130;
  border-color:  #a71d2a;
}


</style>