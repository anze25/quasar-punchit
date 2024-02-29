<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md q-gutter-sm"><q-btn
        color="secondary"
        label="Spremeni prikazno ime"
        flat
        round
        dense
        @click="prompt = !prompt"
      />
      <br>
      <q-btn
        color="primary"
        label="Prikaži opise dela"
        flat
        round
        dense
        @click="promptDescription = !promptDescription"
      />
    </div>

    <q-dialog
      v-model="prompt"
      persistent
    >
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Spremeni prikazno ime</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="user.user_metadata.full_name"
            label="Ime"
            outlined
          >
            <template v-slot:append>
              <q-icon
                name="mdi-user"
                class="cursor-pointer"
              >
                <q-popup-proxy
                  transition-show="scale"
                  transition-hide="scale"
                >


                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

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
            label="Spremeni"
            @click="changeUserData(user)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="promptDescription"
      persistent
    >
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Opisi dela</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="user.user_metadata.full_name"
            label="Ime"
            outlined
          >
            <template v-slot:append>
              <q-icon
                name="mdi-user"
                class="cursor-pointer"
              >
                <q-popup-proxy
                  transition-show="scale"
                  transition-hide="scale"
                >


                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

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
            label="Spremeni"
            @click="changeUserData(user)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { LocalStorage, useQuasar } from "quasar";
import { supabase } from "src/supabase";
const $q = useQuasar();
const prompt = ref(false)
const promptDescription = ref(false)
const user = ref()

const getSession = async () => {
  const account = await supabase.auth.getSession()
  user.value = account.data.session.user

}

const changeUserData = async () => {
  const { data, error } = await supabase.auth.updateUser({ data: { full_name: user.value.user_metadata.full_name } })


  $q.notify({
    message: "Uporabnik uspešno posodobljen",
    icon: "mdi-check",
    color: "info",
  });
  getSession()
  prompt.value = false;

};

onMounted(() => {
  getSession()


});

</script>
