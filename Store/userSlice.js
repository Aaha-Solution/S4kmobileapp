import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  user: {
    email: 'Guest User',
    username: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    selectedAvatar: null,
    users_id: null,
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
      const normalizedUser = {
        email: action.payload.email_id || action.payload.email || 'Guest User',
        username: action.payload.username || '',
        dateOfBirth: action.payload.dateOfBirth || '',
        address: action.payload.address || '',
        phone: action.payload.phone || '',
        selectedAvatar: action.payload.selectedAvatar || null,
        users_id: action.payload.users_id || null,
      };
      state.isLoggedIn = true;
      state.user = normalizedUser;
      state.email = normalizedUser.email;
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
      state.selectedAgeGroup = action.payload;
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
