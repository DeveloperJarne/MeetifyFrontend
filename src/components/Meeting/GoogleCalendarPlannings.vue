<template>
  <div v-if="getLoginStatus">
    <n-modal v-model:show="showModal" class="custom-card" preset="card" :title="modalObj.title + ' | ' + modalObj.time"
      :bordered="false" size="huge">
      <div v-if="modalObj.description" style="margin-bottom: 30px">
        <p style="font-weight: bold">Description</p>
        <p>{{ modalObj.description }}</p>
      </div>
      <div v-if="modalObj.fullEvent.attendees">
        <p class="mt-1" style="font-weight: bold">Attendees</p>
        <ul id="attendeesUL">
          <li v-for="attendee in sortAttendeesList(modalObj.fullEvent.attendees)" :key="attendee">
            <p v-if="attendee.responseStatus === 'accepted'">
              <n-tooltip trigger="hover" :show-arrow="false">
                <template #trigger>
                  <i v-if="attendee.organizer !== undefined" class="fa-solid fa-person-chalkboard"></i>
                  <i v-if="attendee.organizer === undefined" class="fa-solid fa-calendar-circle-user"></i>
                </template>
                {{
                    attendee.organizer !== undefined ? "Organizer" : "Participant"
                }}
              </n-tooltip>
              {{ attendee.email }}
              <n-tag type="success" size="large" class="responseStatusMeeting">Accepted</n-tag>
            </p>

            <p v-if="attendee.responseStatus === 'declined'">
              <n-tooltip trigger="hover" :show-arrow="false">
                <template #trigger>
                  <i v-if="attendee.organizer !== undefined" class="fa-solid fa-person-chalkboard"></i>
                  <i v-if="attendee.organizer === undefined" class="fa-solid fa-calendar-circle-user"></i>
                </template>
                Participant
              </n-tooltip>

              {{ attendee.email
              }}<n-tag type="error" size="large" class="responseStatusMeeting">Declined</n-tag>
            </p>

            <p v-if="attendee.responseStatus === 'needsAction'">
              <n-tooltip trigger="hover" :show-arrow="false">
                <template #trigger>
                  <i v-if="attendee.organizer !== undefined" class="fa-solid fa-person-chalkboard"></i>
                  <i v-if="attendee.organizer === undefined" class="fa-solid fa-calendar-circle-user"></i>
                </template>
                Participant
              </n-tooltip>

              {{ attendee.email
              }}<n-tag type="default" size="large" class="responseStatusMeeting">Needs action</n-tag>
            </p>
          </li>
        </ul>
      </div>
      <!--Content-->
      <template #footer>
        <div v-if="modalObj.timeKeeper" style="margin-bottom: 30px">
          <p style="font-weight: bold">TimeKeeper</p>
          <p>{{ modalObj.timeKeeper }}</p>
        </div>
        <div v-if="modalObj.location">
          <p class="mt-1" style="font-weight: bold">Location</p>
          <p class="pb-1">{{ modalObj.location }}</p>
        </div>
        <br />
        <section class="d-flex justify-content-between modalButtonGroup">
          <n-button @click="openLinkExternally(modalObj.eventLink)" type="info" secondary>Open event in Google Calendar
          </n-button>
          <n-button v-if="modalObj.googleMeetLink !== ''" @click="openLinkExternally(modalObj.googleMeetLink)"
            type="primary" secondary>Google Meet</n-button>
          <n-button @click="this.showDeleteModal = true" type="error" strong secondary>Delete event</n-button>
        </section>

        <n-modal v-model:show="showDeleteModal" preset="dialog" :title="modalObj.title + ' | ' + modalObj.time"
          content="Are you sure you want to delete this event?" positive-text="Yes" negative-text="No"
          @positive-click="deleteEvent(modalObj.fullEvent)" @negative-click="cancelCallback" />
      </template>
    </n-modal>
    <n-config-provider :theme="$store.state.screenMode === 'dark' ? darkTheme : null">
      <n-space vertical>
        <section class="d-flex justify-content-between meetingAndLogContainer">
          <n-space horizontal></n-space>
          <div class="sectionCreation mr-1" v-if="getMeetingroomList.length > 0">
            <n-card title="Meeting">
              <n-space vertical>
                <n-checkbox v-model:checked="onlineChecked">Online ( will create Google Meet link automatically
                  )</n-checkbox>
                <div class="d-flex">
                  <n-input maxlength="50" show-count v-model:value="title" placeholder="Title of event" type="text">
                  </n-input>
                </div>

                <n-input :autosize="{
                  minRows: 3,
                  maxRows: 20,
                }" show-count maxlength="1000" type="textarea" placeholder="Description of event"
                  v-model:value="description" />
                <n-select v-if="!onlineChecked" v-model:value="location" :options="getMeetingroomList"
                  placeholder="Choose a meetingroom" filterable clearable></n-select>
                <n-select placeholder="Choose attendees" v-model:value="selectedAttendees" multiple
                  :options="getEmployees" filterable></n-select>
                <n-select v-if="!onlineChecked" placeholder="Choose timekeeper" v-model:value="selectedTimekeeper"
                  :options="getTimekeeperList(selectedAttendees)" filterable clearable>
                </n-select>

                <n-date-picker v-model:value="othertimeRange" type="datetimerange" clearable />
                <n-select v-if="timeSlots !== undefined && range !== undefined" :options="timeSlots"
                  v-model:value="selectedDay" placeholder="Select a timeslot">
                </n-select>
                <n-spin size="small" :show="isCreatingMeeting">
                  <n-button strong secondary type="primary" class="w-100" @click="
                    createEvent(
                      title,
                      description,
                      range,
                      selectedDay,
                      othertimeRange,
                      location,
                      selectedAttendees,
                      onlineChecked,
                      selectedTimekeeper
                    )
                  ">Create meeting</n-button>
                </n-spin>
              </n-space>
            </n-card>
          </div>
          <div v-else class="w-100">
            <n-card class="h-100" title="Meeting">
              <n-space vertical>
                <n-skeleton :sharp="false" height="30px" width="100%" />
                <n-skeleton :sharp="false" height="75px" width="100%" />
                <n-skeleton :sharp="false" height="30px" width="100%" />
                <n-skeleton :sharp="false" height="30px" width="100%" />
                <n-skeleton :sharp="false" height="30px" width="100%" />
                <n-skeleton :sharp="false" height="30px" width="100%" />
                <n-skeleton :sharp="false" height="30px" width="100%" />
              </n-space>
            </n-card>
          </div>

          <div class="sectionLog ml-1 d-flex justify-content-evenly flex-column">
            <n-collapse :default-expanded-names="['1']">
              <n-card>
                <n-collapse-item :title="
                  getActionLogFromStore.length > 0
                    ? 'Log'
                    : 'Log (no actions executed yet)'
                " name="1">
                  <n-scrollbar style="margin-top: -10px; gap: 20px !important"
                    class="p-2 d-flex flex-column scrollbarLog" v-if="getActionLogFromStore">
                    <n-space vertical>
                      <n-alert :type="action.succeeded ? 'success' : 'error'" v-for="action in getActionLogFromStore"
                        :key="action" :style="action !== undefined">
                        <p>{{ action.date }}</p>
                        <p>{{ action.message }}</p>
                      </n-alert>
                    </n-space>
                  </n-scrollbar>
                </n-collapse-item>
              </n-card>
            </n-collapse>

            <!--OPTIONAL CLEAR BUTTON-->
            <!-- <n-button @click="$store.commit('CLEAR_ACTION_LOG')" class="w-100"
              >Clear</n-button
            > -->
          </div>
        </section>

        <section>
          <AllMeetingRooms />
        </section>

        <n-card>
          <div class="d-flex justify-content-between" id="calendarHeader">
            <n-button class="d-flex justify-content-end" @click="fetchCalendar">Reload calendar</n-button>
            <n-button @click="changeCalendarView" id="desktopChangeViewBtn">Change view</n-button>
          </div>

          <n-calendar v-model:value="value" #="{ year, month, date }" :is-date-disabled="isDateDisabled">
            <n-scrollbar style="max-height: 500px">
              <div v-for="item in getCalendarItemsFromStore" :key="item.ID" class="mt-2">
                <div v-if="
                  extractDateFromDateISOstring(item.start['dateTime']) ===
                  `${make2DigitsIfNot(date)}-${make2DigitsIfNot(
                    month
                  )}-${year}`
                ">
                  <button class="btn btn-success w-100 text-white" :value="item.summary"
                    @click="openCalendarItemModal(item)">
                    {{ item.summary }}<br />
                    {{ extractTimeFromDateISOstring(item.start["dateTime"]) }} -
                    {{ extractTimeFromDateISOstring(item.end["dateTime"]) }}
                  </button>
                </div>
              </div>
            </n-scrollbar>
          </n-calendar>
        </n-card>
      </n-space>
    </n-config-provider>
  </div>
