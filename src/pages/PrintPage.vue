<template>
  <q-page class="flex flex-center">
    <div class="page-container">
      <div class="q-pa-md">
        <div class="q-pb-sm">
          <q-btn
            v-if="!dateRange"
            color="white"
            text-color="black"
            label="Izberi datum"
            @click="dateRange = true"
          />
          <q-btn
            v-if="dateRange"
            color="white"
            text-color="black"
            label="kreiraj report"
            @click="createReport"
          />

        </div>

        <q-date
          v-if="dateRange"
          v-model="model"
          range
        />
      </div>
      <div v-if="filteredPunches.length">
        <div
          v-if="report"
          v-print
          class="q-pa-md"
        >

          <div
            class="printReport"
            id="printReport"
          >
            <div class="potdilo">
              <h2 style="text-align: left">POTRDILO O OPRAVLJENH URAH</h2>
              <p>
                <span style="width: 100%; text-align: left; padding-left: 1em">delavec (-ka) </span><span id="user">{{
                  user.user_metadata.full_name
                }} </span><span style="padding-left: 3em">mesec:
                  <span style="text-transform: uppercase; text-decoration: underline">{{ monthNames[month - 1]
                  }}</span></span>
              </p>
            </div>

            <table
              id="tabel"
              class="ui-table table-bordered"
            >
              <thead>
                <tr>
                  <th style="width: 6%">št.</th>
                  <th style="width: 11%">datum</th>
                  <th style="width: 9%">od</th>
                  <th style="width: 9%">do</th>
                  <th style="width: 28%">opis dela</th>
                  <th style="width: 16%">skupaj št.ur</th>
                  <th style="width: 21%">opombe</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(punch, index) in filteredPunches"
                  :key="index"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ niceDate(punch.punchin) }}</td>
                  <td>{{ niceTime(punch.punchin) }}</td>
                  <td>{{ niceTime(punch.punchout) }}</td>
                  <td>{{ punch.description }}</td>
                  <td>{{ overtime(punch.id) }}</td>
                  <td style="text-transform: uppercase">{{ notes(punch.id) }}</td>
                </tr>
                <tr
                  v-for="(row, index) in numOfEmptyRows"
                  :key="index"
                >
                  <td> </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colspan="5"
                    style="text-align: right"
                  >skupaj ur</td>
                  <td
                    colspan="2"
                    style="text-align: left; padding-left: 3em; font-weight: bold"
                  >
                    {{ roundHours(totalDifference) }}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div class="podpis">
              <span id="signiture">
                <br />

                <p><span id="podpis">podpis: </span></p>

                <span id="signitureLine"></span>
              </span>
            </div>
          </div>


        </div>

        <!-- OUTPUT -->
        <button @click="printObj">Print</button>
      </div>
      <q-dialog v-model="icon">
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Ni vnosov</div>
            <q-space />
            <q-btn
              icon="close"
              flat
              round
              dense
              v-close-popup
            />
          </q-card-section>

          <q-card-section>
            Izbrano obdobje ne vsebuje prisotnosti, ki bi vsebovale nadurno delo. Izberite drugo obdobje.
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

import { supabase } from "src/supabase";
import { date, LocalStorage, useQuasar } from "quasar";
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/users.js';
const userStore = useUserStore(); // From users.js
const $q = useQuasar();
const { user } = storeToRefs(userStore);
const emptyReport = ref(false)
const icon = ref(false)
import print from 'vue3-print-nb'

const printObj = () => {
  var divContents = document.getElementById("printReport").innerHTML;
  var a = window.open('', '', 'height=1000, width=1000');
  a.document.write('<html><head>');
  a.document.write(`<style>
/* Custom indentations are needed because the length of custom labels differs from
   the length of the standard labels */
.custom-size-flipswitch.ui-flipswitch .ui-btn.ui-flipswitch-on {
  text-indent: -5.9em;
}

.custom-size-flipswitch.ui-flipswitch .ui-flipswitch-off {
  text-indent: 0.5em;
}

/* Custom widths are needed because the length of custom labels differs from
   the length of the standard labels */
.custom-size-flipswitch.ui-flipswitch {
  width: 8.875em;
}

.custom-size-flipswitch.ui-flipswitch.ui-flipswitch-active {
  padding-left: 7em;
  width: 1.875em;
}

@media (min-width: 28em) {

  /*Repeated from rule .ui-flipswitch above*/
  .ui-field-contain>label+.custom-size-flipswitch.ui-flipswitch {
    width: 1.875em;
  }
}

#punchForm {
  text-align: center;

  width: 4em;
}

#punchForm h2 {
  text-align: center;
  color: green;
  font-size: 3em;
}

body {
  text-align: center;
  font-family: Calibri;

}

/* ul {
  display: block;
} */



.ui-table {
  border: 0;
  border-collapse: collapse;
  padding: 0;
  width: 100%;
}

.ui-table th,
.ui-table td {
  line-height: 1.5em;
  height: 30px;
  border: 1px solid black;
  text-align: center;
  padding: 0.4em 0.5em;
  vertical-align: center;
  font-family: Calibri;
}

#user {
  display: inline-block;
  border-bottom: solid 1px black;
  width: 97mm;
  text-align: center;
  text-transform: uppercase;
}

#signiture {
  display: inline-block;
  float: right;
  padding-right: 15%;
}

#signitureLine {
  display: inline-block;
  width: 50mm;
  border-bottom: solid 1px black;
}

h2 {
  display: block;
  font-size: 1.5em;
  margin-block-start: 0.83em;
  margin-block-end: 0.83em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  font-weight: bold;
}



@media print {

  header nav,
  footer {
    display: none;
  }

  #printReport {
    display: block
  }
}
</style>`);
  a.document.write('</head><body >');
  a.document.write(divContents);
  a.document.write('</body></html>');
  a.document.close();
  setTimeout(function () { a.print(); }, 2000);

  return true;
}

