import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
export async function enableNotifications() {
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('raids', { name: 'Raid reminders', importance: AndroidImportance.HIGH, vibrationPattern: [0, 180, 100, 180] });
  const permission = await Notifications.getPermissionsAsync();
  if (permission.granted || permission.ios?.status === IosAuthorizationStatus.PROVISIONAL) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted || result.ios?.status === IosAuthorizationStatus.PROVISIONAL;
}
export async function testNotification() {
  if (!await enableNotifications()) throw Error('Notifications are disabled. Enable them in your device settings.');
  return Notifications.scheduleNotificationAsync({ content: { title: 'Raidwell is ready', body: 'Your device can display local raid reminders.', data: { url: '/profile' }, sound: 'default' }, trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: 'raids' } });
}
let work: Promise<void> = Promise.resolve();
export function syncReminder(roomId?: string, expires?: number, enabled = false) {
  work = work.catch(() => {}).then(async () => {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of pending) if (item.content.data?.kind === 'raid-deadline') await Notifications.cancelScheduledNotificationAsync(item.identifier);
    if (!enabled || !roomId || !expires || expires - Date.now() <= 5 * 60000) return;
    const p = await Notifications.getPermissionsAsync();
    if (!p.granted && p.ios?.status !== IosAuthorizationStatus.PROVISIONAL) return;
    await Notifications.scheduleNotificationAsync({ identifier: `raid-${roomId}`, content: { title: 'Five minutes left on your raid', body: 'Return to Raidwell and check your room before the raid expires.', sound: 'default', data: { url: '/room', kind: 'raid-deadline', roomId } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(expires - 5 * 60000), channelId: 'raids' } });
  });
  return work;
}
