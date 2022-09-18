<template>
  <n-config-provider :theme="$store.state.screenMode === 'dark' ? darkTheme : null">
    <n-message-provider>
      <BrandBig />
    </n-message-provider>
  </n-config-provider>
</template>

<script>
import { NMessageProvider, NConfigProvider } from "naive-ui";
import { darkTheme } from "naive-ui";
import BrandBig from "../components/Home/BrandBig";
export default {
  name: "Home",
  components: {
    BrandBig,
    NMessageProvider,
    NConfigProvider,
  },
  setup() {
    return {
      darkTheme,
    };
  },
};
</script>

<style scoped>
</style>