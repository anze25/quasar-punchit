<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>

      <q-toolbar>
        <q-btn
          v-if="!leftDrawerOpen"
          flat
          @click="leftDrawerOpen = !leftDrawerOpen"
          round
          dense
          icon="menu"
        />
        <q-toolbar-title class="absolute-center">
          Punch It

        </q-toolbar-title>

        <q-btn
          v-if="user"
          @click="logoutUser"
          icon-right="account_circle"
          label="Odjavi se"
          class="absolute-right"
          flat
        />
      </q-toolbar>
    </q-header>

    <q-footer
      reveal
      elevated
      class="bg-primary text-white text-center "
    >
      <q-toolbar>
        <q-toolbar-title>

          Copyright © Punch It 2024
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

    <q-drawer
      v-model="leftDrawerOpen"
      :breakpoint="767"
      :width="250"
      show-if-above
      bordered
      class="bg-primary"
    >
      <q-list dark>
        <q-item-label header>
          Navigacija
        </q-item-label>
        <q-item
          to="/"
          class="text-grey-4"
          exact
          clickable
        >
          <q-item-section avatar>
            <q-icon name="mdi-home" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Domov</q-item-label>
          </q-item-section>
        </q-item>
        <div> <q-item
            v-for="nav in navs"
            :key="nav.label"
            :to="nav.to"
            class="text-grey-4"
            exact
            clickable
          >
            <q-item-section avatar>
              <q-icon :name="nav.icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ nav.label }}</q-item-label>
            </q-item-section>
          </q-item></div>


        <q-item
          v-if="$q.platform.is.electron"
          @click="quitApp"
          class="text-grey-4 absolute-bottom"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="power_settings_new" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Quit</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, } from 'vue'
import { supabase } from "src/supabase";
import { useUserStore } from '../stores/users.js';
import { storeToRefs } from 'pinia';
// const loggedIn = ref(false);


const userStore = useUserStore();
const { loadingUser, user } = storeToRefs(userStore);

const logoutUser = async () => {
  await userStore.handleLogout();
};

const navs = ref([

  {
    label: 'Prihodi in odhodi',
    icon: 'mdi-clock-start',
    to: '/punches'
  }, {
    label: 'Uvoz in izvoz',
    icon: 'mdi-upload',
    to: '/import-export'
  },
  {
    label: 'Print Reporta',
    icon: 'mdi-printer',
    to: '/print'
  },
  {
    label: 'Nastavitve',
    icon: 'settings',
    to: '/settings'
  }
])
const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

onMounted(() => {

});

</script>
