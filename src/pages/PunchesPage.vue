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
  <div v-else> <q-page v-if="punches.length">
      <q-scroll-area style="height: 720px;">
        <q-list
          bordered
          separator
        >
          <q-item
            v-for="(punch, index) in punches"
            :key="index"
            clickable
            v-ripple
            bordered
          >
            <q-item-section>
              <div style="text-align: left">
                <strong>Datum: </strong>{{ niceDate(punch.punchin) }}
                <br />
                <strong>Prihod: </strong>{{ niceTime(punch.punchin) }}
                <strong>Odhod: </strong>{{ niceTime(punch.punchout) }}
                <br />
                <strong>Opis: </strong>{{ punch.description }}
                <br />
                <strong>Trajanje: </strong>{{ msToTime(punch.punchout - punch.punchin) }}
                <strong>Nadure: </strong>{{ overtime(punch.id) }}
                <br />
              </div>
            </q-item-section>

            <q-item-section side>
              <q-btn
                color="secondary"
                icon="edit"
                flat
                round
                dense
                @click.stop="promptToEdit(punch)"
              />
              <q-btn
                color="negative"
                icon="delete"
                flat
                round
                dense
                @click.stop="promptToDelete(punch.id)"
              /></q-item-section>
          </q-item>
          <Observer
            v-if="punches.length"
            @intersect="fetchNextSet"
          />
        </q-list>


      </q-scroll-area>
      <!-- Bottom Btn -->
      <div class="flex flex-center">
        <div class="no-pointer-events">
          <q-btn
            @click="addPunch"
            class="all-pointer-events q-mr-sm"
            round
            color="primary"
            size="20px"
            icon="add"
          />
        </div>
        <div class="no-pointer-events ">
          <q-btn
            @click="deleteAll"
            class="all-pointer-events"
            round
            color="negative"
            size="20px"
            icon="delete"
          />
        </div>
      </div>

      <q-dialog
        v-model="prompt"
        persistent
      >
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Add Punch</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="punchDialog.dateIn"
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
                    <q-date v-model="punchDialog.dateIn">
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
              v-model="punchDialog.timeIn"
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
                      v-model="punchDialog.timeIn"
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
            <q-input
              v-model="punchDialog.dateOut"
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
                    <q-date v-model="punchDialog.dateOut">
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
              v-model="punchDialog.timeOut"
              label="Ura odhoda"
              outlined
            >
              <template v-slot:append>
                <q-icon
                  name="mdi-clock-end"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      format24h
                      v-model="punchDialog.timeOut"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Zapri"
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
              v-model="punchDialog.description"
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
              label="Dodaj vnos"
              @click="addPunchToDatabase"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog
        v-model="promptEdit"
        persistent
      >
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Edit Punch</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="currentPunch.dateIn"
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
                    <q-date v-model="currentPunch.dateIn">
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
              v-model="currentPunch.timeIn"
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
                      v-model="currentPunch.timeIn"
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
            <q-input
              v-model="currentPunch.dateOut"
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
                    <q-date v-model="currentPunch.dateOut">
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
              v-model="currentPunch.timeOut"
              label="Ura odhoda"
              outlined
            >
              <template v-slot:append>
                <q-icon
                  name="mdi-clock-end"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      format24h
                      v-model="currentPunch.timeOut"
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
              v-model="currentPunch.description"
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
              label="Prekliči"
              v-close-popup
            />
            <q-btn
              flat
              label="Uredi vnos"
              @click="updatePunchinDatabase"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
    <q-page v-else>
      <transition
        appear
        enter-active-class="animated zoomIn"
        leave-active-class="animated zoomOut absolute-top"
      >
        <q-banner class="bg-grey-3">
          <template v-slot:avatar>
            <q-icon
              name="check"
              color="primary"
            />
          </template>
          Trenutno ni vnosov v bazi
          <template v-slot:action>
            <q-btn
              @click="addPunch"
              color="primary"
              label="Nov vnos"
              flat
            />
          </template>
        </q-banner>
      </transition>

      <q-dialog
        v-model="prompt"
        persistent
      >
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Add Punch</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="punchDialog.dateIn"
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
                    <q-date v-model="punchDialog.dateIn">
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
              v-model="punchDialog.timeIn"
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
                      v-model="punchDialog.timeIn"
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
            <q-input
              v-model="punchDialog.dateOut"
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
                    <q-date v-model="punchDialog.dateOut">
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
              v-model="punchDialog.timeOut"
              label="Ura odhoda"
              outlined
            >
              <template v-slot:append>
                <q-icon
                  name="mdi-clock-end"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      format24h
                      v-model="punchDialog.timeOut"
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
              v-model="punchDialog.description"
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
              label="Prekliči"
              v-close-popup
            />
            <q-btn
              flat
              label="Dodaj prihod"
              @click="addPunchToDatabase"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { date, LocalStorage, useQuasar } from "quasar";

import { supabase } from "src/supabase";
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/users.js";
import Observer from "../components/Observer.vue";
const userStore = useUserStore(); // From users.js
const loading = ref(true)

const { errorMessage, user, getSession } = storeToRefs(userStore);

// const loading = ref(true);
const prompt = ref(false);
const promptEdit = ref(false);
const $q = useQuasar();
const defaultDuration = 28800000;
const lastPunchIndex = ref(8)
const reachEnd = ref(false);

