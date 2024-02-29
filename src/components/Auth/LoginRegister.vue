<template>
  <form @submit.prevent="submitForm">
    <div class="row q-mb-md">
      <q-banner class="bg-grey-3 col">
        <template v-slot:avatar>
          <q-icon
            name="account_circle"
            color="primary"
          />
        </template>
        <!-- {{ titleCase(tab) }} -->
      </q-banner>
    </div>
    <div class="row q-mb-md">
      <q-input
        v-model="userCredentials.email"
        ref="email"
        class="col"
        label="Email"
        outlined
        stack-label
      />
    </div>
    <div class="row q-mb-md">
      <q-input
        v-model="userCredentials.password"
        ref="password"
        type="password"
        class="col"
        label="Geslo"
        outlined
        stack-label
      />
    </div>
    <div class="row q-mb-md">
      <q-input
        v-if="tab === 'register'"
        v-model="userCredentials.fullName"
        placeholder=""
        ref="name"
        type="text"
        class="col"
        label="Ime in priimek"
        outlined
        stack-label
      />
    </div>
    <div class="row">
      <q-space />
      <q-btn
        :loggedIn='loggedIn'
        color="primary"
        :label="tab"
        type="submit"
        @click="handleOk"
      />
    </div>
    <div
      v-if="errorMessage"
      type="danger"
    >{{ errorMessage }}</div>
  </form>
</template>

<script setup>
import { reactive, onMounted } from 'vue'

import { useUserStore } from '../../stores/users.js';
import { storeToRefs } from 'pinia';
import { supabase } from "src/supabase";

const userStore = useUserStore(); // From users.js
const { errorMessage, loading, user } = storeToRefs(userStore);

const getSession = async () => {
  const account = await supabase.auth.getSession()
  user.value = account.data.session.user
}
const props = defineProps(['tab', 'loggedIn']);

const userCredentials = reactive({
  email: '',
  password: '',
  fullName: ''

});

// Filter
const titleCase = (value) => {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
const handleOk = async (e) => {

  if (props.loggedIn) {
    await userStore.handleLogin({
      password: userCredentials.password,
      email: userCredentials.email
    });
    clearUserCredentialsInput();

  } else {
    await userStore.handleSignup(userCredentials);
    clearUserCredentialsInput();
  }

}

if (user.value) {
  // visible.value = false;
  clearUserCredentialsInput();

}

const clearUserCredentialsInput = () => {
  userCredentials.email = '';
  userCredentials.password = '';

  userStore.clearErrorMessage();
};

onMounted(() => {

});


</script>

<style></style>
