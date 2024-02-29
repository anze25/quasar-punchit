<template>
  <div>
    <q-splitter v-model="splitterModel">
      <template v-slot:before>
        <q-tabs
          v-model="tab"
          vertical
          class="text-teal"
        >
          <q-tab
            name="mails"
            icon="mail"
            label="Prikazno ime"
          />
          <q-tab
            name="alarms"
            icon="alarm"
            label="Opisi dela"
          />
          <q-tab
            name="movies"
            icon="movie"
            label="Movies"
          />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="tab"
          animated
          swipeable
          vertical
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel name="mails">
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
              <p>{{ user.user_metadata.full_name }} </p>
              <div class="q-pa-md q-gutter-sm">
                <q-btn
                  color="secondary"
                  label="Spremeni prikazno ime"
                  flat
                  round
                  dense
                  @click="prompt = !prompt"
                />
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
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="alarms">
            <div class="text-h5 q-mb-md">Seznam opisov</div><q-btn
              color="primary"
              icon="mdi-plus"
              label="Nov opis"
              flat
              round
              dense
              @click="promptNewDescription = !promptNewDescription"
            />
            <q-list>
              <q-item
                v-for="(description, index) in descriptions"
                :key="index"
                clickable
                v-ripple
                bordereds
              >
                <q-item-section>{{ description.name }}</q-item-section>
                <q-item-section side>
                  <div class="q-pa-md q-gutter-sm"><q-btn
                      color="secondary"
                      icon="edit"
                      flat
                      round
                      dense
                      @click.stop="promptToEdit(description)"
                    />
                    <q-btn
                      side
                      color="negative"
                      icon="delete"
                      flat
                      round
                      dense
                      @click.stop="promptToDelete(description.id)"
                    />
                  </div>
                </q-item-section>
              </q-item>

            </q-list>
            <q-dialog
              v-model="promptEdit"
              persistent
            >
              <q-card style="min-width: 350px">
                <q-card-section>
                  <div class="text-h6">Spremeni opis</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <q-input
                    v-model="currentDescription.name"
                    label="Opis dela"
                    outlined
                  >
                  </q-input>

                </q-card-section>

                <q-card-actions
                  align="right"
                  class="text-primary"
                >
                  <q-btn
                    flat
                    label="Prekliči"
                    @click="cancelUpdateDescription()"
                  />
                  <q-btn
                    flat
                    label="Potrdi spremembo"
                    @click="updateDescription"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-dialog
              v-model="promptNewDescription"
              persistent
            >
              <q-card style="min-width: 350px">
                <q-card-section>
                  <div class="text-h6">Nov opis</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <q-input
                    v-model="newDescription"
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
                    @click="addDescriptionToDatabase"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>

          </q-tab-panel>

          <q-tab-panel name="movies">
            <div class="text-h4 q-mb-md">Movies</div>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { LocalStorage, useQuasar } from "quasar";
import { supabase } from "src/supabase";
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/users.js";

const userStore = useUserStore(); // From users.js
const { errorMessage, punchin, user, loading } = storeToRefs(userStore);
const $q = useQuasar();
const prompt = ref(false);
const promptEdit = ref(false);
const promptNewDescription = ref(false);
const descriptions = ref([])
const currentDescription = ref(null)
const newDescription = ref('')

const tab = ref("mails");
const innerTab = ref("innerMails");
const splitterModel = ref(30);

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
    console.error('Error fetching session:', error);
  } finally {
    loading.value = false;
  }
};

const fetchDescription = async () => {

  if (user.value) {
    const { data: descriptionData } = await supabase
      .from("punch_description")
      .select()
      .eq("user_id", user.value.id)
      .order("name", { ascending: true });
    descriptions.value = descriptionData;
  }
};

const changeUserData = async () => {
  const { data, error } = await supabase.auth.updateUser({
    data: { full_name: user.value.user_metadata.full_name },
  });

  $q.notify({
    message: "Uporabnik uspešno posodobljen",
    icon: "mdi-check",
    color: "info",
  });
  getSession();
  prompt.value = false;
};

const promptToDelete = (id) => {
  $q.dialog({
    title: "Odstrani",
    message: "Ste prepričani, da želite odstraniti opis?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      deleteDescription(id);
    })
    .onCancel(() => {
      // console.log('>>>> Cancel')
    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
};

const deleteDescription = async (id) => {
  await supabase.from("punch_description").delete().eq("id", id);

  $q.notify({
    message: "Vnos uspešno odstranjen",
    icon: "mdi-check",
    color: "info",
  });
  fetchDescription();
};

const promptToEdit = (description) => {
  currentDescription.value = description;
  $q.dialog({
    title: "Uredi",
    message: "Ste prepričani, da želite spremeniti opis?",
    cancel: true,
    persistent: true,
  })
    .onOk(() => {
      currentDescription.value = description;
      promptEdit.value = true;
    })
    .onCancel(() => {

    })
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
};

const cancelUpdateDescription = () => {
  fetchDescription()
  promptEdit.value = false;

};

const updateDescription = async (id) => {
  await supabase
    .from("punch_description")
    .update({
      name: currentDescription.value.name,
      user_id: user.value.id,
    })
    .eq("id", currentDescription.value.id);

  $q.notify({
    message: "Opis uspešno posodobljen",
    icon: "mdi-check",
    color: "info",
  });
  promptEdit.value = false;
  fetchDescription();
};

const addDescription = () => {
  promptNewDescription.value = true;
};


const addDescriptionToDatabase = async () => {
  await supabase.from("punch_description").insert({
    name: newDescription.value,
    user_id: user.value.id,
  });

  promptNewDescription.value = false;

  $q.notify({
    message: "Opis uspešno ustvarjen",
    icon: "mdi-check",
    color: "positive",
  });
  fetchDescription();
};


onMounted(async () => {
  await getSession()
});
</script>
