<template>
  <n-modal
    v-model:show="showModal"
    class="custom-card"
    preset="card"
    :title="
      'Create Meeting | ' +
      `${new Date(modalObj.selectedDate).getDate()}/${
        new Date(modalObj.selectedDate).getMonth() + 1
      }/${new Date(modalObj.selectedDate).getFullYear()}  ` +
      `${new Date(modalObj.selectedTime.timeFrom).getHours()}:00 - ${new Date(
        modalObj.selectedTime.timeTill
      ).getHours()}:00`
    "
    :bordered="false"
    size="huge"
  >
    <p>
      Location: <b>{{ modalObj.selectedLocation }}</b>
    </p>
    <div class="d-flex">
      <n-space vertical style="width: 100% !important">
        <n-input
          maxlength="50"
          show-count
          class="w-100"
          v-model:value="title"
          placeholder="Title of event"
          type="text"
        >
        </n-input>
        <n-input
          :autosize="{
            minRows: 3,
            maxRows: 20,
          }"
          show-count
          maxlength="1000"
          type="textarea"
          placeholder="Description of event"
          v-model:value="description"
        />
        <n-select
          placeholder="Choose attendees"
          v-model:value="selectedAttendees"
          multiple
          :options="getEmployees"
          filterable
        ></n-select>
        <n-select
          v-if="!onlineChecked"
          placeholder="Choose timekeeper"
          v-model:value="selectedTimekeeper"
          :options="getTimekeeperList(selectedAttendees)"
          filterable
          clearable
        >
        </n-select>
        <n-button
          class="w-100"
          @click="
            createEvent(
              title,
              description,
              selectedAttendees,
              false,
              selectedTimekeeper
            )
          "
          >Book</n-button
        >
      </n-space>
    </div>
  </n-modal>

  <n-list bordered style="width: 350px" class="listOfSlotsContainer">
    <template #header>
      <h6>{{ meetingroom.name }}</h6>
    </template>
    <!-- <template #footer> fff </template> -->
    <n-list-item v-for="ts in getTimeslotsWithAvailability" :key="ts.id">
      <n-thing>
        <button
          @click="openCreateModal(ts, meetingroom.name)"
          :disabled="ts.isOverlapping"
          :class="
            ts.isOverlapping === true ? 'btn btn-danger' : 'btn btn-success'
          "
          class="text-white d-flex justify-content-between openModalBtn"
          :value="ts.name"
        >
          {{ ts.dateTimeFrom.getHours() }}:00 -
          {{ new Date(ts.dateTimeTill).getHours() }}:00
          <n-config-provider :theme="darkTheme">
            <n-tag v-if="!ts.isOverlapping" style="text-align: center"
              >AVAILABLE
            </n-tag>
            <n-tag v-if="ts.isOverlapping" style="text-align: center"
              >BOOKED</n-tag
            >
          </n-config-provider>
        </button>
      </n-thing>
    </n-list-item>
  </n-list>
  <!-- 
  <div v-for="meeting in getMeetingsOfMeetingroom" :key="meeting.id">
    <n-card>
      <div class="d-flex titleAndTimeContainer">
        <h6 v-if="
          $store.state.email === meeting.timeKeeper ||
          !meeting.keepMeetingNameSecret
        ">
          {{ meeting.name }}
        </h6>
        <h6 v-else>Title is hidden by user</h6>
        <n-button class="timeBtn" disabled tertiary type="error">
          {{ extractTimeFromDateISOstring(meeting.dateTimeFrom) }}
          {{ extractTimeFromDateISOstring(meeting.dateTimeTill) }}
        </n-button>
      </div>
      <p class="pt-3">Timekeeper: {{ meeting.timeKeeper }}</p>
    </n-card>
    <br />
  </div> -->
</template>

