<template>
  <q-page class="flex flex-center">


    <input
      type="file"
      ref="myfile"
      @change="csvJSON($event)"
    />
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
          <q-btn
            color="secondary"
            icon="edit"
            flat
            round
            dense
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
    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { date, useQuasar } from "quasar";
import { supabase } from "src/supabase";
const $q = useQuasar();
const punches = ref([])

const csvJSON = async (event) => {
  const file = event.target.files.item(0)
  const csv = await file.text();
  const objLines = []
  const lines = csv.split('\n')
  for (var i = 0; i < lines.length; i++) {
    var obj = lines[i].split(',')
    if (obj[0].length === 19) { // cut of first and last item in csv file

      const punchin = new Date(obj[0]).getTime();
      const punchout = new Date(obj[1]).getTime();
      let description = obj[6];
      if (description != null) {
        // desc = desc.replace(/"/g, "").replace("12", '12').replace("14", '14"').replace("8", '8"');
        description = description.replace(/"/g, "");
      }
      if (description === '' || description == null) {
        description = 'Sodišče Kern';
      }


      await supabase.from("punches").insert({
        punchin: punchin,
        punchout: punchout,
        description: description,
        user_id: "741e8b4a-d3eb-4218-b4bf-a07a0c99d00c",
      });
      $q.notify({
        message: "Vnos uspešno ustvarjen",
        icon: "mdi-check",
        color: "positive",
      });
    }


  }

}


const niceDate = (value) => {
  return date.formatDate(value, "D.M.YYYY");
};

const niceTime = (value) => {
  return date.formatDate(value, "HH:mm");
};



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
</script>
