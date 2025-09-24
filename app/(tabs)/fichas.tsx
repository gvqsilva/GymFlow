import React from 'react';
import { View, StyleSheet, FlatList, Pressable, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { WORKOUT_DATA } from '../../constants/workoutData';

const themeColor = '#5a4fcf';

export default function WorkoutsListScreen() {
    const workouts = Object.values(WORKOUT_DATA);

    return (
        <View style={styles.container}>
            <Stack.Screen 
              options={{ 
                headerShown: true, 
                title: "Fichas de Treino", 
                headerStyle: { backgroundColor: themeColor } , 
                headerTintColor: '#fff' 
              }} 
            />
            <FlatList
                data={workouts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 15 }}
                renderItem={({ item }) => (
                    <Link 
                        href={{
                          pathname: "/fichas/[id]",
                          params: { id: item.id }
                        }} 
                        asChild
                    >
                        <Pressable style={styles.card}>
                            <View>
                                <Text style={styles.cardTitle}>{item.name} {'->'}</Text>
                                <Text style={styles.exerciseCount}>{item.exercises.length} exercícios</Text>
                            </View>
                            <Text style={styles.muscleGroups}>{item.groups}</Text>
                        </Pressable>
                    </Link>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    exerciseCount: {
        fontSize: 14,
        color: 'gray',
        marginTop: 5,
    },
    muscleGroups: {
        fontSize: 14,
        color: '#555',
        marginTop: 10,
        alignSelf: 'flex-end',
        fontWeight: '500'
    },
});

