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

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
	const dispatch = useDispatch();
	const isPaid = useSelector(state => state.user.isPaid);
	const selectedLevel = useSelector(state => state.user.selectedLevel);
	const [levelValue, setLevelValue] = useState(selectedLevel ? getBackendLevel(selectedLevel) : null);

	const handleTabPress = (route) => {
		
		navigation.navigate(route.name);
	};

	return (
		<View style={styles.tabBarContainer}>
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
						<Icon name={iconName} size={24} color={isFocused ? '#4CAF50' : 'gray'} />
						<Text style={[styles.tabLabel, { color: isFocused ? '#4CAF50' : 'gray' }]}>{label}</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

const getIconName = (routeName, focused) => {
	switch (routeName) {
		case 'Home': return focused ? 'home' : 'home-outline';
		case 'Setting': return focused ? 'settings' : 'settings-outline';
		case 'Payment': return focused ? 'wallet' : 'wallet-outline';
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
			<Tab.Screen name="Setting" component={SettingScreen} options={{ title: 'Setting' }} />
			<Tab.Screen name="Home" component={VideoListScreen} options={{ title: 'Home' }} />
			<Tab.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
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
});

export default BottomTabNavigator;
