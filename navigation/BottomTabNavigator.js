import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import VideoListScreen from '../screens/VideoListScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SettingScreen from '../screens/SettingScreen';
import DropDownPicker from 'react-native-dropdown-picker';
import { useDispatch, useSelector } from 'react-redux';
import { setAgeGroup } from '../Store/userSlice';

const Tab = createBottomTabNavigator();
   
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const dispatch = useDispatch();
  const selectedAgeGroup = useSelector(state => state.user.selectedAgeGroup);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedAgeGroup);
  const [items, setItems] = useState([
    { label: 'Pre-Prep (4-6 years)', value: 'Pre-Prep (4-6 years)' },
    { label: 'Junior (7-10 years)', value: 'Junior (7-10 years)' },
  ]);

  useEffect(() => {
    setValue(selectedAgeGroup);
  }, [selectedAgeGroup]);

  const handleAgeSelect = (selectedValue) => {
    if (!selectedValue) return;
    
    try {
      dispatch(setAgeGroup(selectedValue));
      setValue(selectedValue);
      setOpen(false);
      
      setTimeout(() => {
        navigation.navigate('Home');
      }, 100);
    } catch (error) {
      console.error('Error in handleAgeSelect:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => setOpen(false)}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;
          const iconName = getIconName(route.name, isFocused);

          if (route.name === 'Age') {
            return (
              <View key={route.key} style={styles.ageTabContainer}>
                <TouchableOpacity
                  onPress={() => setOpen(!open)}
                  style={styles.tabButton}
                >
                  <Icon name={iconName} size={24} color={isFocused ? '#8A2BE2' : 'gray'} />
                  <Text style={[styles.tabLabel, { color: isFocused ? '#8A2BE2' : 'gray' }]}>{label}</Text>
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
                      onSelectItem={(item) => handleAgeSelect(item.value)}
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownContainer}
                      zIndex={9999}
                      listMode="SCROLLVIEW"
                      scrollViewProps={{
                        nestedScrollEnabled: true,
                      }}
                    />
                  </View>
                )}
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabButton}
            >
              <Icon name={iconName} size={24} color={isFocused ? '#8A2BE2' : 'gray'} />
              <Text style={[styles.tabLabel, { color: isFocused ? '#8A2BE2' : 'gray' }]}>{label}</Text>
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
    case 'Age':
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
        headerStyle: { backgroundColor: '#b388eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{ title: 'Setting' }}
      />
      <Tab.Screen
        name="Home"
        component={VideoListScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
      <Tab.Screen
        name="Age"
        component={VideoListScreen}
        options={{ title: 'Age' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    height: 60,
    paddingTop: 5,
    paddingBottom: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  ageTabContainer: {
    alignItems: 'center',
    position: 'relative',
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
    borderColor: '#E0B0FF',
    borderWidth: 2,
    borderRadius: 10,
    width: 180,
  },
  dropdownContainer: {
    borderColor: '#E0B0FF',
    borderWidth: 2,
    borderRadius: 10,
  },
});

export default BottomTabNavigator;