</template>


<script>
import {
  extractTimeFromDateISOstring,
  extractDateFromDateISOstring,
  make2DigitsIfNot,
  openLinkExternally,
  sortAttendeesList,
  extractEmailsFromSelectedAttendees,
  getTimekeeperList,
  startOfWeek,
  endOfWeek,
  convertMsToHM,
  millisToMinutesAndSeconds,
  dateCheckIfBetweenTwoDates,
  isToday,
} from "@/utilities/converters";
import { defineComponent, ref } from "vue";
import AllMeetingRooms from "@/components/Meeting/AllMeetingRooms";
import {
  useMessage,
  NCalendar,
  NButton,
  NDatePicker,
  NSelect,
  NInput,
  NSpace,
  NConfigProvider,
  NModal,
  NCard,
  NTooltip,
  NScrollbar,
  darkTheme,
  NCheckbox,
  NTag,
  NUpload,
  NSpin,
  NAlert,
  NCollapse,
  NCollapseItem,
  NSkeleton,
} from "naive-ui";
import { isYesterday, addDays } from "date-fns";
import { useLoadingBar } from "naive-ui";
export default defineComponent({
  name: "GoogleCalendarPlannings",
  components: {
    NConfigProvider,
    NCalendar,
    NButton,
    NUpload,
    AllMeetingRooms,
    NCalendar,
    NButton,
    NInput,
    NSelect,
    NDatePicker,
    NSpace,
    NModal,
    NCard,
    NTooltip,
    NScrollbar,
    NCheckbox,
    NTag,
    NSpin,
    NAlert,
    NCollapse,
    NCollapseItem,
    NSkeleton,
  },
  props: {
    calendarItems: Array,
    msg: String,
  },
  computed: {
    getTimeslotsWithAvailability() {
      let startingDateTime = new Date(new Date().setHours(0, 0, 0, 0));
      const endingDateTime = new Date(new Date().setHours(24, 0, 0, 0));
      let listOfTimeSlots = [];
      let index = 0;

      while (index <= 13) {
        let nextHour = new Date(startingDateTime).getHours() + 1;

        if (listOfTimeSlots[index - 1] !== undefined) {
          let obj = {
            label:
              new Date(listOfTimeSlots[index - 1].dateTimeTill).getDay() +
              " " +
              new Date(listOfTimeSlots[index - 1].dateTimeTill).setHours(
                new Date(listOfTimeSlots[index - 1].dateTimeTill).getHours() + 1
              ),
            value: JSON.stringify({
              dateTimeFrom: new Date(listOfTimeSlots[index - 1].dateTimeTill),
              dateTimeTill: new Date(
                listOfTimeSlots[index - 1].dateTimeTill
              ).setHours(
                new Date(listOfTimeSlots[index - 1].dateTimeTill).getHours() + 1
              ),
            }),
          };

          if (this.eventOverlapsWithTimeslot(obj) !== true) {
            listOfTimeSlots.push(obj);
          }
        } else {
          let obj = {
            label:
              new Date(new Date().setHours(8, 0, 0, 0)).getHours() +
              " " +
              new Date(new Date().setHours(9, 0, 0, 0)),
            value: JSON.stringify({
              dateTimeFrom: new Date(new Date().setHours(8, 0, 0, 0)),
              dateTimeTill: new Date(new Date().setHours(9, 0, 0, 0)),
            }),
          };

          if (this.eventOverlapsWithTimeslot(obj) !== true) {
            listOfTimeSlots.push(obj);
          }
        }

        startingDateTime.setHours(nextHour + 1);
        index++;
      }
      return listOfTimeSlots;
    },
    getLoginStatus() {
      return this.$store.state.isLoggedIn;
    },
    getCalendarItemsFromStore() {
      return this.$store.state.calendarItems;
    },
    getAttendeesNames() {
      let array = [];
      for (let attendee in this.modalObj.fullEvent.attendees) {
        array.push(attendee.split("@")[0]);
      }
    },
    getActionLogFromStore() {
      return this.$store.state.actionLog.sort((x) => x.date).reverse();
    },
    getEmployees() {
      return this.$store.state.employees;
    },
    getMeetings() {
      return this.$store.state.meetings;
    },
    getMeetingroomList() {
      return this.$store.state.meetingroomNameList;
    },
    getMeetingroomInfoList() {
      return this.$store.state.meetingroomInfoList;
    },
  },
  created() {
    this.api = gapi;
    this.handleClientLoad();
  },
  mounted() {
    if (!this.getLoginStatus) {
      this.$router.push(this.$store.state.routing.home);
    }
    this.initClient();
    window.$message = useMessage();
    window.$loadingbar = useLoadingBar();
    window.$message.success("Welcome " + this.$store.state.name);
    this.fetchCalendar();
    this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");
  },
  unmounted() {
    window.removeEventListener("resize", this.resizeHandler);
  },
  beforeMount() {
    window.removeEventListener("resize", this.resizeHandler);
  },
  data() {
    return {
      actionLog: [],
      modalObj: {
        fullEvent: undefined,
        title: "",
        description: "",
        location: "",
        time: "",
        googleMeetLink: "",
        timeKeeper: "",
      },
      user: "",
      desktop: true,
      title: undefined,
      description: undefined,
      location: undefined,
      selectedMeetingroom: {},
      selectedAttendees: undefined,
      selectedTimekeeper: undefined,
      recurrentMeeting: undefined,
      selectedRecurrency: undefined,
      recurrencyCount: undefined,
      recurrencyTillDate: undefined,
      onlineChecked: undefined,
      meetingLink: undefined,
      showModal: false,
      showDeleteModal: false,
      timeSlots: undefined,
      othertimeRange: undefined,
      isCreatingMeeting: false,
    };
  },
  methods: {
    resizeHandler(e) {
      if (window.innerWidth <= 900) this.desktop = false;
      else this.desktop = true;
    },
    handleUpdateValueRange(value, option) {
      this.selectedDate = value;
      this.getTimeslots();
      this.$store.dispatch(
        "fetchMeetingsFromApiForSelectedDate",
        new Date(value).setHours(0, 0, 0)
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
          label: `${new Date(day).getDate()}/${new Date(day).getMonth() + 1
            }/${new Date(day).getFullYear()} - ${days[d.getDay()]} `,
          value: day, //type Date
        });
      }
      return listDates;
    },
    openLinkExternally,
    sortAttendeesList,
    extractTimeFromDateISOstring,
    extractDateFromDateISOstring,
    make2DigitsIfNot,
    extractEmailsFromSelectedAttendees,
    getTimekeeperList,
    startOfWeek,
    endOfWeek,
    convertMsToHM,
    millisToMinutesAndSeconds,
    dateCheckIfBetweenTwoDates,
    isToday,
    //AUTH2
    handleClientLoad() {
      this.api.load("client:auth2", this.initClient);
    },
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
      const SCOPES = [
        "openid",
        "profile,",
        "https://www.googleapis.com/auth/calendar",
      ];

      if (vm.api.client === undefined) return;
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
    ///
    async getMeetingroomIdByName(location) {
      let list = await this.$store.state.meetingroomInfoList;
      let filter = list.filter((x) => x.name === location);
      return filter[0];
    },
    async getMeetingIdByName(meetingName) {
      this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");
      let list = await this.$store.state.meetings;
      let filter = list.filter((x) => x.name === meetingName);
      return filter[0];
    },
    ///////////////////

    //Delete modal cancel
    cancelCallback() {
      window.$message.info("Event is not deleted.", {
        keepAliveOnHover: true,
      });
      this.showDeleteModal = false;
    },
    openCalendarItemModal(calendarItem) {
      this.modalObj.title = calendarItem.summary;

      if (calendarItem.description !== undefined) {
        this.modalObj.description = calendarItem.description;
        console.log(calendarItem.description);
        if (calendarItem.description.includes("Timekeeper")) {
          if (calendarItem.description.split("Timekeeper")[0] !== undefined) {
            this.modalObj.description =
              calendarItem.description.split("Timekeeper")[0];
          }
          if (
            calendarItem.description.split("Timekeeper")[1].split(":")[1] !==
            undefined
          ) {
            this.modalObj.timeKeeper = calendarItem.description
              .split("Timekeeper")[1]
              .split(":")[1];
          }
        }

      } else {
        this.modalObj.description = null;
        this.modalObj.timeKeeper = null;
      }

      this.modalObj.location = calendarItem.location;
      this.modalObj.fullEvent = calendarItem;
      this.modalObj.eventLink = calendarItem.htmlLink;

      this.modalObj.googleMeetLink =
        calendarItem.conferenceData !== undefined
          ? calendarItem.conferenceData.entryPoints[0].uri
          : "";
      this.modalObj.time = `${this.extractTimeFromDateISOstring(
        calendarItem.start["dateTime"]
      )} - ${this.extractTimeFromDateISOstring(calendarItem.end["dateTime"])}`;
      this.showModal = true;
    },

    //FETCHING CALENDAR FROM GOOGLE
    async fetchCalendar() {
      window.$loadingbar.start();
      let start = this.startOfWeek(new Date());
      let end = this.endOfWeek(new Date());

      if (gapi.client === undefined) return;
      const events = await gapi.client.calendar.events
        .list({
          calendarId: "primary",
          timeMin: start.toISOString(),
          // timeMax: end.toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 75,
          orderBy: "starttime",
        })
        .then((events) => {
          window.$loadingbar.finish();
          this.$store.commit("SET_CALENDAR_ITEMS", events.result.items);
          window.$loadingbar.finish();
          window.$message.success("Calendar has been updated.", {
            keepAliveOnHover: true,
          });
        })
        .catch((error) => {
          window.$loadingbar.finish();
          window.$message.error(error.result.error.message, {
            keepAliveOnHover: true,
          });
          window.$loadingbar.error();
        });
    },
    //EVENT CREATION
    async createEvent(
      title,
      description,
      selectedDay,
      timeRange,
      othertimeRange,
      location,
      selectedAttendees,
      onlineChecked,
      selectedTimekeeper
    ) {
      if (
        title === undefined ||
        location === undefined ||
        selectedAttendees === undefined ||
        selectedTimekeeper === undefined
      ) {
        if (title === undefined || title === "") {
          window.$message.warning("Fill in title", {
            keepAliveOnHover: true,
          });
          return;
        }
        if (!onlineChecked) {
          if (location === undefined) {
            window.$message.warning("Choose a meetingroom", {
              keepAliveOnHover: true,
            });
            return;
          }
          if (selectedTimekeeper === undefined) {
            window.$message.warning("Select a timekeeper", {
              keepAliveOnHover: true,
            });
            return;
          }
        }

        if (selectedAttendees === undefined) {
          window.$message.warning("Select attendees", {
            keepAliveOnHover: true,
          });
          return;
        }
      }

      this.isCreatingMeeting = true;

      let fromDate;
      let tillDate;
      if (othertimeRange !== undefined) {
        fromDate = new Date(othertimeRange[0]);
        tillDate = new Date(othertimeRange[1]);
      } else {
        let finalSelectedDay = new Date(selectedDay);
        let time = JSON.parse(timeRange);

        let timeFromHours =
          parseInt(time.dateTimeFrom.split("T")[1].split(":")[0]) + 2;

        let timeObj = {
          timeFrom: timeFromHours,
          timeTill: new Date(time.dateTimeTill).getHours(),
        };
        fromDate = new Date(
          new Date(
            new Date(finalSelectedDay).setHours(timeObj.timeFrom, 0, 0, 0)
          )
        );
        tillDate = new Date(
          new Date(
            new Date(finalSelectedDay).setHours(timeObj.timeTill, 0, 0, 0)
          )
        );
      }

      await this.$store
        .dispatch("fetchMeetingsFromApiForSelectedDate")
        .then(async () => {
          //Checks if meetingroom is available to book
          let arr = await this.$store.state.meetings.filter(
            (x) => x.meetingroom.name == location
          );
          arr.sort((x) => x.dateTimeTill);
          arr = JSON.parse(
            JSON.stringify(
              this.$store.state.meetings.filter(
                (x) =>
                  x.meetingroom.name == location &&
                  new Date(x.dateTimeFrom).getDate() === fromDate.getDate()
              )
            )
          );

          //Checks if the current event in creation could create an overlapping event -> if so, blocks it and notifies the user.
          for (let meet of arr) {
            let FirstStart = new Date(fromDate.setSeconds(0, 0)).getTime();
            let FirstEnd = new Date(tillDate.setSeconds(0, 0)).getTime();

            let SecondStart = new Date(
              new Date(meet.dateTimeFrom).setSeconds(0, 0)
            ).getTime();
            let SecondEnd = new Date(
              new Date(meet.dateTimeTill).setSeconds(0, 0)
            ).getTime();

            if (
              (FirstStart <= SecondStart && FirstEnd > SecondStart) ||
              (FirstStart < SecondEnd && FirstEnd >= SecondEnd)
            ) {
              window.$message.error(
                "Cannot create meeting because it overlaps other planned meetings.",
                {
                  keepAliveOnHover: true,
                  duration: 5000,
                }
              );
              this.isCreatingMeeting = false;
              return;
            }
          }

          if (onlineChecked) {
            location = "Online meeting";
          }
          else description += `\n\n\nTimekeeper:\n${this.selectedTimekeeper}`;

          let extractedEmailsFromSelectedAttendees =
            this.extractEmailsFromSelectedAttendees(selectedAttendees);

          window.$loadingbar.start();


          var createdEvent = {
            summary: title,
            location: location,
            description: description,
            start: {
              dateTime: fromDate.toISOString(),
            },
            end: {
              dateTime: tillDate.toISOString(),
            },
            // recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
            attendees: extractedEmailsFromSelectedAttendees,
            conferenceDataVersion: 1,
            reminders: {
              useDefault: false,
              overrides: [
                { method: "email", minutes: 24 * 60 },
                { method: "popup", minutes: 10 },
              ],
            },
          };

          var request = gapi.client.calendar.events.insert({
            calendarId: "primary",
            resource: createdEvent,
            //
          });

          console.log(request);

          let validation = false;
          request.then(async (event) => {
            event.result.htmlLink !== undefined
              ? (validation = true)
              : validation;
            window.$loadingbar.finish();
            window.$message.success(
              `Event '${title}' has been added succesfully.`,
              {
                keepAliveOnHover: true,
              }
            );

            let action = `<b>${new Date()}</b><br/> Event '${title}' has been added succesfully.`;

            this.$store.commit("ADD_TO_ACTIONLOG", {
              date: new Date(),
              message: `Event '${title}' has been added succesfully.`,
              succeeded: true,
            });

            setTimeout(() => {
              this.fetchCalendar();
              this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");
            }, 1000);

            if (validation) {
              if (onlineChecked === true) {
                //ADDING ONLINE GOOGLE MEET TO EVENT WE JUST MADE ABOVE
                var eventPatch = {
                  conferenceData: {
                    createRequest: { requestId: Date.now() },
                  },
                };
                gapi.client.calendar.events
                  .patch({
                    calendarId: "primary",
                    eventId: event.result.id,
                    resource: eventPatch,
                    sendNotifications: true,
                    conferenceDataVersion: 1,
                  })
                  .then((event2) => {
                    this.modalObj.timeKeeper = null;
                    this.modalObj.googleMeetLink =
                      event2.result.conferenceData.entryPoints[0].uri;
                    setTimeout(() => {
                      this.fetchCalendar();
                      this.$store.dispatch(
                        "fetchMeetingsFromApiForSelectedDate"
                      );
                    }, 1000);
                  });
              } else {
                // if (eventresult.summary === "") return;
                let eventresult = event.result;

                let obj = {
                  MeetingName: eventresult.summary,
                  Description: eventresult.description,
                  DateTimeFrom: eventresult.start.dateTime,
                  DateTimeTill: eventresult.end.dateTime,
                  TimeKeeper: selectedTimekeeper,
                };
                if (onlineChecked === undefined || onlineChecked === false) {
                  //Get meetingroom id of selected meetingroom
                  let response = await this.getMeetingroomIdByName(
                    location
                  ).then((someobj) => {
                    obj.meetingroom = someobj.id;
                  });
                }
                this.$store.commit("SET_CURRENT_MEETING_CREATED", obj);
                this.$store.dispatch("CREATE_MEETING_STRAPI", obj);
                this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");
              }
            } else {
              window.$loadingbar.error();
              window.$message.error("Event couldn't be added.", {
                keepAliveOnHover: true,
              });
            }

            this.title = "";
            this.description = "";
            this.timeSlots = undefined;
            this.isCreatingMeeting = false;
          });
        }).catch((err) => {
          window.$message.error("Failed to create meeting. Please check internet access.", {
            keepAliveOnHover: true,
            duration: 5000
          })
          window.$loadingbar.error();
          this.isCreatingMeeting = false;
        });
    },
    //EVENT DELETION
    async deleteEvent(calendarItem) {
      window.$loadingbar.start();

      var request = gapi.client.calendar.events.delete({
        calendarId: "primary",
        eventId: calendarItem.id,
      });
      request.execute(async (response) => {
        if (response.error == undefined) {
          window.$loadingbar.finish();
          window.$message.success("Event is deleted succesfully.", {
            keepAliveOnHover: true,
          });
          // this.$store.commit(
          //   "ADD_TO_ACTIONLOG",
          //   `<b>${new Date()}</b><br/> Event '${
          //     calendarItem.summary
          //   }' is deleted succesfully.`
          // );
          this.$store.commit("ADD_TO_ACTIONLOG", {
            date: new Date(),
            message: `Event '${calendarItem.summary}' is deleted succesfully.`,
            succeeded: true,
          });
          this.fetchCalendar();
          this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");

          //TODO: Investigate why this is sometimes not returning an obj -- Maybe fixed now it's not awaited anymore?
          this.getMeetingIdByName(calendarItem.summary).then(
            async (someobj) => {
              if (someobj === undefined) {
                this.getMeetingIdByName(calendarItem.summary).then(
                  async (newObj) => {
                    this.$store.commit(
                      "SET_CURRENT_MEETING_TO_DELETE",
                      newObj.id
                    );
                    this.$store.dispatch("DELETE_MEETING_STRAPI");
                  }
                );
              } else {
                this.$store.commit("SET_CURRENT_MEETING_TO_DELETE", someobj.id);
                this.$store.dispatch("DELETE_MEETING_STRAPI");
              }
            }
          );
        } else if (response.error !== undefined) {
          window.$loadingbar.error();
          window.$message.error(
            `Failed to delete event '${calendarItem.summary}'. This event might not exist anymore or internet is not accessible.`,
            {
              keepAliveOnHover: true,
              duration: 5000,
            }
          );
          // this.$store.commit(
          //   "ADD_TO_ACTIONLOG",
          //   `Failed to delete event '${calendarItem.summary}'.`
          // );
          this.$store.commit("ADD_TO_ACTIONLOG", {
            date: new Date(),
            message: `Failed to delete event '${calendarItem.summary}'.`,
            succeeded: false,
          });
          this.fetchCalendar();
          this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");
        } else {
          window.$loadingbar.finish();
          // this.$store.commit(
          //   "ADD_TO_ACTIONLOG",
          //   `<b>${new Date()}</b><br/> Event '${
          //     calendarItem.summary
          //   }' is deleted succesfully.`
          // );
          this.$store.commit("ADD_TO_ACTIONLOG", {
            date: new Date(),
            message: `Event '${calendarItem.summary}' is deleted succesfully.`,
            succeeded: true,
          });
          window.$message.success("Event is deleted succesfully.", {
            keepAliveOnHover: true,
          });
          this.fetchCalendar();
          this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");
        }
      });
      this.showModal = false;
    },
    changeCalendarView() {
      let calendar = document.querySelector(".n-calendar .n-calendar-dates");
      if (!calendar.classList.contains("d-block")) {
        calendar.classList.add("d-block");
      } else {
        calendar.classList.remove("d-block");
      }
    },
    dateRangeOverlaps(a_start, a_end, b_start, b_end) {
      if (a_start < b_start && b_start < a_end) return true; // b starts in a
      if (a_start < b_end && b_end <= a_end) return true; // b ends in a
      if (b_start < a_start && a_end < b_end) return true; // a in b
      return false;
    },
    eventOverlapsWithTimeslot(timeslot, locationSelect) {
      for (let meet of this.getMeetingsOfMeetingroom(locationSelect)) {
        let timeSlotDateTimeFrom = new Date(
          new Date(timeslot.dateTimeFrom).setSeconds(0, 0)
        ).getTime();

        let timeSlotDateTimeTill = new Date(
          new Date(timeslot.dateTimeTill).setSeconds(0, 0)
        ).getTime();

        let meetingDateTimeFrom = new Date(
          new Date(meet.dateTimeFrom).setSeconds(0, 0)
        ).getTime();

        let meetingDateTimeTill = new Date(
          new Date(meet.dateTimeTill).setSeconds(0, 0)
        ).getTime();

        if (
          this.dateRangeOverlaps(
            timeSlotDateTimeFrom,
            timeSlotDateTimeTill,
            meetingDateTimeFrom,
            meetingDateTimeTill
          ) === true
        ) {
          return true;
        }
      }
    },
    getTimeslots(locationSelect) {
      this.location = locationSelect;
      let startingDateTime = new Date(new Date().setHours(0, 0, 0, 0));
      const endingDateTime = new Date(new Date().setHours(24, 0, 0, 0));
      this.timeSlots = undefined;
      let listOfTimeSlots = [];
      let listOfDisplayableTimeSlots = [];
      let index = 0;

      while (index <= 13) {
        let nextHour = new Date(startingDateTime).getHours() + 1;
        if (listOfTimeSlots[index - 1] !== undefined) {
          let displayObj = {
            label:
              new Date(listOfTimeSlots[index - 1].dateTimeTill).getHours() +
              ":00 - " +
              new Date(
                new Date(listOfTimeSlots[index - 1].dateTimeTill).setHours(
                  new Date(listOfTimeSlots[index - 1].dateTimeTill).getHours() +
                  1
                )
              ).getHours() +
              ":00",
            value: JSON.stringify({
              dateTimeFrom: new Date(listOfTimeSlots[index - 1].dateTimeTill),
              dateTimeTill: new Date(
                listOfTimeSlots[index - 1].dateTimeTill
              ).setHours(
                new Date(listOfTimeSlots[index - 1].dateTimeTill).getHours() + 1
              ),
            }),
          };

          let pushObj = {
            dateTimeFrom: new Date(listOfTimeSlots[index - 1].dateTimeTill),
            dateTimeTill: new Date(
              listOfTimeSlots[index - 1].dateTimeTill
            ).setHours(
              new Date(listOfTimeSlots[index - 1].dateTimeTill).getHours() + 1
            ),
          };

          if (
            this.eventOverlapsWithTimeslot(pushObj, locationSelect) !== true
          ) {
            listOfTimeSlots.push(pushObj);
            listOfDisplayableTimeSlots.push(displayObj);
          } else {
            listOfTimeSlots.push(pushObj);
            displayObj.label += " | BOOKED";
            listOfDisplayableTimeSlots.push(displayObj);
          }
        } else {
          let displayObj = {
            label:
              new Date(new Date().setHours(8, 0, 0, 0)).getHours() +
              ":00 - " +
              new Date(new Date().setHours(9, 0, 0, 0)).getHours() +
              ":00",
            value: JSON.stringify({
              dateTimeFrom: new Date(new Date().setHours(8, 0, 0, 0)),
              dateTimeTill: new Date(new Date().setHours(9, 0, 0, 0)),
            }),
          };

          let pushObj = {
            dateTimeFrom: new Date(new Date().setHours(8, 0, 0, 0)),
            dateTimeTill: new Date(new Date().setHours(9, 0, 0, 0)),
          };

          if (
            this.eventOverlapsWithTimeslot(pushObj, locationSelect) !== true
          ) {
            listOfTimeSlots.push(pushObj);

            listOfDisplayableTimeSlots.push(displayObj);
          } else {
            listOfTimeSlots.push(pushObj);
            displayObj.label += " | BOOKED";
            listOfDisplayableTimeSlots.push(displayObj);
          }
        }

        startingDateTime.setHours(nextHour + 1);
        index++;
      }

      if (locationSelect !== undefined) {
        this.timeSlots = listOfDisplayableTimeSlots.filter(
          (x) => !x.label.includes("BOOKED")
        );
      }
    },
    getMeetingsOfMeetingroom(locationSelect) {
      this.$store.dispatch(
        "fetchMeetingsFromApiForSelectedDate",
        new Date().setHours(0, 0, 0)
      );
      //TODO: Fix this date not working
      //  this.$store.dispatch(
      //         "fetchMeetingsFromApiForSelectedDate",
      //         new Date(this.selectedDay).setHours(0, 0, 0)
      //       );

      let meetArray = [];
      for (let meeting of this.$store.state.meetings.filter(
        (x) => x.meetingroom.name == locationSelect
      )) {
        meetArray.push(meeting);
      }
      return JSON.parse(JSON.stringify(meetArray));
    },
  },
  setup() {
    return {
      // handleUpdateValue(_, { year, month, date }) {
      //   // message.success(`${year}-${month}-${date}`);
      //   message.info("test");
      // },
      darkTheme,
      blabla: ref(null),
      value: ref(addDays(Date.now(), 1).valueOf()),
      isDateDisabled(timestamp) {
        if (isYesterday(timestamp)) {
          return true;
        }
        return false;
      },
      othertimeRange: ref([
        new Date().setSeconds(0),
        new Date().setHours(new Date().getHours() + 1, 0, 0),
      ]),
      range: ref([
        new Date().setSeconds(0),
        new Date().setHours(new Date().getHours() + 1, 0, 0),
      ]),
      selectedDay: ref([new Date().setSeconds(0)]),
    };
  },
});
</script>
<style>
.scrollbarLog {
  height: 370px;
}

