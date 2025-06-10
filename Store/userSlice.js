import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  user: {
    email: 'Guest User',
    dateOfBirth: '',
    address: '',
    phone: '',
    selectedAvatar: null,
  },
  selectedLanguage: null,
  selectedAgeGroup: null,
  email: null,
  videos: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
		console.log('LOGIN PAYLOAD:', action.payload);
      state.isLoggedIn = true;
      state.user = { ...state.user, ...action.payload };
      state.email = action.payload.email_id;
      // Do NOT store password in Redux
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = initialState.user;
      state.selectedLanguage = null;
      state.selectedAgeGroup = null;
      state.email = null;
      state.videos = [];
    },
    setLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    setAgeGroup: (state, action) => {
      console.log('setAgeGroup reducer called with:', action.payload);
      state.selectedAgeGroup = action.payload;
      console.log('Updated selectedAgeGroup in state:', state.selectedAgeGroup);
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setVideos: (state, action) => {
      state.videos = action.payload;
    },
    addVideo: (state, action) => {
      state.videos.push(action.payload);
    },
  },
});

export const {
  login,
  logout,
  setLanguage,
  setAgeGroup,
  setEmail,
  setProfile,
  updateProfile,
  setVideos,
  addVideo,
} = userSlice.actions;

export default userSlice.reducer;
