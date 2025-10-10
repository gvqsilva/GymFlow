// components/ShareCard.tsx

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Workout } from '../constants/workoutData';

const themeColor = '#5a4fcf';

const sportIcons: Record<string, { name: string; library: string }> = {
  'Musculação ': { name: 'barbell', library: 'Ionicons' },
  'Natação ': { name: 'swim', library: 'MaterialCommunityIcons'},
  'Vôlei de Quadra ': { name: 'volleyball', library: 'MaterialCommunityIcons' },
  'Vôlei de Praia ': { name: 'sunny', library: 'Ionicons' },
  'Futebol Society ': { name: 'football', library: 'Ionicons' },
  'Boxe ': { name: 'boxing-glove', library: 'MaterialCommunityIcons' },
};

type Activity = {
  category: string;
  details: { type?: string; duration?: number, distance?: number };
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

    const formatDurationString = (totalMinutes: number): string => {
        if (totalMinutes <= 0) {
            return '0min';
        }
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}min`;
        }
        if (hours > 0) {
            return `${hours}h`;
        }
        return `${minutes}min`;
    };

    const durationString = formatDurationString(totalDuration);

    const backgroundImageUri = 'https://img.freepik.com/vetores-gratis/padrao-de-estilo-de-vida-saudavel-e-fitness_24877-56485.jpg?semt=ais_hybrid&w=740&q=80';

    return (
      <View ref={ref}>
        <ImageBackground 
          source={{ uri: backgroundImageUri }} 
          style={styles.card}
          imageStyle={{ borderRadius: 15 }}
        >
          <View style={styles.overlay}>
            <Text style={styles.appName}>GymFlow </Text>
            <Text style={styles.date}>{formattedDate} </Text>

            <View style={styles.activitiesContainer}>
              {activities.map((item, index) => {
                const iconInfo = sportIcons[item.category] || { name: 'help-circle', library: 'Ionicons' };
                const IconComponent = iconInfo.library === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
                
                let activityDisplayName = item.category;
                if (item.category === 'Musculação' && item.details.type && workouts[item.details.type]) {
                    activityDisplayName = `Academia - ${workouts[item.details.type].name}`;
                }

                // ALTERADO: Formata a duração de cada atividade individual
                const durationInMinutes = item.details.duration || (item.category === 'Musculação' ? 60 : 0);
                const formattedDuration = formatDurationString(durationInMinutes);
                
                const isSwimmingWithDistance = item.category.toLowerCase() === 'natação' && item.details.distance && item.details.distance > 0;

                return (
                  <View key={index} style={styles.activityRow}>
                    <IconComponent name={iconInfo.name as any} size={20} color="#fff" />
                    <View style={styles.activityTextContainer}>
                        <Text style={styles.activityText}>{activityDisplayName} </Text>
                        {/* ALTERADO: Exibe a duração já formatada */}
                        <Text style={styles.activityDetailText}>{isSwimmingWithDistance ? `${item.details.distance}m em ` : ''}{formattedDuration} </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.divider} />

            <View style={styles.totalsContainer}>
              <View style={styles.totalItem}>
                <Text style={styles.totalValue}>{totalKcal}</Text>
                <Text style={styles.totalLabel}>kcal </Text>
              </View>
              <View style={styles.totalItem}>
                <Text style={styles.totalValue}>{durationString}</Text>
                <Text style={styles.totalLabel}>Duração </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: { width: 350, height: 500, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 15, padding: 25, justifyContent: 'space-between' },
  appName: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  date: { fontSize: 14, color: '#ddd', textAlign: 'center', marginTop: 4 },
  activitiesContainer: { alignSelf: 'stretch', marginVertical: 20 },
  activityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  activityTextContainer: { flex: 1, marginLeft: 12 },
  activityText: { fontSize: 18, color: 'white', fontWeight: '500' },
  activityDetailText: { fontSize: 14, color: '#ccc' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%' },
  totalsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch', paddingTop: 10 },
  totalItem: { alignItems: 'center', flex: 1 },
  totalValue: { 
      fontSize: 28,
      fontWeight: 'bold', 
      color: 'white' 
  },
  totalLabel: { fontSize: 14, color: '#ddd', marginTop: 2 },
});

export default ShareCard;