const output = ref(null);
const loading = ref(true);
const punches = ref([]);
const filteredPunches = ref([]);
const monthNames = ref(["Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"]);
const month = ref('');
const report = ref(false);
const dateRange = ref(false);
const model = ref({});
const defaultDuration = 28800000; // 8 hours
const numOfRows = ref('');
const numOfEmptyRows = ref(0);
const freeHours = ref(0);

const createReport = () => {
  dateRange.value = false;
  report.value = true;

  const fPunches = punches.value.filter((punch) => {
    const dayOfWeek = date.getDayOfWeek(punch.punchin);

    const timeDifference = punch.punchout - punch.punchin;
    const from = new Date(model.value.from).getTime();
    month.value = date.formatDate(model.value.from, 'M')

    const to = new Date(model.value.to).getTime();
    if (dayOfWeek === 6 || dayOfWeek === 7) {
      return punch.punchin > from && punch.punchout < to && timeDifference > 1800000;
    } else {
      return punch.punchin > from && punch.punchout < to && timeDifference > defaultDuration + 1800000;
    }
    monthName.value = monthNames.value[month.value]

  });
  filteredPunches.value = fPunches
  if (!filteredPunches.value.length) {
    // emptyReport.value = true;
    icon.value = true
  }
  const numOfRows = filteredPunches.value.length;
  numOfEmptyRows.value = 19 - numOfRows;

};


const monthName = computed(() => {
  return monthNames.value[month.value]
})

const totalDifference = computed(() => {
  return filteredPunches.value.reduce((total, punch) => {
    const dayOfWeek = date.getDayOfWeek(punch.punchin);

    if (dayOfWeek === 6 || dayOfWeek === 7) {

      return total + (punch.punchout - punch.punchin);
    } else {
      return total + (punch.punchout - punch.punchin - defaultDuration);
    }
  }, 0);
});

const roundHours = (duration) => {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)));

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours - freeHours.value;
}

const niceDate = (value) => {
  return date.formatDate(value, "D.M.YYYY");
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

const notes = (id) => {
  const punchinValue = punches.value.find((punch) => punch.id === id).punchin;
  const dayOfWeek = date.getDayOfWeek(punchinValue);
  if (dayOfWeek === 7) {
    return "nedelja";
  }
};

const fetchData = async () => {

  loading.value = true;

  const { data: punchesData } = await supabase
    .from("punches")
    .select()
    .eq('user_id', user.value.id)

    .order("punchin", { ascending: true });

  punches.value = punchesData;

  loading.value = false;
};

const getSession = async () => {
  const account = await supabase.auth.getSession()
  user.value = account.data.session.user
  fetchData()

}




onMounted(() => {
  getSession()


});
</script>

<style scoped>
@media only screen and (max-width: 600px) {
  .printReport .ui-table td {
    font-size: 0.9em;
    line-height: 1em;

  }
}


.custom-size-flipswitch.ui-flipswitch .ui-btn.ui-flipswitch-on {
  text-indent: -5.9em;
}

.custom-size-flipswitch.ui-flipswitch .ui-flipswitch-off {
  text-indent: 0.5em;
}

/* Custom widths are needed because the length of custom labels differs from
   the length of the standard labels */
.custom-size-flipswitch.ui-flipswitch {
  width: 8.875em;
}

.custom-size-flipswitch.ui-flipswitch.ui-flipswitch-active {
  padding-left: 7em;
  width: 1.875em;
}

@media (min-width: 28em) {

  /*Repeated from rule .ui-flipswitch above*/
  .ui-field-contain>label+.custom-size-flipswitch.ui-flipswitch {
    width: 1.875em;
  }
}

#punchForm {
  text-align: center;

  width: 4em;
}

#punchForm h2 {
  text-align: center;
  color: green;
  font-size: 3em;
}

body {
  text-align: center;
}

/* ul {
  display: block;
} */

.ui-table {
  border: 0;
  border-collapse: collapse;
  padding: 0;
  width: 100%;
}

.ui-table th,
.ui-table td {
  line-height: 1.5em;
  height: 30px;
  border: 1px solid black;
  text-align: center;
  padding: 0.4em 0.5em;
  vertical-align: center;
  font-family: Calibri;
}

#user {
  display: inline-block;
  border-bottom: solid 1px black;
  width: 97mm;
  text-align: center;
  text-transform: uppercase;
}

#signiture {
  display: inline-block;
  float: right;
  padding-right: 15%;
}

#signitureLine {
  display: inline-block;
  width: 50mm;
  border-bottom: solid 1px black;
}

h2 {
  display: block;
  font-size: 1.5em;
  margin-block-start: 0.83em;
  margin-block-end: 0.83em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  font-weight: bold;
}



@media print {

  header nav,
  footer {
    display: none;
  }

  #printReport {
    display: block
  }
}
</style>
