// lib/notificationService.ts

import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Retorna a data no formato YYYY-MM-DD (local)
 */
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Pede permissão e configura canal Android (para pop-ups/importance)
 */
async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permissão Negada',
      'Não é possível agendar lembretes sem permissão para notificações.'
    );
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

/**
 * Cancela todas as notificações agendadas
 */
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Todos os lembretes foram cancelados.');
}

/**
 * Agenda o próximo lembrete (e reforços) usando trigger do tipo DATE.
 * Observação: usar DATE evita problemas de typing/compatibilidade com timeInterval.
 *
 * Docs: veja exemplos de trigger: DATE no expo-notifications. :contentReference[oaicite:1]{index=1}
 */
export async function scheduleNextReminder() {
  // 1) limpa agendamentos anteriores
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2) lê configurações
  const settingsJSON = await AsyncStorage.getItem('reminderSettings');
  if (!settingsJSON) return;
  const { enabled, time } = JSON.parse(settingsJSON);
  if (!enabled) {
    console.log('Lembretes desativados.');
    return;
  }

  // 3) se já tomou hoje, não agenda
  const creatineDate = await AsyncStorage.getItem('creatineDate');
  const todayStr = getLocalDateString();
  if (creatineDate === todayStr) {
    console.log('Creatina já tomada hoje.');
    return;
  }

  // 4) pede permissão e configura canal Android
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  // 5) calcula próxima data/hora do lembrete principal
  const reminderTime = new Date(time); // time vem do AsyncStorage em ISO
  const now = new Date();

  let nextTriggerDate = new Date();
  nextTriggerDate.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);

  // se já passou, agenda para amanhã
  if (nextTriggerDate <= now) {
    nextTriggerDate.setDate(nextTriggerDate.getDate() + 1);
  }

  try {
    // 6) agenda a notificação principal usando trigger do tipo DATE
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hora da Creatina! 💊',
        body: 'Não se esqueça de tomar a sua dose de hoje.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextTriggerDate,
      },
    });

    console.log(
      `Lembrete principal agendado para ${nextTriggerDate.toLocaleString()}.`
    );

    // 7) agenda reforços (1h, 2h, 3h depois) também com DATE
    const numberOfReinforcements = 5;
    for (let i = 1; i <= numberOfReinforcements; i++) {
      const reinforcementDate = new Date(nextTriggerDate.getTime() + i * 3600 * 1000);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Lembrete: Tomar Creatina! (${i}/${numberOfReinforcements})`,
          body: 'Parece que ainda não marcou a sua dose de hoje.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reinforcementDate,
        },
      });
      console.log(`Lembrete de reforço #${i} agendado para ${reinforcementDate.toLocaleString()}.`);
    }
  } catch (err) {
    console.error('Falha ao agendar notificações:', err);
  }
}
