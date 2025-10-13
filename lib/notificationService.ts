// lib/notificationService.ts

import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDERS_KEY = 'all_supplement_reminders';
const SUPPLEMENTS_HISTORY_KEY = 'supplements_history';

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permissão Negada', 'Ative as notificações nas configurações do dispositivo.');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

export async function scheduleAllReminders() {
  console.log('🔄 Reagendando lembretes...');

  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  const remindersJSON = await AsyncStorage.getItem(REMINDERS_KEY);
  const reminders = remindersJSON ? JSON.parse(remindersJSON) : {};

  const supplementsHistoryJSON = await AsyncStorage.getItem(SUPPLEMENTS_HISTORY_KEY);
  const supplementsHistory = supplementsHistoryJSON ? JSON.parse(supplementsHistoryJSON) : {};

  const todayStr = getLocalDateString();
  const todayHistory = supplementsHistory[todayStr] || {};

  for (const supplementId in reminders) {
    const reminder = reminders[supplementId];
    const alreadyTaken = todayHistory[supplementId];

    if (reminder.enabled && !alreadyTaken) {
      const reminderTime = new Date(reminder.time);
      const now = new Date();

      let nextTriggerDate = new Date();
      nextTriggerDate.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
      if (nextTriggerDate <= now) nextTriggerDate.setDate(nextTriggerDate.getDate() + 1);

      const delay = nextTriggerDate.getTime() - now.getTime();

      // ⏰ Notificação principal
      setTimeout(async () => {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Lembrete: ${reminder.supplementName} 💊`,
            body: 'Não se esqueça de registar a sua dose de hoje.',
            sound: true,
          },
          trigger: null, // ✅ dispara imediatamente
        });
      }, delay);

      console.log(`✅ Lembrete principal de "${reminder.supplementName}" em ${Math.round(delay / 1000 / 60)} minutos`);

      // 🔁 Reforços de hora em hora
      const numberOfReinforcements = 5;
      for (let i = 1; i <= numberOfReinforcements; i++) {
        const reinforcementDate = new Date(nextTriggerDate.getTime() + i * 3600 * 1000);
        const reinforcementDelay = reinforcementDate.getTime() - now.getTime();

        if (reinforcementDelay > 0) {
          setTimeout(async () => {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Ainda não tomou seu ${reminder.supplementName}?`,
                body: `Este é um lembrete de reforço. Toque para registar.`,
                sound: true,
              },
              trigger: null, // ✅ dispara imediatamente
            });
          }, reinforcementDelay);

          console.log(`⏰ Reforço #${i} será exibido em ${Math.round(reinforcementDelay / 1000 / 60)} minutos`);
        }
      }
    } else if (reminder.enabled && alreadyTaken) {
      console.log(`👍 "${reminder.supplementName}" já tomado hoje. Nenhum lembrete necessário.`);
    }
  }
}
