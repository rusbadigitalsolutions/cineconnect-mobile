import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)/gist');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading]);

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center p-6">
      <View className="w-16 h-16 bg-amber-500 rounded-2xl justify-center items-center mb-4 shadow-lg shadow-amber-500/50">
        <Text className="text-3xl font-black text-slate-950">CC</Text>
      </View>
      <Text className="text-2xl font-bold text-white tracking-widest uppercase mb-2">CineConnect</Text>
      <Text className="text-slate-400 text-sm mb-8">Connecting Film Creatives Worldwide</Text>
      <ActivityIndicator size="large" color="#F59E0B" />
    </View>
  );
}
