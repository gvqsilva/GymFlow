// components/ShareCard.tsx

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Workout } from '../constants/workoutData';

const themeColor = '#5a4fcf';

const sportIcons: Record<string, { name: string; library: string }> = {
  'Musculação': { name: 'barbell', library: 'Ionicons' },
  'Vôlei de Quadra': { name: 'volleyball', library: 'MaterialCommunityIcons' },
  'Vôlei de Praia': { name: 'sunny', library: 'Ionicons' },
  'Futebol Society': { name: 'football', library: 'Ionicons' },
  'Boxe': { name: 'boxing-glove', library: 'MaterialCommunityIcons' },
};

type Activity = {
  category: string;
  details: { type?: string; duration?: number };
};

type ShareCardProps = {
  activities: Activity[];
  totalKcal: number;
  totalDuration: number;
  date: Date;
  workouts: Record<string, Workout>;
};

const ShareCard = forwardRef<View, ShareCardProps>(
  ({ activities, totalKcal, totalDuration, date, workouts }, ref) => {
    
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    // URL da imagem de fundo - SUBSTITUA POR UMA IMAGEM À SUA ESCOLHA
    const backgroundImageUri = 'https://img.freepik.com/vetores-gratis/padrao-de-estilo-de-vida-saudavel-e-fitness_24877-56485.jpg?semt=ais_hybrid&w=740&q=80';

    return (
      <View ref={ref}>
        <ImageBackground 
          source={{ uri: backgroundImageUri }} 
          style={styles.card}
          imageStyle={{ borderRadius: 15 }}
        >
          <View style={styles.overlay}>
            <Text style={styles.appName}>GymFlow</Text>
            <Text style={styles.date}>{formattedDate} </Text>

            <View style={styles.activitiesContainer}>
              {activities.map((item, index) => {
                const iconInfo = sportIcons[item.category];
                const IconComponent = iconInfo?.library === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
                
                const workoutName =
                  item.category === 'Musculação' && item.details.type && workouts[item.details.type]
                    ? `Academia - ${workouts[item.details.type].name}`
                    : item.category;

                const durationText =
                  item.details.duration || item.category === 'Musculação'
                    ? `(${item.details.duration || 60} min)`
                    : '';

                return (
                  <View key={index} style={styles.activityRow}>
                    <IconComponent name={iconInfo?.name as any || 'help-circle'} size={20} color="#fff" />
                    <Text style={styles.activityText}>
                      {workoutName} {durationText} </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.divider} />

            <View style={styles.totalsContainer}>
              <View style={styles.totalItem}>
                <Text style={styles.totalValue}>{totalKcal} </Text>
                <Text style={styles.totalLabel}>kcal </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalValue}>{totalDuration} </Text>
                <Text style={styles.totalLabel}>min </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    width: 350,
    height: 500, // Altura fixa para um formato padronizado
    borderRadius: 15,
    justifyContent: 'space-between', // Distribui o conteúdo verticalmente
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Camada escura para legibilidade
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 4,
  },
  activitiesContainer: {
    alignSelf: 'stretch',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityText: {
    fontSize: 18,
    marginLeft: 12,
    color: 'white',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  totalLabel: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 2,
  },
});

export default ShareCard;

