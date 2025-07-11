import React, { useEffect, useState } from 'react';

import {

  View, Text, StyleSheet, FlatList, ActivityIndicator,

  TextInput, TouchableOpacity, Alert, StatusBar

} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import LinearGradient from 'react-native-linear-gradient';

import { useNavigation } from '@react-navigation/native';

import DropDownPicker from 'react-native-dropdown-picker';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
 
const AdminPannel = () => {

  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState([]);

  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [languageOpen, setLanguageOpen] = useState(false);

  const [levelOpen, setLevelOpen] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const [selectedLevel, setSelectedLevel] = useState(null);

  const pageSize = 10;

  const navigation = useNavigation();
 
  const fetchUsers = async () => {

    try {

      const token = await AsyncStorage.getItem('token');

      if (!token) {

        Alert.alert('Unauthorized', 'No token found. Please log in again.');

        setLoading(false);

        return;

      }
 
      const response = await fetch(

        'https://smile4kidsbackend-production-2970.up.railway.app/admin/users-with-purchases',

        {

          method: 'GET',

          headers: {

            Authorization: `Bearer ${token}`,

            'Content-Type': 'application/json',

          },

        }

      );
 
      const data = await response.json();

      if (Array.isArray(data)) {

        setUsers(data);

        setFiltered(data.slice(0, pageSize));

      } else {

        Alert.alert('Error', data.message || 'Invalid response from server');

      }

    } catch (error) {

      Alert.alert('Error', 'Failed to fetch user data.');

    } finally {

      setLoading(false);

    }

  };
 
  useEffect(() => {

    fetchUsers();

  }, []);
 
  const logout = async () => {

    Alert.alert('Logout', 'Are you sure you want to logout?', [

      { text: 'Cancel', style: 'cancel' },

      {

        text: 'Logout',

        style: 'destructive',

        onPress: async () => {

          await AsyncStorage.clear();

          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

        },

      },

    ]);

  };
 
  const handleSearch = (text) => {

    setSearch(text);

    applyFilters(text, selectedLanguage, selectedLevel);

  };
 
  const applyFilters = (searchText = search, lang = selectedLanguage, level = selectedLevel) => {

    let result = [...users];

    if (lang) result = result.filter(u => u.language === lang);

    if (level) result = result.filter(u => u.level === level);

    if (searchText)

      result = result.filter(

        u =>

          u?.username?.toLowerCase().includes(searchText.toLowerCase()) ||

          u?.email_id?.toLowerCase().includes(searchText.toLowerCase())

      );

    setFiltered(result.slice(0, pageSize));

    setPage(1);

  };
 
  const clearFilters = () => {

    setSearch('');

    setSelectedLanguage(null);

    setSelectedLevel(null);

    setFiltered(users.slice(0, pageSize));

    setPage(1);

  };
 
  const loadMore = () => {

    const nextPage = page + 1;

    const nextUsers = users.slice(0, nextPage * pageSize);

    setFiltered(nextUsers);

    setPage(nextPage);

  };
 
  const renderUser = ({ item, index }) => (
<View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
<Text style={[styles.cell, styles.name]}>{item.username || 'N/A'}</Text>
<Text style={[styles.cell, styles.email]}>{item.email_id || 'N/A'}</Text>
<Text style={[styles.cell, styles.lang]}>{item.language || 'N/A'}</Text>
<Text style={[styles.cell, styles.level]}>{item.level || 'N/A'}</Text>
</View>

  );
 
  const TableHeader = () => (
<View style={styles.tableHeader}>
<Text style={[styles.headerCell, styles.name]}>Name</Text>
<Text style={[styles.headerCell, styles.email]}>Email</Text>
<Text style={[styles.headerCell, styles.lang]}>Language</Text>
<Text style={[styles.headerCell, styles.level]}>Level</Text>
</View>

  );
 
  return (
<SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
<StatusBar barStyle="dark-content" backgroundColor="#87CEEB" />
<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>

        {/* Header with Logout */}
<View style={styles.header}>
<Text style={styles.title}>Admin Panel</Text>
<TouchableOpacity style={styles.logoutBtn} onPress={logout}>
<Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>
</View>
 
        {/* Search Input */}
<TextInput

          placeholder="Search by name or email"

          value={search}

          onChangeText={handleSearch}

          placeholderTextColor="#666"

          style={styles.searchInput}

        />
 
        {/* Dropdown Filters */}
<View style={styles.dropdownContainer}>
<DropDownPicker

            open={languageOpen}

            setOpen={setLanguageOpen}

            value={selectedLanguage}

            setValue={setSelectedLanguage}

            items={[

              { label: 'Hindi', value: 'Hindi' },

              { label: 'Panjabi', value: 'Panjabi' },

              { label: 'Gujarati', value: 'Gujarati' },

            ]}

            placeholder="Language"

            onChangeValue={() => applyFilters()}

            style={styles.dropdown}

            dropDownContainerStyle={styles.dropdownList}

            zIndex={3000}

          />
<DropDownPicker

            open={levelOpen}

            setOpen={setLevelOpen}

            value={selectedLevel}

            setValue={setSelectedLevel}

            items={[

              { label: 'Pre_Junior', value: 'Pre_Junior' },

              { label: 'Junior', value: 'Junior' },

            ]}

            placeholder="Level"

            onChangeValue={() => applyFilters()}

            style={styles.dropdown}

            dropDownContainerStyle={styles.dropdownList}

            zIndex={2000}

          />
</View>
 
        {/* Table List */}

        {loading ? (
<ActivityIndicator size="large" color="#007BFF" />

        ) : (
<View style={styles.tableContainer}>
<FlatList

              data={filtered}

              renderItem={renderUser}

              keyExtractor={(item, index) => index.toString()}

              ListHeaderComponent={TableHeader}

              contentContainerStyle={styles.listContent}

              showsVerticalScrollIndicator={false}

            />
</View>

        )}
 
        {/* Load More */}

        {filtered.length < users.length && !loading && (
<TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
<Text style={styles.buttonText}>

              Load More ({users.length - filtered.length} remaining)
</Text>
</TouchableOpacity>

        )}
</LinearGradient>
</SafeAreaView>

  );

};
 
