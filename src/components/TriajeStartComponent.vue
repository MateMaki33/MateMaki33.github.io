<template>
  <div class="container">
    <!-- Pantalla inicial -->
    <div class="card" v-if="!activeQuestion && !finalClassification">
      <h1>Método START</h1>
      <button @click="startTriage" class="btn neon">INICIAR TRIAGE</button>

      <div class="legend">
        <h2>Clasificaciones:</h2>
        <ul>
          <li
            v-for="category in triageData.categorias_triaje"
            :key="category.color"
            :class="`tag-${category.color.toLowerCase()}`"
          >
            <span class="dot"></span>
            <strong>{{ category.color }}:</strong> {{ category.descripcion }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Pregunta activa -->
    <div class="card" v-if="activeQuestion">
      <h2>{{ activeQuestion.parametro }}</h2>
      <p v-if="activeQuestion.evaluacion">{{ activeQuestion.evaluacion }}</p>

      <div class="options">
        <button
          v-for="(option, index) in activeQuestionOptions"
          :key="index"
          class="btn neon-option"
          @click="selectOption(option)"
        >
          {{ option.condition }}
        </button>
      </div>

      <button @click="resetTriage" class="btn ghost">Reiniciar</button>
    </div>

    <!-- Resultado final -->
    <div class="card" v-if="finalClassification">
      <h2>Resultado Final</h2>
      <div :class="`final-box tag-${finalClassification.color.toLowerCase()}`">
        <span class="dot"></span>
        <h3>{{ finalClassification.color }}</h3>
        <p>{{ finalClassification.descripcion }}</p>
      </div>
      <button @click="resetTriage" class="btn ghost">Nuevo Triaje</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import triageData from '../collections/start.json';

const currentStepIndex = ref(0);
const activeQuestion = ref(null);
const finalClassification = ref(null);

const startTriage = () => {
  currentStepIndex.value = 0;
  finalClassification.value = null;
  setActiveQuestion();
};

const setActiveQuestion = () => {
  activeQuestion.value = triageData.pasos_evaluacion[currentStepIndex.value] || null;
};

const activeQuestionOptions = computed(() => {
  if (!activeQuestion.value) return [];
  return activeQuestion.value.acciones_decision.flatMap(decision => {
    if (decision.sub_condiciones) {
      return decision.sub_condiciones.map(sub => ({
        condition: `${decision.condicion} → ${sub.condicion}`,
        classification: sub.clasificacion,
        nextSteps: sub.siguiente_paso,
      }));
    }
    return [{
      condition: decision.condicion,
      classification: decision.clasificacion,
      nextSteps: decision.siguiente_paso,
    }];
  });
});

const selectOption = (option) => {
  const { classification, nextSteps } = option;

  // Si hay clasificación final, se muestra resultado y termina
  if (['Rojo', 'Amarillo', 'Verde', 'Negro'].includes(classification)) {
    finalClassification.value = triageData.categorias_triaje.find(c => c.color === classification);
    activeQuestion.value = null;
    return;
  }

  // Caso especial: puede caminar → Verde
  if (
    activeQuestion.value.parametro === "Ambulación (¿Puede caminar?)" &&
    option.condition.includes("Puede caminar")
  ) {
    finalClassification.value = triageData.categorias_triaje.find(c => c.color === 'Verde');
    activeQuestion.value = null;
    return;
  }

  // Validar nextSteps para evitar errores
  const pasos = 
    nextSteps === undefined || nextSteps === null
      ? []
      : Array.isArray(nextSteps)
      ? nextSteps
      : [nextSteps];

  for (let paso of pasos) {
    if (paso.startsWith("Continuar con")) {
      const param = paso.split("'")[1];
      const next = triageData.pasos_evaluacion.find(step => step.parametro === param);
      if (next) {
        currentStepIndex.value = triageData.pasos_evaluacion.indexOf(next);
        setActiveQuestion();
        return;
      }
    }
  }

  // Si no encontró siguiente paso, avanza secuencialmente
  currentStepIndex.value++;
  setActiveQuestion();
};

const resetTriage = () => {
  currentStepIndex.value = 0;
  activeQuestion.value = null;
  finalClassification.value = null;
};
</script>

<style scoped>

.card{
    margin-top: 20px;
}

.neon {
  background: linear-gradient(45deg, #ff9900, #ff33cc);
  color: #fff;
  text-shadow: 0 0 5px #ff99cc;
  box-shadow: 0 0 15px #ff33cc;
}

.neon:hover {
  box-shadow: 0 0 25px #ff33cc, 0 0 30px #ff9900;
}


.ghost {
  background: transparent;
  color: #999;
  border: 1px solid #444;
  margin-top: 1rem;
}

.ghost:hover {
  color: #fff;
  border-color: #fff;
}

/* Classification tags */
.legend ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  display: flex;
  flex-direction: column; /* apila los li en columna */
  gap: 0.75rem;
}

.legend li {
  display: flex;         /* para que el punto y texto estén en fila dentro del li */
  align-items: center;
  gap: 0.5rem;

  @media(max-width: 768px){
    flex-direction: column;
  }
}

.legend li strong {
  margin-right: 0.25rem;
}

.tag-rojo .dot { background-color: red; }
.tag-amarillo .dot { background-color: yellow; }
.tag-verde .dot { background-color: green; }
.tag-negro .dot { background-color: gray; }

.dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.final-box {
  border: 2px solid;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  background-color: #1a1a1a;
}

.tag-rojo { border-color: red; }
.tag-amarillo { border-color: yellow; }
.tag-verde { border-color: green; }
.tag-negro { border-color: gray; }

.options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
