<template>
  <router-view />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "src/supabase";
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/users.js';
const userStore = useUserStore(); // From users.js
const { errorMessage, loading, init, setUser } = storeToRefs(userStore);
const user = supabase.auth.getUser()


onMounted(() => {


});

</script>
