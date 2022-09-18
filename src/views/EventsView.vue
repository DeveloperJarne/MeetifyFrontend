<template>
  <n-config-provider :theme="$store.state.screenMode === 'dark' ? darkTheme : null">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <GoogleCalendarPlannings />
          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script>
import { defineComponent, ref } from "vue";
import {
  NMessageProvider,
  NLoadingBarProvider,
  NNotificationProvider,
  NDialogProvider,
  NConfigProvider,
  NScrollbar,
  darkTheme,
} from "naive-ui";
import GoogleCalendarPlannings from "@/components/Meeting/GoogleCalendarPlannings";
export default defineComponent({
  name: "Home",
  components: {
    GoogleCalendarPlannings,
    NMessageProvider,
    NLoadingBarProvider,
    NNotificationProvider,
    NDialogProvider,
    NConfigProvider,
    NScrollbar,
  },
  setup() {
    return {
      darkTheme,
    };
  },
});
</script>

<style scoped>
</style>