const punchDialog = reactive({
  dateIn: "2024/01/01",
  timeIn: "00:30",
  dateOut: "2024/01/01",
  timeOut: "18:30",
  description: "Testni opis",
});

const currentPunch = ref({
  dateIn: "",
  timeIn: "",
  dateOut: "",
  timeOut: "",
  description: "",
  id: "",
});

const niceDate = (value) => {
  return date.formatDate(value, "D.M.YYYY");
};

const niceTime = (value) => {
  return date.formatDate(value, "HH:mm");
};
const punches = ref([]);

const fetchData = async () => {
  const account = await supabase.auth.getSession();
  user.value = account.data.session.user;
  loading.value = true;

  const { data: punchesData } = await supabase
    .from("punches")
    .select()
    .eq("user_id", user.value.id)
    .range(0, lastPunchIndex.value)
    .order("punchout", { ascending: false });
  // .eq('owner_id', user.value.id);

  punches.value = punchesData;
  loading.value = false;
};
const msToTime = (duration) => {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt(duration / (1000 * 60 * 60));

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + ":" + minutes;
};
const overtime = (id) => {
  const punchinValue = punches.value.find((punch) => punch.id === id).punchin;
  const punchoutValue = punches.value.find((punch) => punch.id === id).punchout;
  const overtime = punchoutValue - punchinValue - defaultDuration;
  const dayOfWeek = date.getDayOfWeek(punchinValue);

  if (dayOfWeek === 6 || dayOfWeek === 7) {
    return msToTime(punchoutValue - punchinValue);
  } else if (punchoutValue - punchinValue - defaultDuration < 0) {
    return "00:00";
  } else {
    return msToTime(punchoutValue - punchinValue - defaultDuration);
  }
};
const addPunch = () => {
  prompt.value = true;
};
const deleteAll = () => {
  $q.dialog({
    title: "Delete",
    message: "Ste prepričani da želite zbrisati vse vnose?",
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      await supabase.from("punches").delete().eq("user_id", user.value.id);

      $q.notify({
        message: "Vnos uspešno odstranjen",
        icon: "mdi-check",
        color: "info",
      });
      fetchData();
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
};
const promptToDelete = (id) => {
  $q.dialog({
    title: "Odstrani",
    message: "Ste prepričani, da želite odstraniti vnos?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      deletePunch(id);
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
};
const promptToEdit = (punch) => {
  currentPunch.value = {
    dateIn: niceDate(punch.punchin),
    timeIn: niceTime(punch.punchin),
    dateOut: niceDate(punch.punchout),
    timeOut: niceTime(punch.punchout),
    description: punch.description,
    id: punch.id,
  };
  $q.dialog({
    title: "Uredi",
    message: "Ste prepričani, da želite popraviti?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      currentPunch.value = {
        dateIn: date.formatDate(punch.punchin, "YYYY/MM/DD"),
        timeIn: niceTime(punch.punchin),
        dateOut: date.formatDate(punch.punchout, "YYYY/MM/DD"),
        timeOut: niceTime(punch.punchout),
        description: punch.description,
        id: punch.id,
      };
      promptEdit.value = true;
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
};
const deletePunch = async (id) => {
  await supabase.from("punches").delete().eq("id", id);

  $q.notify({
    message: "Vnos uspešno odstranjen",
    icon: "mdi-check",
    color: "info",
  });
  fetchData();
};

const updatePunchinDatabase = async (id) => {


  await supabase
    .from("punches")
    .update({
      punchin: new Date(
        currentPunch.value.dateIn + " " + currentPunch.value.timeIn
      ).getTime(),
      punchout: new Date(
        currentPunch.value.dateOut + " " + currentPunch.value.timeOut
      ).getTime(),
      description: currentPunch.value.description,
    })
    .eq("id", currentPunch.value.id);

  $q.notify({
    message: "Vnos uspešno posodobljen",
    icon: "mdi-check",
    color: "info",
  });
  promptEdit.value = false;
  fetchData();
};

const addPunchToDatabase = async () => {
  await supabase.from("punches").insert({
    punchin: new Date(punchDialog.dateIn + " " + punchDialog.timeIn).getTime(),
    punchout: new Date(
      punchDialog.dateOut + " " + punchDialog.timeOut
    ).getTime(),
    description: punchDialog.description,
    user_id: user.value.id,
  });

  prompt.value = false;

  $q.notify({
    message: "Vnos uspešno ustvarjen",
    icon: "mdi-check",
    color: "positive",
  });
  fetchData();
};

const fetchNextSet = async () => {
  if (!reachEnd.value) {
    const { data: punchesData } = await supabase
      .from("punches")
      .select()
      .eq("user_id", user.value.id)
      .range(lastPunchIndex.value + 1, lastPunchIndex.value + 8)
      .order("punchout", { ascending: false });


    punches.value = [
      ...punches.value,
      ...punchesData
    ]

    lastPunchIndex.value = lastPunchIndex.value + 8;

    if (!punchesData.length) {
      reachEnd.value = true;
    }
  }
};

onMounted(() => {
  fetchData();

});
</script>

<style scoped>
.box {
  display: flex;
  align-items: flex-start;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
