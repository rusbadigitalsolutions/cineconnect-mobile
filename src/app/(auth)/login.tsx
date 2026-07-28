import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { useAuth } from '../../context/AuthContext';

function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogleCredential } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/gist');
    } catch (e: any) {
      const msg = e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : e.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : e.message || 'Failed to sign in. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const googleClientIds = Constants?.expoConfig?.extra?.googleClientId || {};
      const clientId = Platform.OS === 'ios'
        ? googleClientIds.ios
        : Platform.OS === 'android'
        ? googleClientIds.android
        : googleClientIds.web;

      if (!clientId || clientId.startsWith('YOUR_')) {
        throw new Error(`Google Client ID for ${Platform.OS} is not configured yet in app.json.`);
      }

      const redirectUri = Linking.createURL('/');
      const nonce = Math.random().toString(36).substring(2);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=id_token` +
        `&scope=${encodeURIComponent('openid profile email')}` +
        `&nonce=${nonce}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type === 'success' && result.url) {
        const urlStr = result.url.replace('#', '?');
        const queryIndex = urlStr.indexOf('?');
        if (queryIndex !== -1) {
          const queryString = urlStr.substring(queryIndex + 1);
          const params = new URLSearchParams(queryString);
          const idToken = params.get('id_token');
          if (idToken) {
            await signInWithGoogleCredential(idToken);
            router.replace('/(tabs)/gist');
            return;
          }
        }
      }
    } catch (err: any) {
      console.warn('Direct Google Auth error:', err);
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="p-6">
        {/* Brand Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-3xl overflow-hidden mb-3 border-2 border-amber-500/40 shadow-xl shadow-amber-500/30 bg-slate-950">
            <Image
              source={require('../../../assets/AppIcon.icon/Assets/icon.png')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <Text className="text-3xl font-extrabold text-white tracking-wider">CineConnect</Text>
          <Text className="text-amber-500 font-medium text-sm mt-1">Film Industry Mobile Ecosystem</Text>
        </View>

        {/* Form Container */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <Text className="text-xl font-bold text-white mb-1">Welcome Back</Text>
          <Text className="text-slate-400 text-sm mb-6">Sign in with your Firebase CineConnect account</Text>

          {error ? (
            <View className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-4">
              <Text className="text-rose-400 text-xs">{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
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

          {/* Password Input */}
          <Text className="text-slate-300 font-semibold text-xs mb-1 uppercase tracking-wider">Password</Text>
          <TextInput
            className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 mb-6 text-sm focus:border-amber-500"
            placeholder="••••••••"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-amber-500 active:bg-amber-600 rounded-xl py-4 items-center shadow-lg shadow-amber-500/20 mb-3"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text className="text-slate-950 font-bold text-base uppercase tracking-wider">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Google Sign In Button */}
          <TouchableOpacity
            className="bg-slate-800 border border-slate-700 rounded-xl py-3.5 flex-row justify-center items-center mb-6"
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text className="text-white font-bold text-sm">🌐 Continue with Google Login</Text>
          </TouchableOpacity>

          {/* Toggle Register */}
          <View className="flex-row justify-center items-center">
            <Text className="text-slate-400 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-amber-500 font-bold text-sm">Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default LoginScreen;