<script>
import {
  extractTimeFromDateISOstring,
  extractDateFromDateISOstring,
  extractEmailsFromSelectedAttendees,
  make2DigitsIfNot,
  getTimekeeperList,
} from "@/utilities/converters";
import { ref } from "vue";
import { isYesterday, addDays } from "date-fns";
import {
  useMessage,
  NCard,
  NSpace,
  NButton,
  NCalendar,
  NScrollbar,
  NModal,
  NList,
  NListItem,
  NThing,
  NTag,
  NCheckbox,
  NInput,
  NSelect,
  NDatePicker,
  NConfigProvider,
  darkTheme,
} from "naive-ui";
export default {
  name: "Meeting View Info",
  props: {
    meetingroom: Object,
    selectedDate: Number,
  },
  components: {
    NCard,
    NSpace,
    NButton,
    NCalendar,
    NScrollbar,
    NModal,
    NList,
    NListItem,
    NThing,
    NTag,
    NCheckbox,
    NInput,
    NSelect,
    NDatePicker,
    NConfigProvider,
  },
  data() {
    return {
      modalObj: {
        selectedDate: undefined,
        selectedTime: {},
        selectedLocation: undefined,
        timeKeeper: undefined,
      },

      showModal: false,
      showDeleteModal: false,
      timeSlotArr: [],
      title: undefined,
      description: undefined,
      selectedMeetingroom: {},
      selectedAttendees: undefined,
      selectedTimekeeper: undefined,
      onlineChecked: undefined,
      keepMeetingnameSecret: undefined,
      meetingLink: undefined,
      timeSlots: undefined,
      othertimeRange: undefined,
    };
  },
  mounted() {
    window.$message = useMessage();
  },
  computed: {
    getEmployees() {
      return this.$store.state.employees;
    },
    getTimeslotsWithAvailability() {
      let startingDateTime = new Date(new Date().setHours(0, 0, 0, 0));
      const endingDateTime = new Date(new Date().setHours(24, 0, 0, 0));
      let listOfTimeSlots = [];
      let index = 0;

      while (index <= 13) {
        let nextHour = new Date(startingDateTime).getHours() + 1;

        if (listOfTimeSlots[index - 1] !== undefined) {
          let obj = {
            dateTimeFrom: new Date(listOfTimeSlots[index - 1].dateTimeTill),
            dateTimeTill: new Date(
              listOfTimeSlots[index - 1].dateTimeTill
            ).setHours(
              new Date(listOfTimeSlots[index - 1].dateTimeTill).getHours() + 1
            ),
          };

          if (this.eventOverlapsWithTimeslot(obj) === true) {
            obj.isOverlapping = true;
          }

          listOfTimeSlots.push(obj);
        } else {
          let obj = {
            dateTimeFrom: new Date(
              new Date(this.selectedDate).setHours(8, 0, 0, 0)
            ),
            dateTimeTill: new Date(
              new Date(this.selectedDate).setHours(9, 0, 0, 0)
            ),
          };

          if (this.eventOverlapsWithTimeslot(obj) === true) {
            obj.isOverlapping = true;
          }

          listOfTimeSlots.push(obj);
        }

        startingDateTime.setHours(nextHour + 1);
        index++;
      }
      return listOfTimeSlots;
    },
    getMeetingsOfMeetingroom() {
      let meetArray = [];
      for (let meeting of this.$store.state.meetings.filter(
        (x) => x.meetingroom.id == this.meetingroom.id
      )) {
        meetArray.push(meeting);
      }
      return JSON.parse(JSON.stringify(meetArray));
    },
  },
  methods: {
    getTimekeeperList,
    extractEmailsFromSelectedAttendees,
    extractTimeFromDateISOstring,
    make2DigitsIfNot,
    extractDateFromDateISOstring,
    async getMeetingIdByName(meetingName) {
      this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");
      let list = await this.$store.state.meetings;
      let filter = list.filter((x) => x.name === meetingName);
      return filter[0];
    },
    async getMeetingroomIdByName(location) {
      let list = await this.$store.state.meetingroomInfoList;
      let filter = list.filter((x) => x.name === location);
      return filter[0];
    },
    openCreateModal(timeslot, meetingroomName) {
      this.modalObj.selectedDate = this.selectedDate;
      this.modalObj.selectedTime = {
        timeFrom: timeslot.dateTimeFrom,
        timeTill: new Date(timeslot.dateTimeTill),
      };
      this.modalObj.selectedLocation = meetingroomName;
      this.showModal = true;
    },
    dateRangeOverlaps(a_start, a_end, b_start, b_end) {
      if (a_start < b_start && b_start < a_end) return true; // b starts in a
      if (a_start < b_end && b_end <= a_end) return true; // b ends in a
      if (b_start < a_start && a_end < b_end) return true; // a in b
      return false;
    },
    eventOverlapsWithTimeslot(timeslot) {
      for (let meet of this.getMeetingsOfMeetingroom) {
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
    //EVENT CREATION
    async createEvent(
      title,
      description,
      selectedAttendees,
      onlineChecked,
      selectedTimekeeper
    ) {
      if (
        title === undefined ||
        selectedAttendees === undefined ||
        selectedTimekeeper === undefined
      ) {
        if (title === undefined || title === "") {
          window.$message.warning("Fill in title", {
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

        if (selectedAttendees === undefined) {
          window.$message.warning("Select attendees", {
            keepAliveOnHover: true,
          });
          return;
        }

        // let input = document.querySelectorAll(".n-input__input-el")[0];
        // if (input !== undefined) {
        //   input.focus();
        //   return;
        // }
      }

      let fromDate;
      let tillDate;

      let startHr = this.modalObj.selectedTime.timeFrom.getHours();
      let endHr = this.modalObj.selectedTime.timeTill.getHours();

      let startDate = new Date(new Date(this.modalObj.selectedDate)).setHours(
        startHr,
        0,
        0,
        0
      );
      let endDate = new Date(new Date(this.modalObj.selectedDate)).setHours(
        endHr,
        0,
        0,
        0
      );

      fromDate = new Date(startDate);
      tillDate = new Date(endDate);
      await this.$store
        .dispatch("fetchMeetingsFromApiForSelectedDate")
        .then(async () => {
          //Checks if meetingroom is available to book
          let arr = await this.$store.state.meetings.filter(
            (x) => x.meetingroom.name == this.modalObj.selectedLocation
          );
          arr.sort((x) => x.dateTimeTill);
          arr = JSON.parse(
            JSON.stringify(
              this.$store.state.meetings.filter(
                (x) =>
                  x.meetingroom.name == this.modalObj.selectedLocation &&
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
              window.$message.error("Overlapping events not allowed.");
              return;
            }
          }

          let extractedEmailsFromSelectedAttendees =
            this.extractEmailsFromSelectedAttendees(selectedAttendees);

          window.$loadingbar.start();
          description += `\n\n\nTimekeeper:\n${this.selectedTimekeeper}`;
          var createdEvent = {
            summary: title,
            location: this.modalObj.selectedLocation,
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
                duration: 5000,
              }
            );
            window.$message.success(
              `${this.modalObj.selectedLocation} has been booked succesfully for ` +
                `${new Date(this.modalObj.selectedDate).getDate()}/${
                  new Date(this.modalObj.selectedDate).getMonth() + 1
                }/${new Date(this.modalObj.selectedDate).getFullYear()}  ` +
                `${new Date(
                  this.modalObj.selectedTime.timeFrom
                ).getHours()}:00 - ${new Date(
                  this.modalObj.selectedTime.timeTill
                ).getHours()}:00`,
              {
                keepAliveOnHover: true,
                duration: 10000,
              }
            );

            // let action = `<b>${new Date()}</b><br/> Event '${title}' has been added succesfully.`;

            // this.$store.commit("ADD_TO_ACTIONLOG", action);
            this.$store.commit("ADD_TO_ACTIONLOG", {
              date: new Date(),
              message: `Event '${title}' has been added succesfully.`,
              succeeded: true,
            });

            setTimeout(() => {
              // this.fetchCalendar();
              this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");
            }, 1000);

            if (validation) {
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
                  this.modalObj.selectedLocation
                ).then((someobj) => {
                  obj.meetingroom = someobj.id;
                });
              }
              this.$store.commit("SET_CURRENT_MEETING_CREATED", obj);
              this.$store.dispatch("CREATE_MEETING_STRAPI", obj);
              this.$store.dispatch("fetchMeetingsFromApiForSelectedDate");
            } else {
              window.$loadingbar.error();
              window.$message.error("Event couldn't be added.", {
                keepAliveOnHover: true,
              });
            }
          });
        });
      this.title = undefined;
      this.description = undefined;
      this.selectedAttendees = undefined;
      this.selectedTimekeeper = undefined;
      this.showModal = false;
    },
  },
  setup() {
    return {
      darkTheme,
      value: ref(addDays(Date.now(), 1).valueOf()),
      isDateDisabled(timestamp) {
        if (isYesterday(timestamp)) {
          return true;
        }
        return false;
      },
      range: ref([
        new Date().setSeconds(0),
        new Date().setHours(new Date().getHours() + 1, 0, 0),
      ]),
    };
  },
};
</script>


<style scoped>
.titleAndTimeContainer {
  justify-content: space-between;
}

.titleAndTimeContainer h6 {
  margin-top: auto;
  margin-bottom: auto;
}

.timeBtn {
  font-size: 20px;
}

#attendeesUL {
  list-style: none;
  padding-left: 0px;
}

