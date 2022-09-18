<template>
  <div v-if="getLoginStatus">
    <n-config-provider
      :theme="$store.state.screenMode === 'dark' ? darkTheme : null"
    >
      <n-space vertical>
        <!--TODO: Fill with date options-->

        <section class="d-flex">
          <div class="w-100">
            <n-card>
              <n-select
                @update:value="handleUpdateValue"
                placeholder="Select other date"
                :options="this.getDatesForNextAmountOfDays()"
                :default-value="this.getDatesForNextAmountOfDays()[0].value"
                trigger
              ></n-select>
            </n-card>

            <n-card :title="'Timeslots'">
              <div class="d-flex flex-column">
                <!-- <n-button primary class="mb-4" @click="handleUpdateValue"
                  >Refresh data</n-button
                > -->
              </div>
              <n-space vertical>
                <div
                  v-for="item in $store.state.meetingroomInfoList"
                  :key="item.id"
                >
                  <n-message-provider>
                    <MeetingInfo
                      :meetingroom="item"
                      :selectedDate="selectedDate"
                    />
                  </n-message-provider>
                </div>
              </n-space>
            </n-card>
          </div>
        </section>
      </n-space>
    </n-config-provider>
  </div>
</template>

<script>
import {
  darkTheme,
  NConfigProvider,
  NSpace,
  NCard,
  NButton,
  NSelect,
  NMessageProvider,
} from "naive-ui";
import MeetingInfo from "@/components/Meeting/MeetingInfo";
import { getDayName } from "../utilities/converters";
export default {
  name: "MeetingsView",
  components: {
    NConfigProvider,
    NSpace,
    NCard,
    MeetingInfo,
    NButton,
    NSelect,
    NMessageProvider,
  },
  data() {
    return {
      meetingrooms: [],
      selectedDate: null,
    };
  },
  computed: {
    getLoginStatus() {
      return this.$store.state.isLoggedIn;
    },
  },
  methods: {
    getDayName,
    handleUpdateValue(value, option) {
      this.selectedDate = value;
      this.$store.dispatch(
        "fetchMeetingsFromApiForSelectedDate",
        new Date(value).setHours(0, 0, 0, 0)
      );
    },
    getDatesForNextAmountOfDays(amount = 30) {
      const d = new Date(new Date().setDate(new Date().getDate() - 1));
      var days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      let listDates = [];
      for (let i = 0; i < amount; i++) {
        let day = d.setDate(d.getDate() + 1);
        //Adding a day
        listDates.push({
          label: `${new Date(day).getDate()}/${
            new Date(day).getMonth() + 1
          }/${new Date(day).getFullYear()} - ${days[d.getDay()]} `,
          value: day, //type Date
        });
      }
      return listDates;
    },
  },
  mounted() {
    if (!this.getLoginStatus) {
      this.$router.push(this.$store.state.routing.home);
    }
    this.handleUpdateValue(this.getDatesForNextAmountOfDays()[0].value);
  },
  setup() {
    return {
      darkTheme,
    };
  },
};
</script>

<style>
</style>