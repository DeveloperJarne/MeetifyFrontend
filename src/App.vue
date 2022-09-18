<template>
  <n-config-provider :theme="$store.state.screenMode === 'dark' ? darkTheme : null">
    <n-space vertical v-if="
      (getLoginStatus && $route.path.includes('eventsview')) ||
      $route.path.includes('meetingsview')
    ">
      <n-card class="mt-2 mb-2">
        <div class="d-flex fullHeaderContainer">
          <div class="d-flex justify-content-between navContainer">
            <div id="userContainer">
              <n-avatar round :style="{
                color: 'white',
                backgroundColor: '#243834',
              }">
                {{ userName.split(" ")[0][0] + userName.split(" ")[1][0] }}
              </n-avatar>
              <!-- <img class="rounded-circle" v-if="profilePic" :src="profilePic" alt="profilePicture" /> -->
              <p id="username">{{ userName }}</p>
              <DarkLightModeSwitch />
            </div>
            <div id="routingBtnContainer">
              <n-button @click="$router.push($store.state.routing.eventsview)">Events</n-button>
              <n-button @click="$router.push($store.state.routing.meetingsStrapi)">Book hourly meeting</n-button>
            </div>
          </div>
        </div>
      </n-card>
    </n-space>
  </n-config-provider>
  <router-view />
</template>

<script>
function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => icon });
}
const menuOptions = [
  {
    label: "Home",
    key: "meeting-view",
  },
];
import DarkLightModeSwitch from "@/components/Meeting/DarkLightMode/DarkLightModeSwitch";
import { ref, h } from "vue";
import GoogleCalendarPlannings from "@/components/Meeting/GoogleCalendarPlannings";
import {
  NButton,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NMenu,
  NSwitch,
  NSpace,
  NLayoutFooter,
  NIcon,
  darkTheme,
  NConfigProvider,
  NAvatar,
  NCard,
} from "naive-ui";
export default {
  name: "Login",
  components: {
    GoogleCalendarPlannings,
    NButton,
    NLayout,
    NLayoutHeader,
    NLayoutSider,
    NMenu,
    NSwitch,
    NSpace,
    NLayoutFooter,
    NConfigProvider,
    NAvatar,
    NCard,
    DarkLightModeSwitch,
  },
  computed: {
    getLoginStatus() {
      return this.$store.state.isLoggedIn;
    },
    userName() {
      let username = localStorage.getItem("userName");
      return this.$store.state.name ? this.$store.state.name : username;
    },
    profilePic() {
      let profilepic = localStorage.getItem("profilePic");
      return this.$store.state.profilepic
        ? this.$store.state.profilepic
        : profilepic;
    },
    email() {
      let email = localStorage.getItem("email");
      return this.$store.state.email ? this.$store.state.email : email;
    },
  },
  data() {
    return {};
  },
  created() {
    this.api = gapi;
    this.handleClientLoad();
  },
  setup() {
    return {
      inverted: ref(false),
      menuOptions,
      darkTheme,
    };
  },
  methods: {
    /**
     *  On load, called to load the auth2 library and API client library.
     */
    async handleClientLoad() {
      this.api.load("client:auth2", this.initClient);
    },

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    async initClient() {
      let vm = this;

      // Client ID and API key from the Developer Console
      const CLIENT_ID =
        "304834561456-jp6hbrsm87iidrgavau0nvuu1ilfc5fq.apps.googleusercontent.com";
      const API_KEY = "AIzaSyAaJ0_9HdvKdYqVi6RQwJS7vqVjQlOz9v0";
      // Array of API discovery doc URLs for APIs used by the quickstart
      const DISCOVERY_DOCS = [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
      ];
      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      const SCOPES = "https://www.googleapis.com/auth/calendar";

      vm.api.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then((_) => {
          // Listen for sign-in state changes.
          vm.api.auth2.getAuthInstance().isSignedIn.listen(vm.authorized);
        });
    },

    /**
     *  Sign out the user upon button click.
     */
    handleSignoutClick(event) {
      Promise.resolve(this.api.auth2.getAuthInstance().signOut()).then((_) => {
        this.$store.commit("CHANGE_LOGIN_STATUS", false);
        this.$store.commit("REMOVE_USER_DATA");
        this.$router.push("/");
      });
    },
  },
  mounted() {
    if (this.$store.state.isLoggedIn) {
      if (this.$store.state.screenMode === "dark") {
        let app = document.getElementById("app");
        app.style.backgroundColor = "#131313";
        document.body.style.backgroundColor = "#131313";
        this.$store.commit("SET_SCREEN_MODE", "dark");
      } else {
        app.style.backgroundColor = "white";
        document.body.style.backgroundColor = "white";
        this.$store.commit("SET_SCREEN_MODE", "white");
      }
    } else if (localStorage.getItem("ScreenMode") === "dark") {
      let app = document.getElementById("app");
      app.style.backgroundColor = "#131313";
      document.body.style.backgroundColor = "#131313";
      this.$store.commit("SET_SCREEN_MODE", "dark");
    } else {
      app.style.backgroundColor = "white";
      document.body.style.backgroundColor = "white";
      this.$store.commit("SET_SCREEN_MODE", "white");
    }
  },
};
</script>

<style>
* {
  font-family: "Montserrat", sans-serif;
  margin: 0;
  padding: 0;
  transition: backgroundImage 0.4s, backgroundColor 0.3s;
}

::selection {
  background-color: #2a4741;
  color: white;
}

/* Hide scrollbar for Chrome, Safari and Opera */
*::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
* {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

#app {
  margin: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 85vw;
  font-weight: 600 !important;
}

#nav {
  justify-content: space-between;
  display: flex;
  color: white;
  margin: auto;
  background-color: rgb(44, 44, 50);
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
  margin-top: auto;
  margin-bottom: auto;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

#userContainer {
  display: flex;
  margin-right: 20px;
}

#userContainer p {
  /* margin: auto; */
  padding-left: 10px;
}

#routingBtnContainer {
  margin-top: auto;
  margin-bottom: auto;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.fullHeaderContainer {
  justify-content: space-between;
}

.navContainer {
  width: 100%;
}

@media only screen and (max-width: 1100px) {
  #app {
    max-width: 100vw;
  }

  #routingBtnContainer {
    justify-content: space-between;
    display: flex;
  }

  #userContainer {
    margin-right: 0;
    justify-content: space-between;
    margin-top: auto;
    margin-bottom: auto;
    gap: 20px;
  }

  #userContainer .n-space {
    margin: inherit !important;
  }

  .fullHeaderContainer {
    flex-direction: column;
  }
}

@media only screen and (max-width: 580px) {
  .navContainer {
    flex-direction: column;
    justify-content: center;
  }

  #routingBtnContainer {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  #userContainer {
    margin-right: 0;
  }
}
</style>

<style scoped>
input[type="button"],
div img {
  height: 50px;
}

#username {
  font-weight: bold;
  margin-top: auto;
  margin-bottom: auto;
}
</style>