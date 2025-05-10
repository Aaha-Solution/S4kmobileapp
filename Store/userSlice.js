import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  user: {
    firstname: 'Guest User',
    surename: '',
    dateOfBirth: '',
    address: '',
    phone:'',
  },
  selectedLanguage: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.user.firstname = action.payload;
    },
    selectLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = initialState.user;
      state.selectedLanguage = null;
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setProfile:(state,action)=>{
    state.user ={...state,...action.payload};
  }
}
});

export const { login, selectLanguage, logout, updateProfile,setProfile } = userSlice.actions;
export default userSlice.reducer;