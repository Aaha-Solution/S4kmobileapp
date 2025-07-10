import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TextInput, TouchableOpacity, Alert, StatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AdminPannel = () => {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
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
        'https://smile4kidsbackend-production-159e.up.railway.app/admin/users-with-purchases',
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
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }, 100);
          },
        },
      ]
    );
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filteredUsers = users.filter(u =>
      u?.username?.toLowerCase().includes(text.toLowerCase()) ||
      u?.email_id?.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredUsers.slice(0, pageSize));
    setPage(1);
  };

  const applyFilters = () => {
    let result = [...users];
    if (languageFilter) result = result.filter(u => u.language === languageFilter);
    if (levelFilter) result = result.filter(u => u.level === levelFilter);
    if (search) result = result.filter(u =>
      u?.username?.toLowerCase().includes(search.toLowerCase()) ||
      u?.email_id?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result.slice(0, pageSize));
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setLanguageFilter('');
    setLevelFilter('');
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
      <Text style={[styles.cell, styles.name]} numberOfLines={1}>
        {item.username || 'N/A'}
      </Text>
      <Text style={[styles.cell, styles.email]} numberOfLines={1}>
        {item.email_id || 'N/A'}
      </Text>
      <Text style={[styles.cell, styles.lang]} numberOfLines={1}>
        {item.language || 'N/A'}
      </Text>
      <Text style={[styles.cell, styles.level]} numberOfLines={1}>
        {item.level || 'N/A'}
      </Text>
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
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search by name or email"
            style={styles.searchInput}
            value={search}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <TextInput
              placeholder="Language"
              style={styles.filterInput}
              value={languageFilter}
              onChangeText={setLanguageFilter}
              placeholderTextColor="#666"
            />
            <TextInput
              placeholder="Level"
              style={styles.filterInput}
              value={levelFilter}
              onChangeText={setLevelFilter}
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.filterButtonRow}>
            <TouchableOpacity style={styles.filterButton} onPress={applyFilters}>
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : (
          <View style={styles.tableContainer}>
            <FlatList
              data={filtered}
              keyExtractor={(item, index) => {
                const id = item?.users_id || item?.user?.users_id || `id_${index}`;
                const email = item?.email_id || item?.user?.email_id || `email_${index}`;
                return `${id}_${email}_${Date.now()}_${index}`;
              }}
              renderItem={renderUser}
              ListHeaderComponent={TableHeader}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}

        {/* Load More */}
        {filtered.length < users.length && !loading && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
            <Text style={styles.buttonText}>Load More ({users.length - filtered.length} remaining)</Text>
          </TouchableOpacity>
        )}

        {/* Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            Showing {filtered.length} of {users.length} users
          </Text>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F1D62',
    textAlign: 'center',
    width: '100%',
  },
  logoutBtn: {
    backgroundColor: '#FF8C00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    elevation: 1,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 14,
  },
  filterButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  evenRow: {
    backgroundColor: '#f8f9fa',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  cell: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  name: {
    flex: 1.5,
    fontWeight: '500',
  },
  email: {
    flex: 2.5,
  },
  lang: {
    flex: 1.2,
  },
  level: {
    flex: 1.2,
  },
  loadMoreBtn: {
    backgroundColor: '#6c757d',
    padding: 12,
    marginVertical: 8,
    alignSelf: 'center',
    borderRadius: 6,
    minWidth: 150,
    alignItems: 'center',
  },
  countContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  countText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  logoutContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
});

export default AdminPannel;
