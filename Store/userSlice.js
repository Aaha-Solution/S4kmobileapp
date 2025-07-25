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
	selectedLevel: null,
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

			const paidCategories = action.payload.paid_categories || [];
			const hasValidPaidCategory =
				Array.isArray(paidCategories) &&
				paidCategories.some(item => item.language && item.level);

			state.isPaid = hasValidPaidCategory;
			state.paidAccess = paidCategories.map(item => ({
				language: item.language,
				level: item.level,
			}));


			// ✅ Fallback to first paid combo if language/level not provided
			const fallback = paidCategories[0] || {};
			state.selectedLanguage = action.payload.language || fallback.language || null;
			state.selectedLevel = action.payload.level || fallback.level || null;

			state.paid_categories = paidCategories;
		},

		logout: (state) => {
			state.isLoggedIn = false;
			state.user = initialState.user;
			state.selectedLanguage = null;
			state.selectedLevel = null;
			state.email = null;
			state.videos = [];
			state.paidAccess = [];
		},
		setLanguage: (state, action) => {
			state.selectedLanguage = action.payload;
		},
		setLevel: (state, action) => {
			state.selectedLevel = action.payload;
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
		setAllPaidAccess: (state, action) => {
			state.paidAccess = action.payload;
		},
		// ✅ NEW: Add paid combination
		addPaidAccess: (state, action) => {
			const { language, level } = action.payload;
			const exists = state.paidAccess.some(
				item => item.language === language && item.level === level
			);
			if (!exists) {
				state.paidAccess.push({ language, level }); // ✅ store correctly
			}
			state.lastPaidSelection = { language, level }; // ✅ Save last paid combo
		}

	},
});

export const {
	login,
	logout,
	setLanguage,
	setLevel,
	setEmail,
	setProfile,
	updateProfile,
	setVideos,
	addVideo,
	setPaidStatus,
	addPaidAccess,
	setAllPaidAccess,
} = userSlice.actions;
export default userSlice.reducer;
