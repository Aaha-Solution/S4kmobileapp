import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TouchableWithoutFeedback, BackHandler } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import VideoListScreen from '../screens/VideoListScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SettingScreen from '../screens/SettingScreen';
import DropDownPicker from 'react-native-dropdown-picker';
import { useDispatch, useSelector } from 'react-redux';
import { setAllPaidAccess, setLevel } from '../Store/userSlice';
import { useFocusEffect } from '@react-navigation/native';
import { useRef } from 'react';
import Toast from 'react-native-toast-message';
import { getBackendLevel, getDisplayLevel } from '../utils/levelUtils';


const Tab = createBottomTabNavigator();
const CustomTabBar = ({ state, descriptors, navigation }) => {
	const dispatch = useDispatch();
	const isPaid = useSelector(state => state.user.isPaid);
	const selectedLevel = useSelector(state => state.user.selectedLevel);
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(selectedLevel);
	const [items, setItems] = useState([
		{ label: 'PreJunior (4-6 years)', value: 'PreJunior (4-6 years)' },
		{ label: 'Junior (7 & above years)', value: 'Junior (7 & above years)' },
	]);

	useEffect(() => {
		console.log("age", selectedLevel)
	}, [selectedLevel])

	const currentRouteRef = useRef(state.routes[state.index].name);

	// Update dropdown value when redux changes
	useEffect(() => {
		if (selectedLevel) {
			setValue(getDisplayLevel(selectedLevel));
		}
	}, [selectedLevel]);

	// Update route ref on focus change
	useFocusEffect(() => {
		currentRouteRef.current = state.routes[state.index].name;
	});
	// Handle dropdown age group selection
	const handleAgeSelect = (selectedValue) => {
		if (!selectedValue) return;

		try {
			const backendLevel = getBackendLevel(selectedValue); // convert for Redux + backend
			dispatch(setLevel(backendLevel)); // ✅ Store backend value
			setValue(selectedValue);
			                 // dropdown shows UI label
			setOpen(false);

			setTimeout(() => {
				navigation.navigate('Home');
			}, 100);
		} catch (error) {
			console.error('Error in handleAgeSelect:', error);
		}
	};

	// Close dropdown and optionally navigate to Home
	const handleOutsidePress = () => {
		if (open) {
			setOpen(false);
			if (currentRouteRef.current === 'level') {
				navigation.navigate('Home');
			}
		}
	};

	// Handle tab button press
	const handleTabPress = (route) => {
		if (!isPaid) {
			Toast.show({
				type: 'error',
				text1: ' ⚠ Please complete payment to proceed further',
				position: 'bottom',
				visibilityTime: 3000,
			});
			return;
		}

		handleOutsidePress();

		if (route.name === 'level') {
			setOpen(prev => !prev);
			// ✅ Don't navigate manually here
		} else {
			navigation.navigate(route.name);
		}
	};

	// Android back handler logic
	useEffect(() => {
		const backAction = () => {
			if (open) {
				setOpen(false);
				return true;
			}

			if (currentRouteRef.current === 'level') {
				navigation.navigate('Home');
				return true;
			}

			return false;
		};

		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

		return () => backHandler.remove();
	}, [open]);

	return (
		<TouchableWithoutFeedback onPress={handleOutsidePress}>
			<View style={styles.tabBarContainer}>
				{state.routes.map((route, index) => {
					const { options } = descriptors[route.key];
					const label = options.tabBarLabel ?? options.title ?? route.name;
					// 👇 Only "Age" is focused when dropdown is open
					const isFocused = open
						? route.name === 'level'
						: state.index === index;

					const iconName = getIconName(route.name, isFocused);

					if (route.name === 'level') {
						return (
							<View key={route.key} style={styles.ageTabContainer}>
								<TouchableOpacity
									onPress={() => handleTabPress(route)}
									style={styles.tabButton}
								>
									<Icon name={iconName} size={24} color={isFocused ? '#4CAF50' : 'gray'} />
									<Text style={[styles.tabLabel, { color: isFocused ? '#4CAF50' : 'gray' }]}>{label}</Text>
								</TouchableOpacity>
								{open && (
									<View style={styles.dropdownWrapper}>
										<DropDownPicker
											open={open}
											value={value}
											items={items}
											setOpen={setOpen}
											setValue={setValue}
											setItems={setItems}
											placeholder="Select Age Group"
											onChangeValue={(val) => handleAgeSelect(val)}
											onSelectItem={(item) => handleAgeSelect(item.value)}
											style={styles.dropdown}
											dropDownContainerStyle={styles.dropdownContainer}
											arrowIconStyle={{ tintColor: '#4CAF50' }}
											textStyle={{ fontSize: 14, fontWeight: '500', color: '#333' }}
											labelStyle={{ color: '#333' }}
											listItemLabelStyle={{ color: '#333' }}
											selectedItemContainerStyle={{
												backgroundColor: '#E8F5E9',
												borderLeftWidth: 4,
												borderLeftColor: '#4CAF50',
											}}
											selectedItemLabelStyle={{
												color: '#2E7D32',
												fontWeight: 'bold',
											}}
											tickIconStyle={{
												tintColor: '#4CAF50',
												width: 20,
												height: 20,
											}}
											zIndex={9999}
											listMode="SCROLLVIEW"
											scrollViewProps={{
												nestedScrollEnabled: true,
											}}
											disabled={!isPaid}
										/>
									</View>
								)}
							</View>
						);
					}

					return (
						<TouchableOpacity
							key={route.key}
							onPress={() => handleTabPress(route)}
							style={styles.tabButton}
						>
							<Icon name={iconName} size={24} color={isFocused ? '#4CAF50' : 'gray'} />
							<Text style={[styles.tabLabel, { color: isFocused ? '#4CAF50' : 'gray' }]}>{label}</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</TouchableWithoutFeedback>
	);
};


const getIconName = (routeName, focused) => {
	switch (routeName) {
		case 'Home':
			return focused ? 'home' : 'home-outline';
		case 'Setting':
			return focused ? 'settings' : 'settings-outline';
		case 'Payment':
			return focused ? 'wallet' : 'wallet-outline';
		case 'level':
			return focused ? 'people' : 'people-outline';
		default:
			return 'ellipse';
	}
};

const BottomTabNavigator = () => {

	return (
		<Tab.Navigator
			initialRouteName="Home"
			tabBar={(props) => <CustomTabBar {...props} />}
			screenOptions={{
				headerShown: true,
				headerTitleAlign: 'center',
				headertextColor: 'black',
				headerStyle: { backgroundColor: '#87CEEB' },
				headerTintColor: '#fff',
				headerTitleStyle: { fontWeight: 'bold' },
				headerTitleAllowFontScaling: true,
				fontFamily: 'Times New Roman',
			}}
		>
			<Tab.Screen
				name="Setting"
				component={SettingScreen}
				options={{
					title: 'Setting',
					headertextColor: 'black',
					headerTitleStyle: {
						color: 'black',          // ✅ this changes the header title text color
						fontWeight: 'bold',
						fontFamily: 'Times New Roman',
					},
				}}
			/>
			<Tab.Screen
				name="Home"
				component={VideoListScreen}
				options={{
					title: 'Home',
					headertextColor: 'black',
					headerStyle: { backgroundColor: '#87CEEB' },
					headerTintColor: '#fff',
					headerTitleStyle: { fontWeight: 'bold' },
					headerTitleStyle: {
						color: 'black',          // ✅ this changes the header title text color
						fontWeight: 'bold',
						fontFamily: 'Times New Roman',
					},

				}}
			/>
			<Tab.Screen
				name="Payment"
				component={PaymentScreen}
				options={{
					title: 'Payment',
					headertextColor: 'black',
					headerStyle: { backgroundColor: '#87CEEB' },
					headerTintColor: '#fff',
					headerTitleStyle: { fontWeight: 'bold' },
					headerTitleStyle: {
						color: 'black',          // ✅ this changes the header title text color
						fontWeight: 'bold',
						fontFamily: 'Times New Roman',
					},
				}}
			/>
			<Tab.Screen
				name="level"
				component={VideoListScreen}
				options={{
					title: 'Age',
					headertextColor: 'black',
				}}
			/>
		</Tab.Navigator>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	tabBarContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		backgroundColor: '#F0F8FF',
		height: 60,
		paddingTop: 5,
		paddingBottom: 5,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		position: 'relative',
		zIndex: 1,
	},
	ageTabContainer: {
		alignItems: 'center',
		position: 'relative',
		zIndex: 2,
	},
	tabButton: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 5,
	},
	tabLabel: {
		fontSize: 12,
		marginTop: 2,
	},
	dropdownWrapper: {
		position: 'absolute',
		top: -150,
		width: 180,
		left: -135,
		zIndex: 1000,
	},
	dropdown: {
		borderColor: 'rgba(76, 175, 80, 0.9)',
		borderWidth: 2,
		borderRadius: 10,
		width: 180,
	},
	dropdownContainer: {
		borderColor: 'rgba(76, 175, 80, 0.9)',
		borderWidth: 2,
		borderRadius: 10,
	},
});

export default BottomTabNavigator;
