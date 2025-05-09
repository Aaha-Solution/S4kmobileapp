import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  username: '',
  selectedLanguage: null,
  selectedAgeGroup: null,
  email: '',
  otp: '',
  purchasedVideos: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.username = action.payload;
    },
    setLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    setAgeGroup: (state, action) => {
      state.selectedAgeGroup = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.username = '';
      state.selectedLanguage = null;
      state.selectedAgeGroup = null;
      state.purchasedVideos = [];
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setOTP: (state, action) => {
      state.otp = action.payload;
    },
    addPurchasedVideo: (state, action) => {
      if (!state.purchasedVideos.includes(action.payload)) {
        state.purchasedVideos.push(action.payload);
      }
    },
    resetSelections: (state) => {
      state.selectedLanguage = null;
      state.selectedAgeGroup = null;
    },
  },
});

export const {
  login,
  setLanguage,
  setAgeGroup,
  logout,
  setEmail,
  setOTP,
  addPurchasedVideo,
  resetSelections,
} = userSlice.actions;

export default userSlice.reducer;
