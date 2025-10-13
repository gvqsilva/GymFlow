// app/(tabs)/config.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const themeColor = '#5a4fcf';

export default function SettingsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen 
                options={{ 
                    headerShown: true, 
                    title: "Configurações",
                    headerStyle: { backgroundColor: themeColor },
                    headerTintColor: '#fff',
                }} 
            />
            <ScrollView style={styles.container}>
                <Text style={styles.sectionHeader}>Personalização</Text>
                
                <Pressable style={styles.linkCard} onPress={() => router.push('/perfil')}>
                    <Ionicons name="person-circle-outline" size={28} color={themeColor} />
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>Meu Perfil</Text>
                        <Text style={styles.cardSubtitle}>Consulte e edite os seus dados e metas </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="gray" />
                </Pressable>

                <Pressable style={styles.linkCard} onPress={() => router.push('/gerir-suplementos')}>
                    <Ionicons name="flask-outline" size={28} color={themeColor} />
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>Gerir Suplementos</Text>
                        <Text style={styles.cardSubtitle}>Adicione, remova e configure lembretes </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="gray" />
                </Pressable>

                <Pressable style={styles.linkCard} onPress={() => router.push('/gerir-fichas')}>
                    <Ionicons name="document-text-outline" size={28} color={themeColor} />
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>Gerir Fichas de Treino</Text>
                        <Text style={styles.cardSubtitle}>Crie e personalize as suas fichas </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="gray" />
                </Pressable>

                <Pressable style={styles.linkCard} onPress={() => router.push('/gerir-esportes')}>
                    <Ionicons name="football-outline" size={28} color={themeColor} />
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>Gerir Esportes</Text>
                        <Text style={styles.cardSubtitle}>Adicione ou remova outras modalidades </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="gray" />
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    container: { flex: 1, paddingTop: 10 },
    sectionHeader: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: 'gray', 
        paddingHorizontal: 20, 
        marginTop: 20, 
        marginBottom: 10,
        textTransform: 'uppercase'
    },
    linkCard: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 1 },
    },
    cardTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cardSubtitle: {
        fontSize: 14,
        color: 'gray',
        marginTop: 2,
    },
});