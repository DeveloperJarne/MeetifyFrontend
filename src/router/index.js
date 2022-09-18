import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import EventsView from "../views/EventsView";
import MeetingViewInfo from '@/views/MeetingViewInfo'
import MeetingsView from '@/views/MeetingsView'

import { nextTick } from "vue";


const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/eventsview',
    name: 'Events View',
    component: EventsView,
  },
  {
    path: '/hourlymeetingsview',
    name: 'Meetings',
    component: MeetingsView
  },
  {
    path: '/meetingroominfo',
    name: 'Meeting Room Info',
    component: MeetingViewInfo
  }
]



const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
