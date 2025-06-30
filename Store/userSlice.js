import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	isLoggedIn: false,
	isPaid: false,
	user: {
		email: 'Guest User',
		username: '',
		dateOfBirth: '',
		address: '',
		phone: '',
		selectedAvatar: null,
		users_id: null,
		paid_categories: null
	},
	selectedLanguage: null,
	selectedAgeGroup: null,
	email: null,
	videos: [],
	paidAccess: [],
	lastPaidSelection: null,
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
				selectedAvatar: action.payload.selectedAvatar || action.payload.avatar || null,
				users_id: action.payload.users_id || null,
			};
			state.isLoggedIn = true;
			state.user = normalizedUser;
			state.email = normalizedUser.email;

			const hasValidPaidCategory =
				Array.isArray(action.payload.paid_categories) &&
				action.payload.paid_categories.some(item => item.language && item.level);

			state.isPaid = hasValidPaidCategory;
			

			// ✅ Set selectedLanguage and selectedAgeGroup from API
			state.selectedLanguage = action.payload.language || null;
			state.selectedAgeGroup = action.payload.age || null;
			// Optional: Load paid access if returned from backend
			state.paidAccess = action.payload.paidAccess || [];
			state.paid_categories = action.payload.paid_categories || null;
		},

		logout: (state) => {
			state.isLoggedIn = false;
			state.user = initialState.user;
			state.selectedLanguage = null;
			state.selectedAgeGroup = null;
			state.email = null;
			state.videos = [];
			state.paidAccess = [];
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
		setPaidStatus: (state, action) => {
			state.isPaid = action.payload;
		},
		// ✅ NEW: Add paid combination
		addPaidAccess: (state, action) => {
			const { language, ageGroup } = action.payload;
			const exists = state.paidAccess.some(
				item => item.language === language && item.ageGroup === ageGroup
			);
			if (!exists) {
				state.paidAccess.push({ language, ageGroup });
			}
			state.lastPaidSelection = { language, ageGroup }; // ✅ Save last paid combo
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
	setPaidStatus,
	addPaidAccess, 
	setLastPaidSelection
} = userSlice.actions;
export default userSlice.reducer;
