import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TextInput, TouchableOpacity, Alert, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const AdminPannel = () => {
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [token, setToken] = useState(null);

  const pageSize = 10;
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const languages = ['Hindi', 'Panjabi', 'Gujarati'];
  const levels = ['Pre_Junior', 'Junior'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
      if (!storedToken) {
        Alert.alert('Error', 'Token not found. Please login again.');
        return;
      }

      const res = await fetch(
        'https://smile4kidsbackend-production-2970.up.railway.app/admin/users-with-purchases',
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );

      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        Alert.alert('Session Expired', 'Please login again.');
        await AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: 'AdminLogin' }] });
        return;
      }

      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => new Date(b.last_login) - new Date(a.last_login));
        setUsers(sorted);
        setFiltered(sorted.slice(0, pageSize));
      } else {
        Alert.alert('Error', 'Unexpected response from server.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Alert.alert('Logout', 'Confirm logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: 'AdminLogin' }] });
        },
      },
    ]);
  };

  const applyFilters = useCallback(() => {
    let result = [...users];
    if (selectedLanguage) result = result.filter(u => u.language === selectedLanguage);
    if (selectedLevel) result = result.filter(u => u.level === selectedLevel);
    if (search) {
      result = result.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email_id?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result.slice(0, pageSize));
    setPage(1);
  }, [users, search, selectedLanguage, selectedLevel]);

  const handleSearch = (text) => {
    setSearch(text);
    setTimeout(() => {
      let result = [...users];
      if (selectedLanguage) result = result.filter(u => u.language === selectedLanguage);
      if (selectedLevel) result = result.filter(u => u.level === selectedLevel);
      if (text) {
        result = result.filter(u =>
          u.username?.toLowerCase().includes(text.toLowerCase()) ||
          u.email_id?.toLowerCase().includes(text.toLowerCase())
        );
      }
      setFiltered(result.slice(0, pageSize));
      setPage(1);
    }, 300);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedLanguage('');
    setSelectedLevel('');
    setFiltered(users.slice(0, pageSize));
    setPage(1);
    setShowFilters(false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const filteredUsers = getFilteredUsers();
    setFiltered(filteredUsers.slice(0, nextPage * pageSize));
    setPage(nextPage);
  };

  const getFilteredUsers = () => {
    let result = [...users];
    if (selectedLanguage) result = result.filter(u => u.language === selectedLanguage);
    if (selectedLevel) result = result.filter(u => u.level === selectedLevel);
    if (search) {
      result = result.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email_id?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, index % 2 ? styles.oddRow : styles.evenRow]}>
      <Text style={[styles.cell, styles.name, { color: '#000' }]} numberOfLines={1}>{item.username}</Text>
      <Text style={[styles.cell, styles.email, { color: '#000' }]} numberOfLines={1}>{item.email_id}</Text>
      <Text style={[styles.cell, styles.lang, { color: '#000' }]}>{item.language}</Text>
      <Text style={[styles.cell, styles.level, { color: '#000' }]}>{item.level === 'Pre_Junior' ? 'Preschool' : item.level}</Text>
    </View>
  );

  const FilterButton = ({ title, options, selected, onSelect }) => (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{title}</Text>
      <View style={styles.filterOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.filterOption, selected === option && styles.selectedOption]}
            onPress={() => onSelect(selected === option ? '' : option)}
          >
            <Text style={[styles.filterOptionText, selected === option && styles.selectedOptionText]}>
              {option === 'Pre_Junior' ? 'Preschool' : option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const totalFilteredUsers = getFilteredUsers().length;

  return (
    <LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#87CEEB" />

        <View style={styles.logoutRow}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearch(!showSearch)}>
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Admin Panel</Text>

          <TouchableOpacity style={styles.iconButton} onPress={() => setShowFilters(!showFilters)}>
            <Icon name="filter" size={20} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Search by name or email..."
              value={search}
              onChangeText={handleSearch}
              style={styles.searchInput}
              placeholderTextColor="#6b7280"
            />
            <TouchableOpacity onPress={() => {
              setSearch('');
              setFiltered(users.slice(0, pageSize));
              setShowSearch(false);
            }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <FilterButton title="Language" options={languages} selected={selectedLanguage} onSelect={setSelectedLanguage} />
            <FilterButton title="Ages" options={levels} selected={selectedLevel} onSelect={setSelectedLevel} />
            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                <Text style={styles.btnText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                <Text style={styles.btnText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Table */}
        <View style={styles.tableContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#4682B4" style={{ marginTop: 50 }} />
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.name]}>Name</Text>
                <Text style={[styles.headerCell, styles.email]}>Email</Text>
                <Text style={[styles.headerCell, styles.lang]}>Language</Text>
                <Text style={[styles.headerCell, styles.level]}>Ages</Text>
              </View>

              <FlatList
                data={filtered}
                keyExtractor={(_, i) => i.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#4682B4' }}>No users found</Text>
                  </View>
                }
              />

              {filtered.length < totalFilteredUsers && (
                <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                  <Text style={styles.loadMoreText}>Load More</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 16 },
  logoutRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  logoutBtn: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 8,
    borderBottomColor: '#fff',

  },
  iconButton: {
    padding: 6,
    backgroundColor: '#dbe1e3',
    borderRadius: 6,
  },
  iconText: { fontSize: 18 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color:  '#4B0082',
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  closeText: {
    fontSize: 18,
    color: '#ef4444',
    marginLeft: 10,
  },
  filterPanel: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterGroup: { marginBottom: 12 },
  filterLabel: { marginBottom: 8, fontWeight: '600', color: '#1f2937' },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterOption: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedOption: { backgroundColor: 'rgba(76, 175, 80, 0.9)' },
  filterOptionText: { color: '#fff' },
  selectedOptionText: { color: '#fff' },
  filterActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  applyBtn: {
    flex: 1,
    backgroundColor: '#FF8C00',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    color: '#fff',
  },
  clearBtn: {
    flex: 1,
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',

  },
  btnText: { fontWeight: '600', color: '#fff' },
  tableContainer: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    paddingBottom: 10,

  },
  tableHeader: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#D6EAF8',
    borderBottomWidth: 1,
    borderBottomColor: '#ADD8E6',
  },
  headerCell: {
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ADD8E6',
  },
  evenRow: { backgroundColor: '#ffffff' },
  oddRow: { backgroundColor: '#F0F8FF' },
  cell: { flex: 1, textAlign: 'center' },
  name: { flex: 1.5 },
  email: { flex: 2 },
  lang: { flex: 1 },
  level: { flex: 1 },
  loadMoreBtn: {
    backgroundColor: '#ADD8E6',
    padding: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#1f2937',
    fontWeight: '600',
  },
});

export default AdminPannel;
