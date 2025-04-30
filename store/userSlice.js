import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  username: '',
  selectedLanguage: null,
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
  },
});

export const { login, selectLanguage, logout } = userSlice.actions;
export default userSlice.reducer;
