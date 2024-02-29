const routes = [
  {
    path: "/",

    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/",
        name: "Home",
        component: () => import("pages/IndexPage.vue"),
      },
      {
        path: "/punches",
        meta: {
          requiresAuth: true,
        },
        component: () => import("pages/PunchesPage.vue"),
      },
      {
        path: "/import-export",
        meta: {
          requiresAuth: true,
        },
        component: () => import("pages/ImportExportPage.vue"),
      },
      {
        path: "/print",
        meta: {
          requiresAuth: true,
        },
        component: () => import("pages/PrintPage.vue"),
      },
      {
        path: "/settings",
        meta: {
          requiresAuth: true,
        },
        component: () => import("pages/SettingsPage.vue"),
      },
      {
        path: "/auth",
        name: "auth",
        component: () => import("pages/AuthPage.vue"),
      },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
