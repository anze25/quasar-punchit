<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="absolute-center">
          Punch It
        </q-toolbar-title>



        <q-btn
          v-if="!loggedIn"
          to="/auth"
          icon-right="account_circle"
          label="Login"
          class="absolute-right"
          flat
        />

        <q-btn
          v-else
          @click="logoutUser"
          icon-right="account_circle"
          label="Logout"
          class="absolute-right"
          flat
        />
      </q-toolbar>
    </q-header>

<q-footer reveal elevated class="bg-primary text-white text-center">
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
        <q-item-label
          header
        >
          Navigacija
        </q-item-label>
        <q-item
          v-for="nav in navs"
          :key="nav.label"
          :to="nav.to"
          class="text-grey-4"
          exact
          clickable
        >
          <q-item-section
            avatar
          >
            <q-icon :name="nav.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ nav.label }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="$q.platform.is.electron"
          @click="quitApp"
          class="text-grey-4 absolute-bottom"
          clickable
        >
          <q-item-section
            avatar
          >
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
import { ref } from 'vue'

const loggedIn = ref(true);
const navs =  ref([
        {
          label: 'Domov',
          icon: 'mdi-home',
          to: '/'
        },
        {
          label: 'Prihodi in odhodi',
          icon: 'mdi-clock-start',
          to: '/punches'
        },        {
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

</script>
