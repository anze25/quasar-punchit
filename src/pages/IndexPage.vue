<template>
  <div
    class="spinner"
    v-if="loading"
  >
    <q-spinner
      color="primary"
      size="lg"
      :thickness="2"
    />
  </div>
  <div v-else>
    <q-page
      v-if="!user"
      padding
    >

      <q-card class="auth-tabs">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab
            name="login"
            label="Prijava"
          />
          <q-tab
            name="register"
            label="Registracija"
          />
        </q-tabs>

        <q-separator />

        <q-tab-panels
          v-model="tab"
          animated
        >
          <q-tab-panel name="login">
            <LoginRegister
              :tab="tab"
              :loggedIn="true"
            />
          </q-tab-panel>

          <q-tab-panel name="register">
            <LoginRegister
              :tab="tab"
              :loggedIn="false"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-page>
    <q-page
      v-else
      class="flex"
    >
      <div class="page-container">

        <div class="buttons-container flex">
          <div
            v-if="!isPunchedIn"
            class="buttons"
          >
            <q-btn
              rounded
              :disabled="isPunchedIn"
              color="primary"
              size="lg"
              padding="lg"
              label="Vnesi prihod"
              @click="showModalIn"
            >
            </q-btn>
            <q-btn
              rounded
              :disabled="isPunchedIn"
              color="primary"
              size="lg"
              padding="lg"
              label="Prihod"
              @click="punchIn"
            >
            </q-btn>
          </div>
          <div
            v-if="isPunchedIn"
            class="buttons"
          >
            <q-btn
              rounded
              :disabled="!isPunchedIn"
              color="primary"
              size="lg"
              padding="lg"
              label="Vnesi odhod"
              @click="showModalOut"
            >
            </q-btn>
            <q-btn
              rounded
              :disabled="!isPunchedIn"
              color="primary"
              size="lg"
              padding="lg"
              label="Odhod"
              @click="punchOut"
            >
            </q-btn>
          </div>
        </div>
        <div
          class="info-container"
          v-if="isPunchedIn"
          flex
        >
          <div>
            <q-select
              v-model="description"
              use-input
              placeholder="Opis Dela"
              input-debounce="0"
              hide-selected
              fill-input
              @new-value="addNewItem"
              @filter="filterFn"
              :options="options"
              new-value-mode="add-unique"
              style="width: 250px"
              class="q-mb-lg"
            />
          </div>
          <q-card>
            <q-card-section>Prisoten od: {{ niceTime(punchin) }} </q-card-section>
            <q-card-section>
              <q-chip
                outline
                size="xl"
                color="secondary"
              >{{
                updateCurrentTime()
              }}</q-chip>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-dialog
        v-model="modalIn"
        persistent
      >
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Dodaj prihod</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="punchinDate"
              label="Datum prihoda"
              outlined
            >
              <template v-slot:append>
                <q-icon
                  name="mdi-calendar"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="punchinDate">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-model="punchinTime"
              label="Ura prihoda"
              outlined
            >
              <template v-slot:append>
                <q-icon
                  name="mdi-clock-start"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      v-model="punchinTime"
                      format24h
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <samp></samp>
            </q-input>
          </q-card-section>

          <q-card-actions
            align="right"
            class="text-primary"
          >
            <q-btn
              flat
              label="prekliči"
              v-close-popup
            />
            <q-btn
              flat
              label="Vnesi prihod"
              @click="addPunchin"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog
        v-model="modalOut"
        persistent
      >
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Dodaj odhod</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="punchoutDate"
              label="Datum odhoda"
              outlined
            >
              <template v-slot:append>
                <q-icon
                  name="mdi-calendar"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="punchoutDate">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-model="punchoutTime"
              label="Ura odhoda"
              outlined
            >
              <template v-slot:append>
                <q-icon
                  name="mdi-clock-start"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      v-model="punchoutTime"
                      format24h
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              v-model="description"
              label="Opis dela"
              outlined
            ></q-input>
          </q-card-section>

          <q-card-actions
            align="right"
            class="text-primary"
          >
            <q-btn
              flat
              label="prekliči"
              v-close-popup
            />
            <q-btn
              flat
              label="Vnesi odhod"
              @click="addPunchout"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>


  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { date, LocalStorage, useQuasar } from "quasar";
import { supabase } from "src/supabase";
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/users.js";
import LoginRegister from "src/components/Auth/LoginRegister.vue";

const userStore = useUserStore(); // From users.js
const { errorMessage, punchin, user, loading, descriptions } = storeToRefs(userStore);


const tab = ref("login");
const $q = useQuasar();

const isPunchedIn = ref(false);
const isLoggedIn = ref(false);

const modalIn = ref(false);
const modalOut = ref(false);

const punchout = ref("");

const punchinTime = ref("");
const punchinDate = ref("");

const punchoutTime = ref("");
const punchoutDate = ref("");

