<template>
  <q-page v-if="punches.length">
    <q-list v-if="!loading" bordered separator>
      <q-item
        v-for="(punch, index) in punches"
        :key="index"
        clickable
        v-ripple
        bordered
      >
        <q-item-section>
          <div>Datum: {{ niceDate(punch.punchin) }}</div>
          <div class="box">
            <div class="q-mr-md">Prihod: {{ niceTime(punch.punchin) }}</div>
            <div>Odhod: {{ niceTime(punch.punchout) }}</div>
          </div>

          <div>Opis: {{ punch.description }}</div>

          <div class="box">
            <div class="q-mr-md">
              Trajanje: {{ msToTime(punch.punchout - punch.punchin) }}
            </div>
            <div>Nadure: {{ overtime(punch.id) }}</div>
          </div>
        </q-item-section>

        <q-item-section side>
          <q-btn color="secondary" icon="edit" flat round dense />
          <q-btn
            color="negative"
            icon="delete"
            flat
            round
            dense
            @click.stop="promptToDelete(punch.id)"
        /></q-item-section>
      </q-item>
    </q-list>
    <div class="spinner" v-else>
      <q-spinner color="primary" size="lg" :thickness="2" />
    </div>
    <!-- Bottom Btn -->
    <div class="absolute-bottom flex flex-center">
      <div class="q-mb-lg no-pointer-events">
        <q-btn
          @click="addPunch"
          class="all-pointer-events q-mr-sm"
          round
          color="primary"
          size="20px"
          icon="add"
        />
      </div>
      <div class="q-mb-lg no-pointer-events">
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

    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Punch</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="punchDialog.dateIn" label="Datum prihoda" outlined>
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="punchDialog.dateIn">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input v-model="punchDialog.timeIn" label="Ura prihoda" outlined>
            <template v-slot:append>
              <q-icon name="mdi-clock-start" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-time v-model="punchDialog.timeIn" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
            <samp></samp>
          </q-input>
          <q-input v-model="punchDialog.dateOut" label="Datum odhoda" outlined>
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="punchDialog.dateOut">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input v-model="punchDialog.timeOut" label="Ura odhoda" outlined>
            <template v-slot:append>
              <q-icon name="mdi-clock-end" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-time format24h v-model="punchDialog.timeOut">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
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

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add Punch" @click="addPunchToDatabase" />
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
          <q-icon name="check" color="primary" />
        </template>
        Trenutno ni vnosov v bazi
        <template v-slot:action>
          <q-btn @click="addPunch" color="primary" label="Nov vnos" flat />
        </template>
      </q-banner>
    </transition>

    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Punch</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="punchDialog.dateIn" label="Datum prihoda" outlined>
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="punchDialog.dateIn">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input v-model="punchDialog.timeIn" label="Ura prihoda" outlined>
            <template v-slot:append>
              <q-icon name="mdi-clock-start" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-time v-model="punchDialog.timeIn" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
            <samp></samp>
          </q-input>
          <q-input v-model="punchDialog.dateOut" label="Datum odhoda" outlined>
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="punchDialog.dateOut">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input v-model="punchDialog.timeOut" label="Ura odhoda" outlined>
            <template v-slot:append>
              <q-icon name="mdi-clock-end" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-time format24h v-model="punchDialog.timeOut">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
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

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add Punch" @click="addPunchToDatabase" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { date, useQuasar } from "quasar";

import { supabase } from "src/supabase";
const loading = ref(true);
const prompt = ref(false);
const $q = useQuasar();
const defaultDuration = 28800000;

const punchDialog = reactive({
  dateIn: "2024/01/01",
  timeIn: "00:30",
  dateOut: "2024/01/01",
  timeOut: "18:30",
  description: "Testni opis",
});

const niceDate = (value) => {
  return date.formatDate(value, "D.M.YYYY");
};

const niceTime = (value) => {
  return date.formatDate(value, "HH:mm");
};

const punches = ref([]);

const fetchData = async () => {
  loading.value = true;
  const { data: punchesData } = await supabase.from("punches").select();
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
      await supabase
        .from("punches")
        .delete()
        .eq("user_id", "741e8b4a-d3eb-4218-b4bf-a07a0c99d00c");

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
    title: "Delete",
    message: "Are you sure you want to delete this punch?",
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

const deletePunch = async (id) => {
  await supabase.from("punches").delete().eq("id", id);

  $q.notify({
    message: "Vnos uspešno odstranjen",
    icon: "mdi-check",
    color: "info",
  });
  fetchData();
};

const addPunchToDatabase = async () => {
  await supabase.from("punches").insert({
    punchin: new Date(punchDialog.dateIn + " " + punchDialog.timeIn).getTime(),
    punchout: new Date(
      punchDialog.dateOut + " " + punchDialog.timeOut
    ).getTime(),
    description: punchDialog.description,
    user_id: "741e8b4a-d3eb-4218-b4bf-a07a0c99d00c",
  });

  prompt.value = false;

  $q.notify({
    message: "Vnos uspešno ustvarjen",
    icon: "mdi-check",
    color: "positive",
  });
  fetchData();
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
