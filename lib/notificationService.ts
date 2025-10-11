// lib/notificationService.ts

import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDERS_KEY = 'all_supplement_reminders';
const SUPPLEMENTS_HISTORY_KEY = 'supplements_history';

const getLocalDateString = (date = new Date()) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Alert.alert('Permissão Negada', 'Não é possível agendar lembretes sem permissão.');
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
  // Cancela notificações anteriores
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('🗑️ Lembretes anteriores cancelados.');

  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  const remindersJSON = await AsyncStorage.getItem(REMINDERS_KEY);
  const reminders = remindersJSON ? JSON.parse(remindersJSON) : {};

  const supplementsHistoryJSON = await AsyncStorage.getItem(SUPPLEMENTS_HISTORY_KEY);
  const supplementsHistory = supplementsHistoryJSON ? JSON.parse(supplementsHistoryJSON) : {};
  const todayStr = getLocalDateString();
  const todayHistory = supplementsHistory[todayStr] || {};

  const now = new Date();

  for (const supplementId in reminders) {
    const reminder = reminders[supplementId];
    if (!reminder.enabled || todayHistory[supplementId]) continue;

    const reminderTime = new Date(reminder.time);
    let nextTriggerDate = new Date();
    nextTriggerDate.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
    if (nextTriggerDate <= now) nextTriggerDate.setDate(nextTriggerDate.getDate() + 1);

    const delayFirst = nextTriggerDate.getTime() - now.getTime();

    // Função para agendar notificações com reforço
    const scheduleReinforcements = async () => {
      for (let i = 0; i <= 6; i++) { // 0 = primeira notificação, 1..6 = reforços
        const delay = i * 3600 * 1000; // 1h em ms
        setTimeout(async () => {
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: i === 0
                  ? `Hora de tomar ${reminder.supplementName}! 💊`
                  : `Reforço (${i}/6): ${reminder.supplementName}`,
                body: i === 0
                  ? 'Não se esqueça de registrar a sua dose.'
                  : 'Ainda não registrou? Aproveite para marcar agora!',
                sound: true,
              },
              trigger: null, // controlado pelo setTimeout
            });
            console.log(
              `⏰ Notificação ${i === 0 ? 'principal' : 'reforço ' + i} para ${reminder.supplementName} disparada!`
            );
          } catch (e) {
            console.error(`❌ Erro ao disparar notificação para ${reminder.supplementName}:`, e);
          }
        }, delayFirst + delay);
      }
    };

    scheduleReinforcements();

    console.log(`⏳ Lembrete principal agendado para ${nextTriggerDate.toLocaleString()}`);
  }
}
