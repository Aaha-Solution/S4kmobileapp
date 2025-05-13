import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  user: {
    firstname: 'Guest User',
    surename: '',
    dateOfBirth: '',
    address: '',
  },
  selectedLanguage: null,
  selectedAgeGroup: null,
  email: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.user = { ...state.user, ...action.payload };
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
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = initialState.user;
      state.selectedLanguage = null;
      state.selectedAgeGroup = null;
      state.email = null;
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { login, setLanguage, setAgeGroup, setEmail, logout, updateProfile } = userSlice.actions;
export default userSlice.reducer;