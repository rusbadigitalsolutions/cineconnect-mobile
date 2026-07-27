import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, name);
      router.push('/(auth)/onboarding');
    } catch (e: any) {
      setError(e.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="p-6">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-amber-500 rounded-2xl justify-center items-center mb-2 shadow-lg shadow-amber-500/30">
            <Text className="text-3xl font-black text-slate-950">CC</Text>
          </View>
          <Text className="text-2xl font-bold text-white tracking-wider">Join CineConnect</Text>
          <Text className="text-slate-400 text-xs mt-1">Create your film professional profile</Text>
        </View>

        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          {error ? (
            <View className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-4">
              <Text className="text-rose-400 text-xs">{error}</Text>
            </View>
          ) : null}

          <Text className="text-slate-300 font-semibold text-xs mb-1 uppercase tracking-wider">Full Name</Text>
          <TextInput
            className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 mb-4 text-sm focus:border-amber-500"
            placeholder="e.g. Amara Okafor"
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
          />

          <Text className="text-slate-300 font-semibold text-xs mb-1 uppercase tracking-wider">Email Address</Text>
          <TextInput
            className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 mb-4 text-sm focus:border-amber-500"
            placeholder="actor@cineconnect.app"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text className="text-slate-300 font-semibold text-xs mb-1 uppercase tracking-wider">Password</Text>
          <TextInput
            className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 mb-6 text-sm focus:border-amber-500"
            placeholder="At least 6 characters"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            className="bg-amber-500 active:bg-amber-600 rounded-xl py-4 items-center shadow-lg shadow-amber-500/20 mb-4"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text className="text-slate-950 font-bold text-base uppercase tracking-wider">Continue to Role Selection</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-slate-400 text-sm">Already registered? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-amber-500 font-bold text-sm">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
