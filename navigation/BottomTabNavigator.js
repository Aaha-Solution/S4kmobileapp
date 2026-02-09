import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	StyleSheet,
	Dimensions
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import VideoListScreen from '../screens/VideoListScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SettingScreen from '../screens/SettingScreen';

import { setLevel } from '../Store/userSlice';
import { getBackendLevel, getDisplayLevel } from '../utils/levelUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = Math.min(screenWidth, screenHeight) >= 600;
const scaleSize = (phoneSize, tabletSize) => (isTablet ? tabletSize : phoneSize);

export const ICON_SIZE = scaleSize(24, 32);
export const FONT_SIZE = scaleSize(12, 16);

const AGE_GROUP_ITEMS = [
	{ label: 'PreSchool (4-6 years)', value: 'PreSchool (4-6 years)' },
	{ label: 'Junior (7 & above years)', value: 'Junior (7 & above years)' },
];

const CustomTabBar = ({ state, descriptors, navigation, onOpenLevel }) => {
	const insets = useSafeAreaInsets();
	const isPaid = useSelector(state => state.user.isPaid);

	const handleTabPress = (route) => {
		if (route.name === 'level') {
			if (!isPaid) return;
			onOpenLevel?.();
		} else {
			navigation.navigate(route.name);
		}
	};

	return (
		<View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const label = options.tabBarLabel ?? options.title ?? route.name;
				const isFocused = state.index === index;

				const iconName = getIconName(route.name, isFocused);

				return (
					<TouchableOpacity
						key={route.key}
						onPress={() => handleTabPress(route)}
						style={styles.tabButton}
					>
						<Icon name={iconName} size={ICON_SIZE} color={isFocused ? '#4CAF50' : 'gray'} />
						<Text style={[styles.tabLabel, { color: isFocused ? '#4CAF50' : 'gray' }]}>
							{label}
						</Text>
					</TouchableOpacity>
				);

				// return (
				// 	<TouchableOpacity
				// 		key={route.key}
				// 		onPress={() => handleTabPress(route)}
				// 		style={styles.tabButton}
				// 	>
				// 		<Icon name={iconName} size={ICON_SIZE} color={isFocused ? '#4CAF50' : 'gray'} />
				// 		<Text style={[styles.tabLabel, { color: isFocused ? '#4CAF50' : 'gray' }]}>{label}</Text>
				// 	</TouchableOpacity>
				// );
			})}
		</View>
	);
};

const getIconName = (routeName, focused) => {
	switch (routeName) {
		case 'Home': return focused ? 'home' : 'home-outline';
		case 'Setting': return focused ? 'settings' : 'settings-outline';
		case 'Payment': return focused ? 'wallet' : 'wallet-outline';
		case 'level': return focused ? 'people' : 'people-outline';
		default: return 'help-circle-outline';
	}
};

const BottomTabNavigator = () => {
	const navigation = useNavigation();
	const dispatch = useDispatch();
	const selectedLevel = useSelector(state => state.user.selectedLevel);
	const [value, setValue] = useState(getDisplayLevel(selectedLevel));
	const [items] = useState(AGE_GROUP_ITEMS);

	// Ref for BottomSheetModal
	const bottomSheetModalRef = useRef(null);

	// Variables for snap points
	const snapPoints = React.useMemo(() => ['25%'], []);

	useEffect(() => {
		if (selectedLevel) {
			setValue(getDisplayLevel(selectedLevel));
		}
	}, [selectedLevel]);

	const handleAgeSelect = (selectedDisplayValue) => {
		if (!selectedDisplayValue) return;
		try {
			const backendLevel = getBackendLevel(selectedDisplayValue);
			dispatch(setLevel(backendLevel));
			setValue(selectedDisplayValue);
			bottomSheetModalRef.current?.dismiss();

			navigation.navigate('MainTabs', { screen: 'Home' });
		} catch (error) {
			//console.error('Error in handleAgeSelect:', error);
		}
	};

	const renderBackdrop = React.useCallback(
		(props) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				onPress={() => bottomSheetModalRef.current?.dismiss()}
			/>
		),
		[]
	);

	const onOpenLevel = () => {
		bottomSheetModalRef.current?.present();
	};

	return (
		<View style={{ flex: 1 }}>
			<Tab.Navigator
				initialRouteName="Home"
				tabBar={(props) => <CustomTabBar {...props} onOpenLevel={onOpenLevel} />}
				screenOptions={{
					headerShown: true,
					headerTitleAlign: 'center',
					headerStyle: { backgroundColor: '#87CEEB' },
					headerTintColor: '#fff',
					headerTitleStyle: {
						color: '#4B0082',
						fontWeight: 'bold',
						fontFamily: 'Times New Roman',
					},
				}}
			>
				<Tab.Screen name="Home" component={VideoListScreen} options={{ title: 'Home' }} />
				<Tab.Screen name="level" component={VideoListScreen} options={{ title: 'Age' }} listeners={{  tabPress: e => e.preventDefault(),}}/>
				<Tab.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
				<Tab.Screen name="Setting" component={SettingScreen} options={{ title: 'Settings' }} />
			</Tab.Navigator>

			<BottomSheetModal
				ref={bottomSheetModalRef}
				index={0}
				snapPoints={snapPoints}
				backdropComponent={renderBackdrop}
				backgroundStyle={{ backgroundColor: '#F0F8FF' }}
			>
				<BottomSheetView style={styles.contentContainer}>
					<Text style={styles.sheetTitle}>Select Age Group</Text>
					{items.map((item) => (
						<TouchableOpacity
							key={item.value}
							style={[
								styles.sheetItem,
								value === item.value && styles.selectedSheetItem
							]}
							onPress={() => handleAgeSelect(item.value)}
						>
							<Text style={[
								styles.sheetItemText,
								value === item.value && styles.selectedSheetItemText
							]}>
								{item.label}
							</Text>
							{value === item.value && (
								<Icon name="checkmark-circle" size={20} color="#4CAF50" />
							)}
						</TouchableOpacity>
					))}
				</BottomSheetView>
			</BottomSheetModal>
		</View>
	);
};

const styles = StyleSheet.create({
	tabBarContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: '#F0F8FF',
		height: scaleSize(70, 90),
		paddingVertical: 8,

		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		// position: 'relative',
		// zIndex: 1,
		// overflow: 'visible',   // <-- REQUIRED ON ANDROID 15
		elevation: 10,         // <-- REQUIRED FOR zIndex TO WORK
	},
	// ageTabContainer: {
	// 	alignItems: 'center',
	// 	position: 'relative',
	// 	justifyContent: 'center',
	// 	zIndex: 2,
	// 	overflow: 'visible',   // <-- prevents clipping
	// 	elevation: 20,
	// 	paddingHorizontal: screenWidth * 0.02,
	// 	paddingVertical: screenHeight * 0.01,

	// },

	tabButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},


	tabLabel: {
		fontSize: FONT_SIZE,
		marginTop: 2,
	},

	contentContainer: {
		flex: 1,
		padding: 20,
	},
	sheetTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#4B0082',
		marginBottom: 20,
		alignSelf: 'center',
	},
	sheetItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 15,
		paddingHorizontal: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	selectedSheetItem: {
		backgroundColor: '#E8F5E9',
		borderRadius: 10,
		borderBottomWidth: 0,
	},
	sheetItemText: {
		fontSize: 16,
		color: '#333',
	},
	selectedSheetItemText: {
		color: '#2E7D32',
		fontWeight: 'bold',
	},
});
export default BottomTabNavigator;