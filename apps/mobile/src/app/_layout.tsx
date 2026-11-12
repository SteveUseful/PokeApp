import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RaidProvider, useRaid } from '../store';
import { C } from '../components/ui';
import { Welcome } from '../components/welcome';
function Shell() {
  const { loaded, state, saveError } = useRaid();
  useEffect(() => {
    if (!loaded || !state.onboarded) return;
    function redirect(n: Notifications.Notification) {
      const url = n.request.content.data?.url;
      if (url === '/room' || url === '/profile') router.push(url);
    }
    const pending = Notifications.getLastNotificationResponse();
    if (pending) { redirect(pending.notification); Notifications.clearLastNotificationResponse(); }
    const listener = Notifications.addNotificationResponseReceivedListener(response => { redirect(response.notification); Notifications.clearLastNotificationResponse(); });
    return () => listener.remove();
  }, [loaded, state.onboarded]);
  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', gap: 20 }}><ActivityIndicator color={C.lime} /><Text style={{ color: C.text }}>Opening Raidwell…</Text></View>;
  if (!state.onboarded) return <Welcome />;
  return <View style={{ flex: 1 }}>{saveError ? <Text accessibilityRole="alert" style={{ backgroundColor: '#623029', color: '#fff', padding: 12 }}>Session could not be saved. Keep the app open and try again.</Text> : null}<Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: C.lime, tabBarInactiveTintColor: C.muted, tabBarStyle: { backgroundColor: '#131c28', borderTopColor: C.line }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }, sceneStyle: { backgroundColor: C.bg } }}><Tabs.Screen name="index" options={{ title: 'Raids', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>◎</Text> }} /><Tabs.Screen name="host" options={{ title: 'Host', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>＋</Text> }} /><Tabs.Screen name="room" options={{ title: 'Room', tabBarBadge: state.room || state.queue ? '•' : undefined, tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>▤</Text> }} /><Tabs.Screen name="activity" options={{ title: 'Activity', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>↗</Text> }} /><Tabs.Screen name="profile" options={{ title: 'Trainer', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>◉</Text> }} /><Tabs.Screen name="prep" options={{ href: null }} /><Tabs.Screen name="report" options={{ href: null }} /></Tabs></View>;
}
export default function Layout() { return <SafeAreaProvider><RaidProvider><StatusBar style="light" /><Shell /></RaidProvider></SafeAreaProvider>; }
