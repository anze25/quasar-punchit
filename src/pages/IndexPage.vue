<template>
  <q-page class="flex">
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
            use-chips
            input-debounce="0"
            @new-value="addNewItem"
            :options="descriptions"
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
</template>

<script setup>
import { ref, computed } from "vue";
import { date, useQuasar } from "quasar";
import { supabase } from "src/supabase";
const $q = useQuasar()

const isPunchedIn = ref(false);
const modalIn = ref(false);
const modalOut = ref(false);
const punchin = ref("");
const punchout = ref("");

const punchinTime = ref("")
const punchinDate = ref("")

const punchoutTime = ref("")
const punchoutDate = ref("")

const description = ref(null);
const elapsedTime = ref("");
const descriptions = ref(["Triglav ", "Rizanski", "Telekom", "Zpiz", "Furs"]);

const addNewItem = (description) => {
  if (description !== "" && !descriptions.value.includes(description)) {
    descriptions.value.push(description);
  }
};

const currentTime = ref(new Date());
const updateCurrentTime = () => {
  currentTime.value = new Date();
  return msToTime(currentTime.value - punchin.value);
};
const updateTimeInterval = setInterval(updateCurrentTime, 1000);

const punchIn = () => {
  punchin.value = Date.now();
  isPunchedIn.value = true;
};

const addPunchin = () => {
  punchin.value = new Date(punchinDate.value + " " + punchinTime.value).getTime(),
    isPunchedIn.value = true;
  modalIn.value = false
};

const addPunchout = async () => {
  punchout.value = new Date(punchoutDate.value + " " + punchoutTime.value).getTime();
  const now = Date.now();
  if (description.value === null) {
    description.value = 'default'
  }
  if (punchout.value > now) {
    $q.notify({
      color: 'negative',
      icon: 'report_problem',
      message: 'Odhod ne more biti v prihodnosti!',
      position: 'top',

      timeout: Math.random() * 5000 + 3000
    })
  }

  else if (punchin.value < punchout.value) {
    await supabase.from("punches").insert({
      punchin: punchin.value,
      punchout: new Date(punchoutDate.value + " " + punchoutTime.value).getTime(),
      description: description.value,
      user_id: "741e8b4a-d3eb-4218-b4bf-a07a0c99d00c",
    });
    isPunchedIn.value = false;
    modalOut.value = false

  }

  else if (punchin.value > punchout.value) {

    $q.notify({
      color: 'negative',
      icon: 'report_problem',
      message: 'Odhod ne more biti pred prihodom!',
      position: 'top',

      timeout: Math.random() * 5000 + 3000
    })
  };

}





const punchOut = async () => {
  punchout.value = Date.now();
  isPunchedIn.value = false;
  if (description.value === null) {
    description.value = 'default'
  }

  await supabase.from("punches").insert({
    punchin: punchin.value,
    punchout: punchout.value,
    description: description.value,
    user_id: "741e8b4a-d3eb-4218-b4bf-a07a0c99d00c",
  });
  isPunchedIn.value = false;
};

const showModalIn = () => {
  modalIn.value = true
}
const showModalOut = () => {
  modalOut.value = true
}

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
</script>

<style scoped>
.buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
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
</style>
