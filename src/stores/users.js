import { ref } from "vue";
import { defineStore } from "pinia";
import { supabase } from "src/supabase";
import { LocalStorage } from "quasar";
import { useRouter } from "vue-router";

export const useUserStore = defineStore("users", () => {
  const user = ref();
  const errorMessage = ref("");
  const loading = ref(true);
  const loadingUser = ref(false);
  const loggedIn = ref(false);
  const loggedFrom = ref(false);
  const router = useRouter();
  const descriptions = ref([]);
  const punchin = ref(0);

  // Validation of email from stackoverflow
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleLogin = async (credentials) => {
    const { email, password } = credentials;

    // 1. Validation of fields
    if (!validateEmail(email)) {
      return (errorMessage.value = "Email is Invalid!");
    }
    if (!password.length) {
      return (errorMessage.value = "Password cannot be empty!");
    }

    // 2. Send request to Supabase

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return (errorMessage.value = error.message);
    }

    const account = await supabase.auth.getSession();
    user.value = account.data.session.user;

    // If user is logged in, check for punch in
    if (user.value) {
      const { data: alreadyLoggedIn } = await supabase
        .from("punched_users")
        .select()
        .eq("user_id", user.value.id);
      // punchin.value = alreadyLoggedIn[0].punchin;

      const { data: descriptionData } = await supabase
        .from("punch_description")
        .select("name")
        .eq("user_id", user.value.id)
        .order("name", { ascending: true });

      const namesArray = descriptionData.map((row) => row.name); // extract names from object data

      descriptions.value = namesArray;

      if (alreadyLoggedIn.length) {
        punchin.value = alreadyLoggedIn[0].punchin;
      }
    }

    if (user.value) {
      const { data: descriptionData } = await supabase
        .from("punch_description")
        .select("name")
        .eq("user_id", user.value.id)
        .order("name", { ascending: true });

      const namesArray = descriptionData.map((row) => row.name); // extract names from object data

      descriptions.value = namesArray;
    }

    errorMessage.value = "";

    LocalStorage.set("loggedIn", true);
    LocalStorage.set("user", JSON.stringify(user.value));
  };

  const handleSignup = async (credentials) => {
    const { email, password, fullName } = credentials;
    if (password.length < 6) {
      return (errorMessage.value =
        "Password must be at least 6 characters long.");
    }

    // // Signup user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      loading.value = false;
      return (errorMessage.value = error.message);
    }

    errorMessage.value = "";

    LocalStorage.set("loggedIn", true);
    LocalStorage.set("user", JSON.stringify(user.value));
    router.push("/punches");
  };

  const getSession = async () => {
    try {
      const account = await supabase.auth.getSession();
      if (account.data.session.user) {
        user.value = account.data.session.user;
        if (user.value) {
          fetchDescription();
        }
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      loading.value = false;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    user.value = null;
    LocalStorage.remove("loggedIn");
    LocalStorage.remove("user");
    router.push({ name: "Home" });
  };

  // const getUser = async (next) => {
  //   localUser = await supabase.auth.getSession();
  //   if (localUser.data.session === null) {
  //     next({ name: "Home" });
  //   }
  //   next();
  // };

  const clearErrorMessage = () => {
    errorMessage.value = "";
  };

  return {
    user,
    errorMessage,
    handleLogin,
    handleSignup,
    handleLogout,
    // getUser,
    clearErrorMessage,
    loading,
    loadingUser,
    getSession,

    loggedFrom,
    descriptions,
    punchin,
  };
});
