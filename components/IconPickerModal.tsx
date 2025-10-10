// components/IconPickerModal.tsx

import React from 'react';
import { View, StyleSheet, Modal, FlatList, Pressable, SafeAreaView, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { availableIcons, IconInfo } from '../constants/iconList';

interface IconPickerModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSelectIcon: (icon: IconInfo) => void;
}

const themeColor = '#5a4fcf';

export default function IconPickerModal({ isVisible, onClose, onSelectIcon }: IconPickerModalProps) {
    
    const renderIcon = ({ item }: { item: IconInfo }) => {
        const IconComponent = item.library === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
        return (
            <Pressable style={styles.iconContainer} onPress={() => {
                onSelectIcon(item);
                onClose();
            }}>
                <IconComponent name={item.name as any} size={40} color={themeColor} />
            </Pressable>
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Escolha um Ícone</Text>
                    <Pressable onPress={onClose}>
                        <Ionicons name="close" size={30} color="#333" />
                    </Pressable>
                </View>
                <FlatList
                    data={availableIcons}
                    renderItem={renderIcon}
                    keyExtractor={(item) => `${item.library}-${item.name}`}
                    numColumns={5}
                    contentContainerStyle={styles.list}
                />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    list: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    iconContainer: {
        padding: 15,
        borderRadius: 10,
        margin: 5,
        borderWidth: 1,
        borderColor: '#eee',
    },
});