const styles = StyleSheet.create({

  safeArea: { flex: 1, backgroundColor: '#87CEEB' },

  container: { flex: 1, paddingHorizontal: 16 },

  header: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginVertical: 12,

  },

  title: { fontSize: 20, fontWeight: '700', color: '#1F1D62' },

  logoutBtn: {

    backgroundColor: '#FF8C00',

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 6,

  },

  logoutText: { color: 'white', fontWeight: '600' },

  searchInput: {

    backgroundColor: 'white',

    borderRadius: 6,

    paddingHorizontal: 12,

    paddingVertical: 10,

    fontSize: 14,

    marginBottom: 10,

    borderWidth: 1,

    borderColor: '#ccc',

  },

  dropdownContainer: { flexDirection: 'row', gap: 8, zIndex: 4000, marginBottom: 12 },

  dropdown: {

    flex: 1,

    backgroundColor: 'white',

    borderColor: '#ccc',

  },

  dropdownList: {

    backgroundColor: '#fff',

    borderColor: '#ccc',

    zIndex: 1000,

  },

  tableContainer: {

    backgroundColor: '#fff',

    borderRadius: 6,

    flex: 1,

  },

  tableHeader: {

    flexDirection: 'row',

    backgroundColor: '#4CAF50',

    paddingVertical: 10,

    paddingHorizontal: 8,

    borderTopLeftRadius: 6,

    borderTopRightRadius: 6,

  },

  headerCell: {

    color: '#fff',

    fontWeight: '700',

    fontSize: 13,

    textAlign: 'center',

  },

  row: {

    flexDirection: 'row',

    paddingVertical: 10,

    paddingHorizontal: 8,

    borderBottomWidth: 1,

    borderBottomColor: '#eee',

  },

  evenRow: { backgroundColor: '#f9f9f9' },

  oddRow: { backgroundColor: '#fff' },

  cell: {

    fontSize: 13,

    color: '#333',

    textAlign: 'center',

  },

  name: { flex: 1.5 },

  email: { flex: 2.5 },

  lang: { flex: 1.2 },

  level: { flex: 1.2 },

  buttonText: {

    fontSize: 13,

    color: '#fff',

    fontWeight: '600',

  },

  loadMoreBtn: {

    backgroundColor: '#6c757d',

    padding: 10,

    alignSelf: 'center',

    borderRadius: 6,

    marginTop: 10,

    marginBottom: 20,

  },

  listContent: { paddingBottom: 10 },

});
 
export default AdminPannel;

 