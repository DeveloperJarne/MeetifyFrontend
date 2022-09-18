import { createStore } from 'vuex'
export default createStore({
  state: {
    /**
     * General data
     */
    baseUrlStrapi: 'https://meetify-app.herokuapp.com',
    baseUrlStrapiApi: 'https://meetify-app.herokuapp.com/api/',
    meetings: [],
    employees: [],
    meetingroomNameList: [],
    meetingroomInfoList: [],

    /**
     * UserData
     */
    name: "",
    profilepic: "",
    email: "",
    isLoggedIn: false,
    calendarItems: [],
    actionLog: [],
    currentCreatedMeeting: {},
    currentMeetingToDelete: undefined,
    selectedTimeSlotToBook: null,
    screenMode: null,
    loggedInFirebaseUser: null,
    /**
     * Routing
     */
    routing: {
      home: "/",
      eventsview: "/eventsview",
      yungoSite: "https://yungo.be/",
      meetingroomInfo: "/meetingroominfo",
      meetingsStrapi: "/hourlymeetingsview"
    }
  },
  mutations: {
    CLEAR_ACTION_LOG(state) {
      state.actionLog = [];
    },
    ADD_TO_ACTIONLOG(state, payload) {
      let array = state.actionLog;
      array.push(payload);
      payload ? state.actionLog = array : state.actionLog = state.actionLog;
    },
    CHANGE_LOGIN_STATUS(state, islogedIn) {
      state.isLoggedIn = islogedIn;
      localStorage.setItem('isLoggedIn', islogedIn);
    },
    CHANGE_USER_DATA(state, userObj) {
      state.name = userObj.name;
      state.profilepic = userObj.profilepic;
      state.email = userObj.email;
      localStorage.setItem('userName', state.name);
      localStorage.setItem('profilePic', state.profilepic);
      localStorage.setItem('email', state.email);
    },
    REMOVE_USER_DATA(state) {
      state.name = "";
      state.profilepic = "";
      state.email = "";

      localStorage.removeItem('userName');
      localStorage.removeItem('profilePic');
      localStorage.removeItem('email');
    },
    SET_EMPLOYEES_LIST(state, payload) {
      payload ? state.employees = payload : state.employees = [];
    },
    SET_MEETINGS_FOR_SELECTED_DATE_LIST(state, payload) {
      payload ? state.meetings = payload : state.meetings = [];
    },
    SET_MEETING_ROOMS_PICKERLIST(state, payload) {
      payload ? state.meetingroomNameList = payload : state.meetingroomNameList = [];
    },
    SET_MEETING_ROOMS_INFOLIST(state, payload) {
      payload ? state.meetingroomInfoList = payload : state.meetingroomInfoList = [];
    },
    SET_CALENDAR_ITEMS(state, payload) {
      payload ? state.calendarItems = payload : state.calendarItems = [];
    },
    SET_CURRENT_MEETING_CREATED(state, payload) {
      payload ? state.currentCreatedMeeting = payload : state.currentCreatedMeeting = {};
    },
    SET_CURRENT_MEETING_TO_DELETE(state, payload) {
      payload ? state.currentMeetingToDelete = payload : state.currentCreatedMeeting = undefined;
    },
    SET_SCREEN_MODE(state, payload) {
      payload !== undefined ? state.screenMode = payload : state.screenMode = null;
    },
    SET_LOGGEDIN_FIREBASEUSER(state, payload) {
      payload !== undefined ? state.loggedInFirebaseUser = payload : null;
    },
  },
  actions: {
    async retrieveUserSelectedScreenMode({ commit, state }, email) {
      const res = await fetch(`${state.baseUrlStrapiApi}firebase-users`);
      let content = await res.json();
      content = content.data.filter(x => x.attributes.Email == email);
      if (content !== []) {
        commit("SET_LOGGEDIN_FIREBASEUSER", content);
        if (content[0] === undefined) return;
        commit("SET_SCREEN_MODE", content[0].attributes.ScreenMode);
      }
    },
    async fetchMeetingsFromApiForSelectedDate({ state, commit }, date) {

      let array = [];
      await fetch(`${state.baseUrlStrapiApi}meetings?populate=meetingroom`)
        .then(async (res) => res.json())
        .then(async (body) => {
          for (let meeting of body.data) {
            if (date !== undefined) {
              let meetingDate = new Date(meeting.attributes.DateTimeFrom).setHours(0, 0, 0, 0);
              let selectedDate = new Date(date).setHours(0, 0, 0, 0);
              if (meetingDate === selectedDate) {
                array.push({
                  id: meeting.id,
                  name: meeting.attributes.MeetingName,
                  description: meeting.attributes.Description,
                  dateTimeFrom: meeting.attributes.DateTimeFrom,
                  dateTimeTill: meeting.attributes.DateTimeTill,
                  timeKeeper: meeting.attributes.TimeKeeper,
                  keepMeetingNameSecret: meeting.attributes.KeepMeetingNameSecret,
                  meetingroom: {
                    id: meeting.attributes.meetingroom.data.id,
                    name: meeting.attributes.meetingroom.data.attributes.MeetingroomName,
                    seats: meeting.attributes.meetingroom.data.attributes.Seets,
                    tv: meeting.attributes.meetingroom.data.attributes.TV,
                    whiteboard: meeting.attributes.meetingroom.data.attributes.Whiteboard,
                  }
                });
              }
            } else {
              array.push({
                id: meeting.id,
                name: meeting.attributes.MeetingName,
                description: meeting.attributes.Description,
                dateTimeFrom: meeting.attributes.DateTimeFrom,
                dateTimeTill: meeting.attributes.DateTimeTill,
                timeKeeper: meeting.attributes.TimeKeeper,
                keepMeetingNameSecret: meeting.attributes.KeepMeetingNameSecret,
                meetingroom: {
                  id: meeting.attributes.meetingroom.data.id,
                  name: meeting.attributes.meetingroom.data.attributes.MeetingroomName,
                  seats: meeting.attributes.meetingroom.data.attributes.Seets,
                  tv: meeting.attributes.meetingroom.data.attributes.TV,
                  whiteboard: meeting.attributes.meetingroom.data.attributes.Whiteboard,
                }
              });
            }
          }
          commit("SET_MEETINGS_FOR_SELECTED_DATE_LIST", array);
        });
    },
    async fetchAllEmployees({ state, commit }) {
      let array = [];
      await fetch(`${state.baseUrlStrapiApi}employees`)
        .then((res) => res.json())
        .then((body) => {
          for (let employ of body.data) {
            let obj = {
              label: employ.attributes["FullName"],
              value: employ.attributes,
            };
            array.push(obj);
          }
          commit("SET_EMPLOYEES_LIST", array);
        });
    },
    async fetchMeetingRooms({ state, commit }) {
      await fetch(`${state.baseUrlStrapiApi}meetingrooms?populate=Image`)
        .then((res) => res.json())
        .then((body) => {
          let pickerArray = [];
          let easierArray = [];
          for (let room of body.data) {
            //Creating new objects for picker
            let pickerobj = {
              label: room.attributes["MeetingroomName"],
              value: room.attributes["MeetingroomName"],
            };
            pickerArray.push(pickerobj);

            //Creating new objects for easier use
            let easierObj = {
              id: room.id,
              name: room.attributes.MeetingroomName,
              seats: room.attributes.Seets,
              tv: room.attributes.TV,
              whiteboard: room.attributes.Whiteboard,
            }

            if (room.attributes.Image.data == null) {
              easierObj.image = `https://res.cloudinary.com/yungo/image/upload/v1650358248/placeholder_meetingroom_1fe70d5deb.jpg`;
            }
            else {
              easierObj.image = `${room.attributes.Image.data.attributes.url}`;
            }
            easierArray.push(easierObj);
          }
          commit("SET_MEETING_ROOMS_PICKERLIST", pickerArray);
          commit("SET_MEETING_ROOMS_INFOLIST", easierArray);
        });

    },
    async CREATE_MEETING_STRAPI({ state }) {
      const rawResponse = await fetch(`${state.baseUrlStrapiApi}meetings`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: state.currentCreatedMeeting })
      });
      const content = await rawResponse.json();
    },
    async DELETE_MEETING_STRAPI({ state }) {
      const rawResponse = await fetch(`${state.baseUrlStrapiApi}meetings/${state.currentMeetingToDelete}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      const content = await rawResponse.json();
    },
    async CREATE_FIREBASE_USER({ state }) {
      //TODO: Check if firebaseUser existst in api/firebase-users. If not, add it.
      //
      const res = await fetch(`${state.baseUrlStrapiApi}firebase-users`)
      let obj = await res.json();

      //TODO: Check if user with UID exists.
      let exists = obj.data.filter(x => x.attributes.Email == localStorage.getItem("email"));
      if (obj.data.length <= 0 || exists.length <= 0) {
        //Add the firebaseUser
        let obj2 = {
          Email: localStorage.getItem('email'),
          Name: localStorage.getItem('userName'),
        }
        const rs = await fetch(`${state.baseUrlStrapiApi}firebase-users`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: obj2 })
        })
        const content = await rs.json();
      }
    },
    async SET_SCREENMODE_FORUSER_STRAPI({ commit, state, }, mode) {
      const res = await fetch(`${state.baseUrlStrapiApi}firebase-users`);
      let content = await res.json();
      content = content.data.filter(x => x.attributes.Email == localStorage.getItem('email'));
      if (content !== []) {
        commit("SET_LOGGEDIN_FIREBASEUSER", content);
        if (content[0] === undefined) return;

        const resp = await fetch(`${state.baseUrlStrapiApi}firebase-users/${state.loggedInFirebaseUser[0].id}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              Email: localStorage.getItem('email'),
              Name: localStorage.getItem('userName'),
              ScreenMode: mode
            }
          })
        })
        const contentres = await resp.json();
      }
    }
  },
  modules: {
  }
})
