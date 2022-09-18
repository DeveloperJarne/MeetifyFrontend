<template>
  <n-space style="margin: auto; margin-left: 20px">
    <n-switch style="margin-left: 25px" :rail-style="railStyle" v-model:value="$store.state.screenModeActive"
      @update:value="handleChange" size="large">
      <template #checked-icon><i class="fa-thin fa-moon"></i></template>
      <template #unchecked-icon><i class="fa-thin fa-brightness"></i></template>
    </n-switch>
  </n-space>
</template>

<script>
import { useStore } from "vuex";
import { NSpace, NSwitch } from "naive-ui";
import { ref } from "vue";
export default {
  name: "DarkLightModeSwitch",
  components: { NSpace, NSwitch },
  data() {
    return {
      active: ref(false),
    };
  },
  setup() {
    const store = useStore();
    return {
      handleChange(value) {
        let app = document.getElementById("app");

        if (value) {
          document.body.style.backgroundColor = "rgb(24, 24, 28)";
          app.style.backgroundColor = "#131313";
          store.commit("SET_SCREEN_MODE", "dark");
          localStorage.setItem("ScreenMode", "dark");
          store.dispatch("SET_SCREENMODE_FORUSER_STRAPI", "dark");
        } else {
          document.body.style.backgroundColor = "white";
          app.style.backgroundColor = "white";
          store.commit("SET_SCREEN_MODE", undefined);
          localStorage.setItem("ScreenMode", "white");
          store.dispatch("SET_SCREENMODE_FORUSER_STRAPI", "white");
        }
      },
      railStyle: ({ focused, checked }) => {
        const style = {};
        if (checked) {
          style.background = "transparent";
          style.border = "#C0C0C0";
          if (focused) {
            style.boxShadow = "0 0 0 2px #d0305040";
          }
        } else {
          style.background = "transparent";
          if (focused) {
            style.boxShadow = "0 0 0 2px #2080f040";
          }
        }
        return style;
      },
    };
  },
  mounted() {
    if (this.$store.state.isLoggedIn) {
      if (this.$store.state.screenMode === "dark") {
        let app = document.getElementById("app");
        app.style.backgroundColor = "#131313";
        document.body.style.backgroundColor = "#131313";
        this.$store.commit("SET_SCREEN_MODE", "dark");
        this.$store.state.screenModeActive = true;
      } else {
        document.body.style.backgroundColor = "white";
        app.style.backgroundColor = "white";
        this.$store.commit("SET_SCREEN_MODE", undefined);
        localStorage.setItem("ScreenMode", "white");
        this.$store.dispatch("SET_SCREENMODE_FORUSER_STRAPI", "white");
        this.$store.state.screenModeActive = false;
      }
    } else if (localStorage.getItem("ScreenMode") === "dark") {
      let app = document.getElementById("app");
      app.style.backgroundColor = "#131313";
      document.body.style.backgroundColor = "#131313";
      this.$store.commit("SET_SCREEN_MODE", "dark");
      this.$store.state.screenModeActive = true;
    } else {
      document.body.style.backgroundColor = "white";
      app.style.backgroundColor = "white";
      this.$store.commit("SET_SCREEN_MODE", undefined);
      localStorage.setItem("ScreenMode", "white");
      this.$store.dispatch("SET_SCREENMODE_FORUSER_STRAPI", "white");
      this.$store.state.screenModeActive = false;
    }
  },
};
</script>

<style>
.n-switch__button {
  background-color: rgb(36, 56, 52) !important;
}

.n-switch__rail {
  border: 1px solid #c0c0c0 !important;
  height: 27px !important;
}

.n-switch__button-icon i {
  color: white !important;
}

@media only screen and (max-width: 1180px) {
  .n-switch {
    margin: 0 !important;
  }
}

@media only screen and (max-width: 500px) {
  .n-space {
    margin: 0 !important;
  }
}
</style>