.n-checkbox.w-50.m-auto {
  justify-content: flex-end !important;
}

@media only screen and (max-width: 900px) {
  .scrollbarLog {
    max-height: 370px;
    height: inherit;
  }

  /* .n-calendar[data-v-4958126b] {
    margin: 0 !important;
  } */

  #calendarHeader {
    margin-bottom: 20px;
  }

  /* .n-card__content {
    padding-left: 0 !important;
  } */
  /* .n-card > .n-card__content,
  .n-card > .n-card__footer {
    padding-left: 0;
  } */
}
</style>

<style scoped>
#attendeesUL {
  list-style: none;
  padding-left: 0px;
}

#attendeesUL li {
  margin-bottom: 10px;
}

#attendeesUL p {
  justify-content: space-between;
  display: flex;
}

#attendeesUL li p i {
  padding-right: 20px;
}

.n-calendar {
  margin-top: 20px;
  overflow: scroll;
  height: 800px !important;
}

.n-calendar-cell {
  height: auto !important;
}

button {
  padding-left: 10px;
  font-size: 12px;
  border-radius: 5px;
  text-align: left;
  font-weight: bold;
  margin-bottom: -3px;
}

.googleCalendarRefreshContainer {
  padding-top: 25px;
}

#googleCalendarTitle {
  color: #18a058;
  border-bottom: 2px solid rgb(218, 240, 228);
  font-weight: bold;
  margin-top: 50px;
  font-size: 16px;
}

