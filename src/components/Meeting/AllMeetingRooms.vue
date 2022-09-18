<template>
  <n-card :class="$store.state.screenMode === 'dark' ? 'dark' : ''"
    :title="getAllMeetingroomsInfo.length > 0 ? 'Meeting rooms' : ''">
    <h3 v-if="getAllMeetingroomsInfo === undefined">Loading ...</h3>
    <div class="d-flex" style="gap: 20px" v-if="getAllMeetingroomsInfo.length <= 0">
      <n-skeleton height="250px" width="50%" :sharp="false"></n-skeleton>
      <div class="w-50">
        <n-skeleton :sharp="false" text :repeat="10" />
        <n-skeleton :sharp="false" text style="width: 60%" />
      </div>
    </div>
    <n-carousel :on-update:current-index="setMeetingRoomAvailability" show-arrow autoplay effect="fade"
      style="height: 240px" v-if="getAllMeetingroomsInfo.length > 0">
      <div v-for="room in getAllMeetingroomsInfo" :key="room.id" class="d-flex flex-row-reverse"
        style="position: relative; color: white">
        <div class="roomInfo" v-if="getAllMeetingroomsInfo.length > 0">
          <div v-if="getAllMeetingroomsInfo.length > 0">
            <h6 class="mb-4">
              {{
                  getAllMeetingroomsInfo.length > 0
                    ? room.name.toUpperCase()
                    : "Loading ..."
              }}
            </h6>

            <p>
              <n-tooltip trigger="hover" :show-arrow="false">
                <template #trigger>
                  <i class="fa-light fa-chair-office" style="font-size: 20px"></i>
                </template>
                Seats
              </n-tooltip>
              {{ room.seats }}
              {{ room.seats > 1 ? "SEATS" : "SEAT" }}
            </p>
            <p>
              <n-tooltip trigger="hover" :show-arrow="false">
                <template #trigger>
                  <i class="fa-light fa-tv"></i>
                </template>
                Screen
              </n-tooltip>

              {{ room.tv ? "AVAILABLE" : "NOT AVAILABLE" }}
            </p>
            <p>
              <n-tooltip trigger="hover" :show-arrow="false">
                <template #trigger>
                  <i class="fa-light fa-chalkboard-user"></i>
                </template>
                Whiteboard
              </n-tooltip>

              {{ room.whiteboard ? "AVAILABLE" : "NOT AVAILABLE" }}
            </p>
            <n-tag type="success" v-if="!meetingOngoing">Available now</n-tag>
            <n-tag type="error" v-if="meetingOngoing">Meeting ongoing</n-tag>
          </div>
        </div>

        <img v-if="room.image" :src="room.image ? room.image : '@assets/loadingGif.gif'" class="carousel-img w-50" />
      </div>

      <template #arrow="{ prev, next }">
        <div class="custom-arrow">
          <button type="button" class="curtom-arrow--left" @click="prev">
            <n-icon>
              <ArrowBack />
            </n-icon>
          </button>
          <button type="button" class="curtom-arrow--right" @click="next">
            <n-icon>
              <ArrowForward />
            </n-icon>
          </button>
        </div>
      </template>
      <template #dots="{ total, currentIndex, to }">
        <ul class="custom-dots">
          <li v-for="index of total" :key="index" :class="{ ['is-active']: currentIndex === index - 1 }"
            @click="to(index - 1)" />
        </ul>
      </template>
    </n-carousel>
  </n-card>
</template>

<script>
//TODO: Show all meeting rooms and redirect to more info
import { NCard, NCarousel, NIcon, NTooltip, NTag, NSkeleton } from "naive-ui";
import { ArrowBack, ArrowForward } from "@vicons/ionicons5";
export default {
  name: "AllMeetingRooms",
  components: {
    NCard,
    NCarousel,
    NIcon,
    ArrowBack,
    ArrowForward,
    NTooltip,
    NTag,
    NSkeleton,
  },
  computed: {
    getAllMeetingroomsInfo() {
      return this.$store.state.meetingroomInfoList;
    },
  },
  data: function () {
    return {
      meetingrooms: [],
      meetingOngoing: false,
    };
  },
  mounted() {
    this.setMeetingRoomAvailability(0);
  },
  methods: {
    async setMeetingRoomAvailability(value) {
      this.meetingOngoing = false;
      let room = this.$store.state.meetingroomInfoList[value];
      await this.$store.dispatch(
        "fetchMeetingsFromApiForSelectedDate",
        new Date()
      ).catch((err) => {
        window.$message.error("Network error occured. Please check internet access.", {
          keepAliveOnHover: true,
          duration: 5000
        })
        window.$loadingbar.error();
        this.isCreatingMeeting = false;
      });
      ;
      if (this.$store.state.meetings.length > 0) {
        for (let meeting of this.$store.state.meetings) {
          if (meeting.meetingroom.name === room.name) {
            if (
              new Date().setSeconds(0, 0) >=
              new Date(meeting.dateTimeFrom).setSeconds(0, 0) &&
              new Date().setSeconds(0, 0) <=
              new Date(meeting.dateTimeTill).setSeconds(0, 0)
            ) {
              this.meetingOngoing = true;
            } else {
              this.meetingOngoing = false;
            }
          }
        }
      }
    },
  },
};
</script>

<style scoped>
.dark .roomInfo {
  color: white !important;
}

.roomInfo {
  padding: 30px;
  color: black;
  width: 50%;
}

.roomInfo h6 {
  font-weight: bold;
}

.roomInfo i {
  padding-right: 20px;
}

@media only screen and (max-width: 900px) {
  .roomInfo {
    width: 100% !important;
    padding: 0;
  }

  img.carousel-img.w-50 {
    display: none;
  }

  .custom-dots {
    left: 0;
  }
}
</style>

<style>
/* .n-card.n-card--bordered .n-card__content {
  display: flex !important;
} */
.carousel-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 5px;
}

.custom-arrow {
  display: flex;
  position: absolute;
  bottom: 25px;
  right: 10px;
}

.custom-arrow button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 12px;
  color: #fff;
  background-color: #198754;
  border-width: 0;
  border-radius: 8px;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-arrow button:hover {
  background-color: gray;
}

.custom-arrow button:active {
  transform: scale(0.95);
  transform-origin: center;
}

.custom-dots {
  display: flex;
  margin: 0;
  padding: 0;
  position: absolute;
  bottom: 20px;
  left: 20px;
}

.custom-dots li {
  display: inline-block;
  width: 12px;
  height: 4px;
  margin: 0 3px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.4);
  transition: width 0.3s, background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-dots li.is-active {
  width: 40px;
  background: #fff;
}

.n-icon {
  width: auto;
}
</style>