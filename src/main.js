import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import VueGapi from 'vue-gapi'

const gapiOptions = {
    apiKey: 'AIzaSyAaJ0_9HdvKdYqVi6RQwJS7vqVjQlOz9v0',
    clientId: '304834561456-jp6hbrsm87iidrgavau0nvuu1ilfc5fq.apps.googleusercontent.com',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    scope: ['https://www.googleapis.com/auth/calendar '],
}

const firebaseConfig = {
    apiKey: "AIzaSyAaJ0_9HdvKdYqVi6RQwJS7vqVjQlOz9v0",
    authDomain: "meetifyapplication.firebaseapp.com",
    projectId: "meetifyapplication",
    storageBucket: "meetifyapplication.appspot.com",
    messagingSenderId: "304834561456",
    appId: "1:304834561456:web:2d5ebbf25c732cc0da8275",
    measurementId: "G-CT77VE6ZDX"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
createApp(App).use(store).use(router)
    // .use(GAuth, gAuthOptions)
    .use(VueGapi, gapiOptions)
    .mount('#app')