.n-button n-button--error-type n-button--medium-type n-button--secondary mt-auto mb-auto {
  font-size: 18px;
}

input.btn.btn-success,
input.btn.btn-danger {
  font-size: 14px;
}

.n-tag {
  min-width: 80px;
}

.meetingAndLogContainer {
  gap: 10px;
}

@media only screen and (max-width: 900px) {
  .meetingAndLogContainer {
    flex-direction: column-reverse;
  }

  .sectionCreation,
  .sectionLog {
    width: 100%;
  }

  #desktopChangeViewBtn {
    display: none;
  }
}
</style>
<style>
.n-card {
  border-radius: 5px;
}

.n-card-header__main {
  font-weight: bold !important;
}

.n-card.n-modal.custom-card {
  width: 600px;
}

.n-button.n-button--disabled {
  color: white;
  opacity: 100%;
}

.n-calendar-dates {
  overflow: scroll;
}

.custom-card p {
  margin-bottom: 10px;
}

.sectionCreation,
.sectionLog {
  width: 100%;
}

@media only screen and (max-width: 900px) {
  .n-calendar .n-calendar-dates {
    display: block;
  }

  .modalButtonGroup {
    flex-direction: column;
    gap: 10px;
  }

  .responseStatusMeeting {
    display: none;
  }
}
</style>

