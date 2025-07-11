import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	TouchableOpacity,
	Text,
	StyleSheet,
	TouchableWithoutFeedback,
	BackHandler
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import VideoListScreen from '../screens/VideoListScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SettingScreen from '../screens/SettingScreen';
import { setLevel } from '../Store/userSlice';
import { getBackendLevel, getDisplayLevel } from '../utils/levelUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Tab = createBottomTabNavigator();

const AGE_GROUP_ITEMS = [
	{ label: 'PreSchool (4-6 years)', value: 'PreSchool (4-6 years)' },
	{ label: 'Junior (7 & above years)', value: 'Junior (7 & above years)' },
];

const CustomTabBar = ({ state, descriptors, navigation }) => {
	 const insets = useSafeAreaInsets(); 
	const dispatch = useDispatch();
	const isPaid = useSelector(state => state.user.isPaid);
	const selectedLevel = useSelector(state => state.user.selectedLevel);
	console.log("level", selectedLevel)
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(getDisplayLevel(selectedLevel));
	console.log("value", value)
	const [items, setItems] = useState(AGE_GROUP_ITEMS);
	const currentRouteRef = useRef(state.routes[state.index].name);

	useEffect(() => {
		if (selectedLevel) {
			setValue(getDisplayLevel(selectedLevel));
		}
	}, [selectedLevel]);

	useFocusEffect(() => {
		currentRouteRef.current = state.routes[state.index].name;
	});

	const handleAgeSelect = (selectedDisplayValue) => {
		if (!selectedDisplayValue) return;
		try {
			const backendLevel = getBackendLevel(selectedDisplayValue);
			dispatch(setLevel(backendLevel));
			setValue(selectedDisplayValue);
			setOpen(false);

			if (currentRouteRef.current !== 'Home') {
				navigation.navigate('Home');
			}
		} catch (error) {
			console.error('Error in handleAgeSelect:', error);
		}
	};

	const handleOutsidePress = () => {
		if (open) {
			setOpen(false);
			if (currentRouteRef.current === 'level') {
				navigation.navigate('Home');
			}
		}
	};

	const handleTabPress = (route) => {
		handleOutsidePress();
		if (route.name === 'level') {
			setOpen(prev => !prev);
		} else {
			navigation.navigate(route.name);
		}
	};

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
			<View  style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
				{state.routes.map((route, index) => {
					const { options } = descriptors[route.key];
					const label = options.tabBarLabel ?? options.title ?? route.name;
					const isFocused = open
						? route.name === 'level'
						: state.index === index;

					const iconName = getIconName(route.name, isFocused);

					if (route.name === 'level') {
						return (
							<View key={route.key} style={styles.ageTabContainer}>
								<TouchableOpacity onPress={() => handleTabPress(route)} style={styles.tabButton}>
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
											scrollViewProps={{ nestedScrollEnabled: true }}
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
		case 'Home': return focused ? 'home' : 'home-outline';
		case 'Setting': return focused ? 'settings' : 'settings-outline';
		case 'Payment': return focused ? 'wallet' : 'wallet-outline';
		case 'level': return focused ? 'people' : 'people-outline';
		default: return 'help-circle-outline';
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
				headerStyle: { backgroundColor: '#87CEEB' },
				headerTintColor: '#fff',
				headerTitleStyle: {
					color: 'black',
					fontWeight: 'bold',
					fontFamily: 'Times New Roman',
				},
			}}
		>
			<Tab.Screen name="Home" component={VideoListScreen} options={{ title: 'Home' }} />
			<Tab.Screen name="level" component={VideoListScreen} options={{ title: 'Age' }} />
			<Tab.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
			<Tab.Screen name="Setting" component={SettingScreen} options={{ title: 'Setting' }} />
		</Tab.Navigator>
	);
};

const styles = StyleSheet.create({
	tabBarContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		backgroundColor: '#F0F8FF',
		height: 60,
		paddingVertical: 5,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		position: 'relative',
		zIndex: 1,
		marginBottom: dynamicMargin,
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
		height: 0,
		padding: 0,
		margin: 0,
		borderWidth: 0,
		position: 'absolute',
		top: -9999,
		left: -9999,
		opacity: 0,
		borderRadius:5
	},
	dropdownContainer: {
		borderColor: 'rgba(76, 175, 80, 0.9)',
		borderWidth: 2,
		borderRadius: 3,
		marginLeft: 75,
	},
});

export default BottomTabNavigator;