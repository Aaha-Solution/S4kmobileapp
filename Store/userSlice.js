import { createSlice } from '@reduxjs/toolkit';
import Video from 'react-native-video';

const initialState = {
	isLoggedIn: false,
	user: {
		username: 'Guest User',
		surename: '',
		dateOfBirth: '',
		address: '',
		phone: '',
		selectedAvatar: null
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
			state.isLoggedIn = true;
			state.user = { ...state.user, ...action.payload };
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
		logout: (state) => {
			state.isLoggedIn = false;
			state.user = initialState.user;
			state.selectedLanguage = null;
			state.selectedAgeGroup = null;
			state.email = null;
			state.videos = [];
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
	setLanguage, 
	setAgeGroup, 
	setEmail, 
	logout, 
	updateProfile,
	setProfile ,
	setVideos,     // <--- export
	addVideo       // <--- export
} = userSlice.actions;

export default userSlice.reducer;