import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';

const PaymentScreen = () => {
    const [selectedItems, setSelectedItems] = useState({});
    const languages = ['Gujarati', 'Panjabi', 'Hindi'];
    const ageOptions = ['PreJunior (4–6 years)', 'Junior (7 & above years)'];

    const handleToggle = (language, ageGroup) => {
        setSelectedItems(prev => {
            const current = prev[language] || [];
            const isSelected = current.includes(ageGroup);
            const updated = isSelected
                ? current.filter(item => item !== ageGroup)
                : [...current, ageGroup];
            return { ...prev, [language]: updated };
        });
    };

    const calculateTotal = () => {
        let count = 0;
        for (const lang in selectedItems) {
            count += selectedItems[lang].length;
        }
        return count * 45;
    };

    return (
        <LinearGradient
            colors={['#87CEEB', '#ADD8E6', '#F0F8FF']}
            style={styles.gradientContainer}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Icon name="cart-outline" size={36} color="#FF8C00" style={styles.icon} />
                    <Text style={styles.heading}>Order Summary</Text>
                </View>

                {/* Body */}
                {languages.map(lang => (
                    <View key={lang} style={styles.languageSection}>
                        <Text style={styles.languageTitle}>{lang}</Text>
                        <View style={styles.card}>
                            {ageOptions.map(option => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.ageOption}
                                    onPress={() => handleToggle(lang, option)}
                                >
                                    <Text style={styles.ageText}>{option}</Text>
                                    {selectedItems[lang]?.includes(option) && (
                                        <Icon name="check-circle" size={20} color="green" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Total */}
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>£{calculateTotal()}</Text>
                </View>

                {/* Payment Button */}
                <PressableButton
                    title="Pay"
                    onPress={() => {
                        console.log('Selected Items:', selectedItems);
                    }}
                    style={styles.payButton}
                />
            </ScrollView>
        </LinearGradient>
    );
};

export default PaymentScreen;

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    icon: {
        marginRight: 10,
    },
    heading: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },
    languageSection: {
        marginBottom: 24,
    },
    languageTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#00',
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 0,
        borderColor: '#00',
        // shadowColor: '#00',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
        // elevation: 2,
    },
    ageOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0,
        borderColor: '#f0f0f0',
    },
    ageText: {
        fontSize: 16,
        color: '#333',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingTop: 16,
        marginTop: 30,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FF8C00',
    },
    payButton: {
        marginTop: 30,
        backgroundColor: '#FF8C00',
        paddingVertical: 14,
        borderRadius: 8,
    },
});