#attendeesUL p {
  justify-content: space-between;
  display: flex;
}

#attendeesUL li p i {
  padding-right: 20px;
}

.n-calendar {
  overflow: scroll;
  height: 800px !important;
}

.n-calendar-cell {
  height: auto !important;
}

button {
  padding-left: 10px;
  font-size: 15px;
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

.n-button
  n-button--error-type
  n-button--medium-type
  n-button--secondary
  mt-auto
  mb-auto {
  font-size: 18px;
}

input.btn.btn-success,
input.btn.btn-danger {
  font-size: 14px;
}

/* .n-tag {
  min-width: 80px;
} */

@media only screen and (max-width: 1800px) {
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

  .custom-card {
    width: 90vw !important;
  }

  .openModalBtn {
    width: 100% !important;
  }
}

@media only screen and (min-width: 1800px) {
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

  .custom-card {
    width: 90vw !important;
  }

  .openModalBtn {
    max-width: 450px !important;
    width: 100%;
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

/* .sectionCreation,
.sectionLog {
  width: 49%;
} */

.custom-card {
  max-height: 90vh !important;
}

.n-card__content .n-space:nth-child(2) {
  display: flex !important;
  justify-content: space-between !important;
  flex-flow: wrap !important;
}

@media only screen and (max-width: 900px) {
  .n-list.n-list--bordered.listOfSlotsContainer {
    width: 94vw !important;
  }

  .custom-card {
    width: 90vw !important;
  }
}
</style>
