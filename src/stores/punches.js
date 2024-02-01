import { ref } from "vue";
import { defineStore } from "pinia";
import { supabase } from "../supabase";

export const usePunchesStore = defineStore("punches", () => {
  const punch = ref({
    id: "",
    punchIn: "",
    punchOut: "",
    description: "",
  });
  const errorMessage = ref("");
  const loading = ref(false);
  // const loadingUser = ref(false);

  const clearErrorMessage = () => {
    errorMessage.value = "";
  };

  return {
    punch,
    errorMessage,

    clearErrorMessage,
    loading,
    // loadingUser,
  };
});
