<template>
  <section :class="$store.state.screenMode === 'white' || $store.state.screenMode === null ? '' : 'dark'">
    <a>
      <h1 @click="handleAuthClick" class="text-center">ENTER MEETIFY</h1>
    </a>
    <dialog id="dialog" class="w-50 m-auto border-0 p-5" style="border-radius: 10px">
      <h2 class="mb-5">{{ errorMsg }}</h2>
      <div class="d-flex flex-column">
        <button class="btn btn-primary w-50 m-auto mb-2" @click="handleAuthClick">
          Try logging in again
        </button>
        <a class="btn btn-primary w-50 m-auto text-white mb-2" :href="this.$store.state.yungoSite"
          target="_blank">Contact Yungo</a>
        <button class="btn btn-primary w-50 m-auto" @click="closeModal">
          Close
        </button>
      </div>
    </dialog>
  </section>
</template>
<script>
import { ref } from "vue";
import { useMessage } from "naive-ui";
export default {
  name: "BrandBig",
  props: {},
  components: {},
  data() {
    return {
      errorMsg: "",
      user: "",
      calendarItems: undefined,
      api: undefined,
      authorized: false,
    };
  },
  setup() {
    window.$message = useMessage();
  },
  mounted() {
    window.$message.info("Welcome to Meetify", {
      keepAliveOnHover: true,
    });

    //Fetch info after authentication & authorisation
    this.$store.dispatch("fetchMeetingRooms");
    this.$store.dispatch("fetchAllEmployees");
    this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");
  },
  created() {
    this.api = gapi;
    this.handleClientLoad();
  },
  computed: {
    getLoginStatus() {
      return this.$store.state.isLoggedIn;
    },
  },
  methods: {
    /**
     *  On load, called to load the auth2 library and API client library.
     */
    handleClientLoad() {
      this.api.load("client:auth2", this.initClient);
    },

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    initClient() {
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
      const SCOPES = ["https://www.googleapis.com/auth/calendar profile"];

      vm.api.client
        .init({
          apiKey: API_KEY,
          client_id: CLIENT_ID,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scopes: SCOPES,
        })
        .then((_) => {
          // Listen for sign-in state changes.
          vm.api.auth2.getAuthInstance().isSignedIn.listen(vm.authorized);
        });
    },

    /**
     *  Sign in the user upon button click.
     */
    handleAuthClick(event) {
      if (this.getLoginStatus) {
        this.$router.push(this.$store.state.routing.eventsview);
      } else {
        Promise.resolve(this.api.auth2.getAuthInstance().signIn()).then((_) => {
          let profile = _.getBasicProfile();
          if (!profile.getEmail().endsWith("@yungo.be")) {
            window.$message.warning(
              "Only members of Yungo domain have access.",
              {
                keepAliveOnHover: true,
              }
            );
          } else {
            let obj = {
              name: profile.getName(),
              email: profile.getEmail(),
              profilepic: profile.getImageUrl(),
            };
            this.$store.commit("CHANGE_USER_DATA", obj);
            this.$store.commit("CHANGE_LOGIN_STATUS", true);
            this.$store.dispatch("CREATE_FIREBASE_USER");

            this.$store
              .dispatch(
                "retrieveUserSelectedScreenMode",
                localStorage.getItem("email")
              )
              .then(() => {
                if (this.$store.state.isLoggedIn) {
                  if (this.$store.state.screenMode === "dark") {
                    let app = document.getElementById("app");
                    app.style.backgroundColor = "#131313";
                    document.body.style.backgroundColor = "#131313";
                    this.$store.commit("SET_SCREEN_MODE", "dark");
                    this.active = true;
                  } else {
                    document.body.style.backgroundColor = "white";
                    app.style.backgroundColor = "white";
                    this.$store.commit("SET_SCREEN_MODE", undefined);
                    localStorage.setItem("ScreenMode", "white");
                    this.$store.dispatch(
                      "SET_SCREENMODE_FORUSER_STRAPI",
                      "white"
                    );
                    this.active = false;
                  }
                } else if (localStorage.getItem("ScreenMode") === "dark") {
                  let app = document.getElementById("app");
                  app.style.backgroundColor = "#131313";
                  document.body.style.backgroundColor = "#131313";
                  this.$store.commit("SET_SCREEN_MODE", "dark");
                  this.active = true;
                  this.active = true;
                } else {
                  document.body.style.backgroundColor = "white";
                  app.style.backgroundColor = "white";
                  this.$store.commit("SET_SCREEN_MODE", undefined);
                  localStorage.setItem("ScreenMode", "white");
                  this.$store.dispatch(
                    "SET_SCREENMODE_FORUSER_STRAPI",
                    "white"
                  );
                  this.active = false;
                }
              });

            this.$router.push(this.$store.state.routing.eventsview);
          }
        });
      }
    },

    /**
     *  Sign out the user upon button click.
     */
    handleSignoutClick(event) {
      Promise.resolve(this.api.auth2.getAuthInstance().signOut()).then((_) => {
        this.$store.commit("CHANGE_LOGIN_STATUS", false);
      });
    },
    /* Modal */
    openModal() {
      document.getElementById("dialog").showModal();
    },
    closeModal() {
      document.getElementById("dialog").close();
    },
  },
};
</script>
 <style>
 </style>
<style scoped>
.dark h1 {
  color: white !important;
}

* {
  transition: all 1s;
}

a {
  text-decoration: none;
  color: inherit;
}

a:hover h1 {
  font-size: 85px;
  transition: font-size 1s;
}

section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

section h1 {
  font-size: 70px;
  color: black;
}
</style>