const description = ref('');
const elapsedTime = ref("");

/* Descriptions */
const options = ref(descriptions.value)
const filterFn = (val, update, abort) => {
  update(() => {
    const needle = val.toLowerCase()
    options.value = descriptions.value.filter(v => v.toLowerCase().indexOf(needle) > -1)
  })
}

const addNewItem = async (description) => {

  if (description !== "" && !descriptions.value.includes(description)) {
    await supabase.from("punch_description").insert({
      name: description,
      user_id: user.value.id,
    });
  }
  fetchDescription();
};


const getSession = async () => {
  try {
    const account = await supabase.auth.getSession();
    if (account.data.session.user) {
      user.value = account.data.session.user;
      if (user.value) {
        const { data: alreadyLoggedIn } = await supabase
          .from("punched_users")
          .select()
          .eq("user_id", user.value.id);
        punchin.value = alreadyLoggedIn[0].punchin;

        if (alreadyLoggedIn) {
          punchin.value = alreadyLoggedIn[0].punchin;
          isPunchedIn.value = true;
        }
        fetchDescription();
      }

    }
  } catch (error) {
    console.error('Error fetching session:', error);
  } finally {
    loading.value = false;
  }
};

const fetchDescription = async () => {

  if (user.value) {
    const { data: descriptionData } = await supabase
      .from("punch_description")
      .select("name")
      .eq("user_id", user.value.id)
      .order("name", { ascending: true });

    const namesArray = descriptionData.map((row) => row.name); // extract names from object data

    descriptions.value = namesArray;
  }
};

/*  */

const currentTime = ref(new Date());
const updateCurrentTime = () => {
  currentTime.value = new Date();
  return msToTime(currentTime.value - punchin.value);
};
const updateTimeInterval = setInterval(updateCurrentTime, 1000);

const punchIn = async () => {
  punchin.value = Date.now();
  isPunchedIn.value = true;

  await supabase.from("punched_users").insert({
    punchin: punchin.value,
    user_id: user.value.id,
  });
};

const addPunchin = async () => {
  (punchin.value = new Date(
    punchinDate.value + " " + punchinTime.value
  ).getTime()),
    (isPunchedIn.value = true);
  modalIn.value = false;

  await supabase.from("punched_users").insert({
    punchin: punchin.value,
    user_id: user.value.id,
  });
};

const addPunchout = async () => {
  punchout.value = new Date(
    punchoutDate.value + " " + punchoutTime.value
  ).getTime();
  const now = Date.now();
  if (description.value === null) {
    description.value = "default";
  }
  if (punchout.value > now) {
    $q.notify({
      color: "negative",
      icon: "report_problem",
      message: "Odhod ne more biti v prihodnosti!",
      position: "top",

      timeout: Math.random() * 5000 + 3000,
    });
  } else if (punchin.value < punchout.value) {
    await supabase.from("punches").insert({
      punchin: punchin.value,
      punchout: new Date(
        punchoutDate.value + " " + punchoutTime.value
      ).getTime(),
      description: description.value,
      user_id: user.value.id,
    });
    $q.notify({
      message: "Vnos uspešno ustvarjen",
      icon: "mdi-check",
      color: "positive",
    });

    isPunchedIn.value = false;
    modalOut.value = false;
    await supabase.from("punched_users").delete().eq("user_id", user.value.id);

  } else if (punchin.value > punchout.value) {
    $q.notify({
      color: "negative",
      icon: "report_problem",
      message: "Odhod ne more biti pred prihodom!",
      position: "top",

      timeout: Math.random() * 5000 + 3000,
    });
  }

};

const punchOut = async () => {

  punchout.value = Date.now();
  isPunchedIn.value = false;
  if (description.value === null) {
    description.value = "default";
  }

  await supabase.from("punches").insert({
    punchin: punchin.value,
    punchout: punchout.value,
    description: description.value,
    user_id: user.value.id,
  });

  await supabase.from("punched_users").delete().eq("user_id", user.value.id);

  $q.notify({
    message: "Vnos uspešno ustvarjen",
    icon: "mdi-check",
    color: "positive",
  });
  isPunchedIn.value = false;
};

const showModalIn = () => {
  modalIn.value = true;
};
const showModalOut = () => {
  modalOut.value = true;
};

const niceTime = (value) => {
  return date.formatDate(value, "HH:mm");
};

const msToTime = (duration) => {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt(duration / (1000 * 60 * 60));

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
};

onMounted(async () => {
  await getSession()
});
</script>

<style scoped>
.buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  margin-top: 50%;
}

button {
  margin: 5px;
}

.page-container {
  display: flex;
  flex-direction: column;
  justify-content: top;
  margin-bottom: 10px;
  margin-left: auto;
  margin-right: auto;
}

.auth-tabs {
  max-width: 500px;
  margin: 0 auto;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
