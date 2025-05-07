import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  username: '',
  selectedLanguage: null,
  email: '',        
  otp: '', 
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.username = action.payload;
    },
    selectLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.username = '';
      state.selectedLanguage = null;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setOTP: (state, action) => {
      state.otp = action.payload;
    },
  },
});

export const { login, selectLanguage, logout, setEmail, setOTP } = userSlice.actions;
export default userSlice.reducer;
