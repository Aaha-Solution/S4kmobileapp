import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotificationScreen = () => {
  const [statusBar, setStatusBar] = useState(true);
  const [lockScreen, setLockScreen] = useState(false);
  const [popUps, setPopUps] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const items = [
    { label: 'Status bar', state: statusBar, setState: setStatusBar },
    { label: 'On lock screen', state: lockScreen, setState: setLockScreen },
    { label: 'Pop ups', state: popUps, setState: setPopUps },
    { label: 'Weekly Digest', state: weeklyDigest, setState: setWeeklyDigest },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7F00FF', '#E100FF']} style={styles.header}>
        <Ionicons name="notifications" size={28} color="#fff" />
        <Text style={styles.headerText}>NOTIFICATIONS</Text>
      </LinearGradient>

      <View style={styles.content}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <Switch
              trackColor={{ false: '#ccc', true: '#8A2BE2' }}
              thumbColor="#fff"
              ios_backgroundColor="#ccc"
              onValueChange={item.setState}
              value={item.state}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    //padding: 20,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
});

export default NotificationScreen;
