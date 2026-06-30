<script setup lang="ts">
import { computed, inject } from 'vue';
import { formContextKey } from './form-context';

interface Props {
  name?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string | null;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false
});

const model = defineModel<string | boolean | undefined>({ required: true });

const inputId = `input-${crypto.randomUUID()}`;
const descId = `desc-${crypto.randomUUID()}`;

const formContext = inject(formContextKey, null);

const computedError = computed(() => {
  if (props.error) return props.error;

  if (formContext && props.name) {
    const formErrors = formContext.errors.value;
    const inputError = formErrors[props.name];

    if (Array.isArray(inputError)) {
      return inputError[0];
    }
    return inputError || null;
  }

  return null;
});

const isDisabled = computed(() => {
  if (props.disabled) return true;
  return formContext ? formContext.isSubmitting.value : false;
});

const inputClasses = computed(() => {
  return ['base-input__field', { 'base-input__field--error': !!computedError.value }];
});
</script>

<template>
  <div class="base-input">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required" aria-hidden="true">*</span>
    </label>

    <div v-if="type === 'checkbox'" class="base-input__checkbox-wrapper">
      <input
        :id="inputId"
        v-model="model"
        type="checkbox"
        :disabled="isDisabled"
        :required="required"
        :class="['base-input__checkbox', { 'base-input__checkbox--error': !!computedError }]"
        :aria-invalid="!!computedError"
        v-bind="$attrs"
      />
      <label v-if="label" :for="inputId" class="base-input__checkbox-label">
        {{ label }}
        <span v-if="required" class="base-input__required" aria-hidden="true"></span>
      </label>
    </div>

    <input
      v-if="type !== 'checkbox'"
      :id="inputId"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :required="required"
      :class="inputClasses"
      :aria-invalid="!!computedError"
      :aria-describedby="computedError || helper ? descId : undefined"
      v-bind="$attrs"
    />

    <p
      v-if="computedError"
      :id="descId"
      class="base-input__message base-input__message--error"
      role="alert"
    >
      {{ computedError }}
    </p>
    <p v-else-if="helper" :id="descId" class="base-input__message base-input__message--helper">
      {{ helper }}
    </p>
  </div>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.15vw;
  width: 100%;
  font-family: inherit;
  margin-bottom: 1.2vw;
  margin-top: 0.3vw;
}

.base-input__label {
  padding-left: 0.2vw;
  color: #bdbdbd;
  font-size: 1rem;
  font-weight: 700;
  text-align: left;
}

.base-input__required {
  color: #e91429;
  margin-left: 2px;
}

.base-input__field {
  background-color: #242424;
  color: #ffffff;
  border: 1px solid #727272;
  border-radius: 4px;
  padding: 12px;
  font-size: 0.9375rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.base-input__field::placeholder {
  color: #9c9c9c;
}

.base-input__field:not(:disabled):hover {
  border-color: #b3b3b3;
}

.base-input__field:focus {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.base-input__field:disabled {
  background-color: #121212;
  color: #727272;
  border-color: #3e3e3e;
  cursor: not-allowed;
}

.base-input__field--error {
  border-color: #e91429 !important;
}

.base-input__field--error:focus {
  box-shadow: 0 0 0 2px rgba(233, 20, 41, 0.3);
}

.base-input__message {
  margin: 0;
  font-size: 0.8125rem;
  text-align: left;
}

.base-input__message--error {
  color: #e91429;
  font-weight: 500;
}

.base-input__message--helper {
  color: #a7a7a7;
}

/* Контейнер-строка для чекбокса и его лейбла */
.base-input__checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-top: 0.2vw;
  user-select: none;
}

/* Базовое состояние кастомного чекбокса */
.base-input__checkbox {
  appearance: none; /* Скрываем стандартный чекбокс */
  -webkit-appearance: none;

  width: 20px;
  height: 20px;
  background-color: #242424;
  border: 1px solid #727272;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  flex-shrink: 0; /* Чтобы чекбокс не сжимался, если текст длинный */
}

/* Создаем галочку с помощью псевдоэлемента (рисуем её границами) */
.base-input__checkbox::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 10px;
  border: solid #141414; /* Цвет галочки (темный для контраста с ярким фоном) */
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0); /* Изначально галочка уменьшена до 0 */
  opacity: 0;
  transition:
    transform 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46),
    opacity 0.1s ease;
  margin-bottom: 2px; /* Микро-сдвиг для идеального центра */
}

/* Ховер на активном (не задизейбленном) чекбоксе */
.base-input__checkbox:not(:disabled):hover {
  border-color: #b3b3b3;
}

/* Состояние: Чекбокс Выбран (Checked) */
.base-input__checkbox:checked {
  background-color: #80ffac; /* Твой фирменный светло-зеленый акцент */
  border-color: #80ffac;
}

/* Показываем галочку при выборе */
.base-input__checkbox:checked::after {
  opacity: 1;
  transform: rotate(45deg) scale(1); /* Плавный эффект "вырастания" галочки */
}

/* Фокус для доступности с клавиатуры */
.base-input__checkbox:focus-visible {
  outline: none;
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(128, 255, 172, 0.3);
}

/* Состояние ошибки (Error) */
.base-input__checkbox--error {
  border-color: #e91429 !important;
}

.base-input__checkbox--error:focus-visible {
  box-shadow: 0 0 0 2px rgba(233, 20, 41, 0.3);
}

/* Состояние заблокирован (Disabled) */
.base-input__checkbox:disabled {
  background-color: #121212;
  border-color: #3e3e3e;
  cursor: not-allowed;
}

.base-input__checkbox:disabled:checked {
  background-color: #3e3e3e;
  border-color: #3e3e3e;
}

.base-input__checkbox:disabled:checked::after {
  border-color: #727272; /* Делаем галочку блеклой */
}

/* Лейбл, который стоит справа от чекбокса */
.base-input__checkbox-label {
  color: #e0e0e0;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  line-height: 1.2;
}

/* Если чекбокс заблокирован, делаем текст блеклым */
.base-input__checkbox:disabled + .base-input__checkbox-label {
  color: #727272;
  cursor: not-allowed;
}
</style>
