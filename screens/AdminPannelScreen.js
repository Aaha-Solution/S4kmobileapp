import React, { useEffect, useState, useCallback } from 'react';
import {
	View, Text, StyleSheet, FlatList, ActivityIndicator,
	TextInput, TouchableOpacity, Alert, StatusBar, Dimensions,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAlert from '../component/CustomAlertMessage';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const AdminPannel = () => {
	const navigation = useNavigation();
	const user_id = useSelector(state => state.user.user_id);

	const [users, setUsers] = useState([]);
	const [filtered, setFiltered] = useState([]);
	const [search, setSearch] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(12);
	const [loading, setLoading] = useState(true);
	const [showFilters, setShowFilters] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [token, setToken] = useState(null);
	const [showalert, setShowAlert] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState('');
	const [selectedLevel, setSelectedLevel] = useState('');
	const languages = ['Hindi', 'Panjabi', 'Gujarati'];
	const levels = ['Pre_Junior', 'Junior'];

	// Fixed column widths that add up to 100% with proper spacing
	const tableWidth = width - 32; // Account for container padding
	const columnWidths = {
		userId: tableWidth * 0.16,   // 16%
		name: tableWidth * 0.16,     // 16%
		email: tableWidth * 0.34,    // 34%
		language: tableWidth * 0.18, // 18%
		level: tableWidth * 0.18,    // 18%
		action: tableWidth * 0.14,   // 14% reserved for delete
	};


	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const storedToken = await AsyncStorage.getItem('token');
			setToken(storedToken);
			if (!storedToken) {
				Alert.alert('Alert', 'Token not found. Please login again.');
				return;
			}

			const res = await fetch(
				'https://api.smile4kids.co.uk/admin/users',
				{
					headers: { Authorization: `Bearer ${storedToken}` },
				}
			);
			console.log('Fetch users response status:', res.status);
			const data = await res.json();
			console.log('Fetched users:', data);

			if (res.status === 401 || res.status === 403) {
				Alert.alert('Session Expired', 'Please login again.');
				await AsyncStorage.clear();
				navigation.reset({ index: 0, routes: [{ name: 'AdminPannel' }] });
				return;
			}

			if (Array.isArray(data)) {
				const normalized = data.map(u => ({
					...u,
					has_paid: u.language != null && u.level != null
				}));

				const paid = normalized
					.filter(u => u.has_paid)
					.sort((a, b) => {
						const dateA = new Date(a.created_at || 0);
						const dateB = new Date(b.created_at || 0);
						return dateB - dateA;
					});

				const unpaid = normalized.filter(u => !u.has_paid);

				const allUsers = [...paid, ...unpaid]; // Prepare the array
				setUsers(allUsers);                     // Update state
				console.log('Users set in state:', allUsers); // Log the actual data

			} if (data.success && Array.isArray(data.data)) {
				const normalized = data.data.map(u => ({
					...u,
					has_paid: u.language != null && u.level != null
				}));

				const paid = normalized
					.filter(u => u.has_paid)
					.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

				//const unpaid = normalized.filter(u => !u.has_paid);

				const allUsers = [...paid];
				setUsers(allUsers);
				console.log('Users set in state:', allUsers);
			} else {
				Alert.alert('Alert', 'Unexpected response from server.');
			}

		} catch (e) {
			Alert.alert('Alert', 'Failed to fetch users.');
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		setShowAlert(true);
	};

	const getFilteredUsers = useCallback(() => {
		let result = [...users];
		if (selectedLanguage)
			result = result.filter(u => (u.language || '').toLowerCase() === selectedLanguage.toLowerCase());

		if (selectedLevel)
			result = result.filter(u => (u.level || '').toLowerCase() === selectedLevel.toLowerCase());

		if (search) {
			const s = search.toLowerCase();
			result = result.filter(u =>
				(u.username || '').toLowerCase().includes(s) ||
				(u.email_id || '').toLowerCase().includes(s) ||
				(u.language || '').toLowerCase().includes(s) ||
				(u.level || '').toLowerCase().includes(s)
			);
		}

		return result;
	}, [users, search, selectedLanguage, selectedLevel]);

	useEffect(() => {
		setCurrentPage(1);
	}, [search, selectedLanguage, selectedLevel, pageSize]);

	useEffect(() => {
		const filteredUsers = getFilteredUsers();
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		setFiltered(filteredUsers.slice(startIndex, endIndex));
	}, [users, currentPage, pageSize, search, selectedLanguage, selectedLevel]);

	const handleSearch = (text) => {
		setSearch(text);
		setCurrentPage(1);
	};

	const applyFilters = useCallback(() => {
		setCurrentPage(1);
		setShowFilters(false);
	}, []);

	const clearFilters = () => {
		setSearch('');
		setSelectedLanguage('');
		setSelectedLevel('');
		setCurrentPage(1);
		setShowFilters(false);
	};

	const renderItem = ({ item }) => {

		//console.log("ITEM FULL DATA:", item);

		return (
			<View style={styles.row}>
				<View style={[styles.cell, { width: columnWidths.userId }]}>
					<Text style={styles.cellText} numberOfLines={1} ellipsizeMode="tail">
						{item.users_id || 'N/A'}
					</Text>
				</View>
				<View style={[styles.cell, { width: columnWidths.name }]}>
					<Text style={styles.cellText} numberOfLines={1} ellipsizeMode="tail">
						{item.username || 'N/A'}
					</Text>
				</View>
				<View style={[styles.cell, { width: columnWidths.email }]}>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<Text style={styles.cellText}>
							{item.email_id || 'N/A'}
						</Text>
					</ScrollView>
				</View>
				<View style={[styles.cell, { width: columnWidths.language }]}>
					<Text style={styles.cellText} numberOfLines={1} ellipsizeMode="tail">
						{item.language || 'N/A'}
					</Text>
				</View>
				<View style={[styles.cell, { width: columnWidths.level }]}>
					<Text style={styles.cellText} numberOfLines={1} ellipsizeMode="tail">
						{item.level === 'Pre_Junior' ? 'Preschool' : (item.level || 'N/A')}
					</Text>
				</View>
				{/* Edit Icon Button */}
				{/*<TouchableOpacity
				style={[styles.cell, { width: columnWidths.action }]}
				onPress={() => handleedit(item.id)}
			>
				<Icon name="create" size={20} color="#FF8C00" />
			</TouchableOpacity>*/}
				{/*  Delete Icon Button */}
				<TouchableOpacity
					style={[styles.cell, { width: columnWidths.action }]}
					onPress={() => handleDelete(item.users_id, item.language, item.level)}
				>
					<Icon name="trash" size={20} color="red" />
				</TouchableOpacity>
			</View>
		);
	};

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
	const handleDelete = async (userId, language, level) => {
		Alert.alert("Delete User", "Are you sure you want to delete this user?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						console.log("Deleting user with ID:", userId,language,level);
						
						const res = await fetch(
							`https://api.smile4kids.co.uk/admin/user/category/delete/`,
							{
								method: "DELETE",
								headers: { 
									"Content-Type": "application/json",
									Authorization: `Bearer ${token}` },
								body: JSON.stringify({
									user_id: userId,
									language,
									level,

								}),
							}

						);
						console.log("Delete response status:", res.status);

						const data = await res.json();
						console.log("Delete response data:", data);
						if (res.ok) {
							setUsers((prev) => prev.filter((u) => u.users_id !== userId));
							Alert.alert("Success", "User deleted successfully.");
						} else {
							Alert.alert("Error", "Failed to delete user.");
						}
					} catch (error) {
						Alert.alert("Error", "Something went wrong.");
					}
				},
			},
		]);
	};

	const PaginationControls = () => {
		const filteredUsers = getFilteredUsers();
		const totalUsers = filteredUsers.length;
		const totalPages = Math.ceil(totalUsers / pageSize);
		const startIndex = (currentPage - 1) * pageSize + 1;
		const endIndex = Math.min(currentPage * pageSize, totalUsers);

		const getPageNumbers = () => {
			const pages = [];
			const maxVisiblePages = 5;

			if (totalPages <= maxVisiblePages) {
				for (let i = 1; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				if (currentPage <= 3) {
					for (let i = 1; i <= 4; i++) {
						pages.push(i);
					}
					pages.push('...');
					pages.push(totalPages);
				} else if (currentPage >= totalPages - 2) {
					pages.push(1);
					pages.push('...');
					for (let i = totalPages - 3; i <= totalPages; i++) {
						pages.push(i);
					}
				} else {
					pages.push(1);
					pages.push('...');
					for (let i = currentPage - 1; i <= currentPage + 1; i++) {
						pages.push(i);
					}
					pages.push('...');
					pages.push(totalPages);
				}
			}

			return pages;
		};

		if (totalUsers === 0) return null;

		return (
			<View style={styles.paginationContainer}>
				<Text style={styles.resultsInfo}>
					Showing {startIndex}-{endIndex} of {totalUsers} users
				</Text>

				<View style={styles.paginationControls}>
					<TouchableOpacity
						style={[
							styles.paginationButton,
							currentPage === 1 && styles.disabledButton
						]}
						onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
					>
						<Icon
							name="chevron-back"
							size={16}
							color={currentPage === 1 ? '#ccc' : '#4682B4'}
						/>
					</TouchableOpacity>

					<View style={styles.pageNumbers}>
						{getPageNumbers().map((page, index) => (
							<TouchableOpacity
								key={index}
								style={[
									styles.pageButton,
									page === currentPage && styles.activePage,
									page === '...' && styles.ellipsisPage
								]}
								onPress={() => {
									if (page !== '...') {
										setCurrentPage(page);
									}
								}}
								disabled={page === '...'}
							>
								<Text style={[
									styles.pageButtonText,
									page === currentPage && styles.activePageText
								]}>
									{page}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					<TouchableOpacity
						style={[
							styles.paginationButton,
							currentPage === totalPages && styles.disabledButton
						]}
						onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
						disabled={currentPage === totalPages}
					>
						<Icon
							name="chevron-forward"
							size={16}
							color={currentPage === totalPages ? '#ccc' : '#4682B4'}
						/>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	const handleConfirmLogout = async () => {
		await AsyncStorage.clear();
		navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
	};
	const handleCancelLogout = () => {
		setShowAlert(false);
	}
	return (
		<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={{ flex: 1 }}>
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor="#87CEEB" />

				{/* <View style={styles.logoutRow}>
					<TouchableOpacity style={styles.logoutBtn} onPress={logout}>
						<Text style={styles.logoutText}>Logout</Text>
					</TouchableOpacity>

				</View> */}

				<View style={styles.header}>
					<TouchableOpacity style={styles.iconButton} onPress={() => setShowSearch(!showSearch)}>
						<Text style={styles.iconText}>🔍</Text>
					</TouchableOpacity>

					<Text style={styles.title}>Admin Panel</Text>

					<TouchableOpacity style={styles.iconButton} onPress={() => setShowFilters(!showFilters)}>
						<Icon name="filter" size={20} color="#1f2937" />
					</TouchableOpacity>
				</View>

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
							setCurrentPage(1);
							setShowSearch(false);
						}}>
							<Text style={styles.closeText}>✕</Text>
						</TouchableOpacity>
					</View>
				)}

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

				<ScrollView horizontal showsHorizontalScrollIndicator={true}>
					<View style={styles.tableContainer}>
						{loading ? (
							<ActivityIndicator size="large" color="#4682B4" style={{ marginTop: 50 }} />
						) : (
							<>
								{/* Fixed Table Header */}
								<View style={styles.tableHeader}>

									<View style={[styles.headerCell, { width: columnWidths.userId }]}>
										<Text style={styles.headerText}>User ID</Text>
									</View>
									<View style={[styles.headerCell, { width: columnWidths.name }]}>
										<Text style={styles.headerText}>Name</Text>
									</View>
									<View style={[styles.headerCell, { width: columnWidths.email }]}>
										<Text style={styles.headerText}>Email</Text>
									</View>
									<View style={[styles.headerCell, { width: columnWidths.language }]}>
										<Text style={styles.headerText}>Language</Text>
									</View>
									<View style={[styles.headerCell, { width: columnWidths.level }]}>
										<Text style={styles.headerText}>Ages</Text>
									</View>
									{/* <View  style={[styles.headerCell, { width: columnWidths.action }]}>
										<Text style={styles.headerText}>Edit</Text>
									</View> */}
									<View style={[styles.headerCell, { width: columnWidths.action }]}>
										<Text style={styles.headerText}>Delete</Text>
									</View>


								</View>


								<FlatList
									data={filtered}
									keyExtractor={(item, index) => `${item.users_id}-${index}`}
									renderItem={renderItem}
									ListEmptyComponent={
										<View style={styles.emptyContainer}>
											<Text style={styles.emptyText}>No users found</Text>
										</View>
									}
									style={styles.tableList}
									showsVerticalScrollIndicator={false}
									onLayout={() => console.log("FlatList mounted")}
									ListHeaderComponent={() => { console.log("ListHeader rendered"); return null; }}
								/>


							</>
						)}
					</View>
				</ScrollView>
				<View style={styles.logoutRow}>
					<View style={styles.topRow}>
						<TouchableOpacity style={styles.logoutBtn} onPress={logout}>
							<Text style={styles.logoutText}>Logout</Text>
						</TouchableOpacity>

					</View>
				</View>
				<PaginationControls />
				<CustomAlert
					visible={showalert}
					title="Logout"
					message="Are you sure you want to logout?"
					onConfirm={loading ? (
						<ActivityIndicator size="large" color="#FF8C00" style={styles.loadingIndicator} />
					) : (handleConfirmLogout)}
					onCancel={handleCancelLogout}
				/>
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
		mariginTop: 10,
		justifyContent: 'center',
	},
	topRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,    // ← Increase this value for more space
		marginBottom: 10,
	},

	logoutBtn: {
		backgroundColor: '#FF8C00',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
		width: 100,
		height: 40
	},
	logoutText: {
		color: '#fff',
		fontWeight: '600',
		textAlign: 'center',
		fontSize: 16,
		fontWeight: '700',
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
		color: '#4B0082',
	},
	searchBar: {
		flexDirection: 'row',
		backgroundColor: '#fff',
		borderRadius: 25,
		paddingHorizontal: 12,
		paddingVertical: 4,
		alignItems: 'center',
		marginBottom: 12,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	searchInput: {
		flex: 1,
		fontSize: 14,
		paddingVertical: 4,
		paddingHorizontal: 8,
		color: '#1f2937',
	},
	closeText: {
		fontSize: 16,
		color: '#ef4444',
		marginLeft: 8,
		paddingBottom: 4,
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
	},
	tableHeader: {
		flexDirection: 'row',
		paddingVertical: 12,
		paddingHorizontal: 8,
		backgroundColor: '#D6EAF8',
		borderBottomWidth: 1,
		borderBottomColor: '#ADD8E6',
	},
	headerCell: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 4,
	},
	headerText: {
		fontWeight: '700',
		color: '#1f2937',
		fontSize: 12,
		textAlign: 'center',
	},
	tableList: {
		flex: 1,
		//borderColor: 'black',
	},
	row: {
		flexDirection: 'row',
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#ADD8E6',
		backgroundColor: '#ffffff',
		alignItems: 'center',
		borderColor: 'black',
	},
	cell: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 4,
		borderRadius: 3,

	},
	cellText: {
		fontSize: 12,
		color: '#1f2937',
		textAlign: 'center',
	},
	emptyContainer: {
		padding: 20,
		alignItems: 'center',
	},
	emptyText: {
		color: '#4682B4',
		fontSize: 16,
	},

	// Pagination Styles
	paginationContainer: {
		padding: 16,
		backgroundColor: '#fff',
		borderTopWidth: 1,
		borderTopColor: '#ADD8E6',
		borderRadius: 90,
		paddingTop: 20,
	},
	resultsInfo: {
		fontSize: 14,
		color: '#000000ff',
		marginBottom: 12,
		textAlign: 'center',
	},
	paginationControls: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	paginationButton: {
		padding: 8,
		borderRadius: 6,
		backgroundColor: '#f3f4f6',
		marginHorizontal: 4,
	},
	disabledButton: {
		opacity: 0.5,
	},
	pageNumbers: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 8,
	},
	pageButton: {
		minWidth: 32,
		height: 32,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 6,
		backgroundColor: '#f3f4f6',
		marginHorizontal: 2,
	},
	activePage: {
		backgroundColor: '#FF8C00',
	},
	ellipsisPage: {
		backgroundColor: 'transparent',
	},
	pageButtonText: {
		fontSize: 14,
		color: '#1f2937',
		fontWeight: '500',
	},
	activePageText: {
		color: '#fff',
		fontWeight: '600',
	},
});

export default AdminPannel;