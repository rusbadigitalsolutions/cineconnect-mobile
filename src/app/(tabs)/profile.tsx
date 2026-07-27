import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Video, 
  LogOut, 
  ShieldAlert, 
  ExternalLink
} from 'lucide-react-native';
import { Header } from '../../components/Header';
import { PaystackWebViewModal } from '../../components/PaystackWebViewModal';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile, logout } = useAuth();
  const [paystackVisible, setPaystackVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950">
        <Header title="Portfolio Profile" />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-white font-bold text-lg mb-2">Not Signed In</Text>
          <Text className="text-slate-400 text-xs text-center mb-6">
            Please sign in or create an account to view your professional portfolio profile.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="bg-amber-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-slate-950 font-bold text-sm uppercase tracking-wider">Sign In Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handlePaystackSuccess = async () => {
    await updateUserProfile({
      premium: true,
      verified: true
    });
  };

  const handleOpenResume = () => {
    if (user.resumeUrl) {
      Linking.openURL(user.resumeUrl);
    }
  };

  const handleOpenReel = () => {
    if (user.reelsUrl) {
      Linking.openURL(user.reelsUrl);
    }
  };

  const skillsList = user.skills || [];
  const headshotsList = user.headshots && user.headshots.length > 0 ? user.headshots : [
    user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <Header title="Portfolio Profile" subtitle="Public Industry Resume & Badges" />

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 800);
            }}
            tintColor="#F59E0B"
          />
        }
      >
        {/* Profile Card Header */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-5 shadow-xl">
          <View className="items-center mb-4">
            <View className="relative mb-3">
              <Image
                source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' }}
                className="w-24 h-24 rounded-full border-4 border-amber-500"
                contentFit="cover"
              />
              {user.verified && (
                <View className="absolute bottom-0 right-0 bg-amber-500 p-1.5 rounded-full border-2 border-slate-900">
                  <ShieldCheck size={16} color="#0F172A" />
                </View>
              )}
            </View>

            <Text className="text-white font-extrabold text-xl mb-1">{user.name}</Text>

            {/* Role & Badges */}
            <View className="flex-row items-center space-x-2 mb-2">
              <View className="bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-full">
                <Text className="text-amber-400 font-bold text-xs">{user.role}</Text>
              </View>
              {user.premium && (
                <View className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full flex-row items-center">
                  <Sparkles size={12} color="#10B981" className="mr-1" />
                  <Text className="text-emerald-400 font-bold text-xs">PRO Member</Text>
                </View>
              )}
            </View>

            <Text className="text-slate-400 text-xs mb-3">{user.location || 'Lagos, Nigeria'} • {user.timezone || 'GMT+1'}</Text>

            {/* Portfolio Stats */}
            <View className="flex-row justify-around w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl py-3 px-4">
              <View className="items-center">
                <Text className="text-white font-black text-base">{user.followersCount || 0}</Text>
                <Text className="text-slate-500 text-[10px] uppercase font-bold">Followers</Text>
              </View>
              <View className="w-[1] bg-slate-800" />
              <View className="items-center">
                <Text className="text-white font-black text-base">{user.followingCount || 0}</Text>
                <Text className="text-slate-500 text-[10px] uppercase font-bold">Following</Text>
              </View>
              <View className="w-[1] bg-slate-800" />
              <View className="items-center">
                <Text className="text-amber-400 font-black text-base">Verified</Text>
                <Text className="text-slate-500 text-[10px] uppercase font-bold">Status</Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          <View className="mb-4">
            <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Biography</Text>
            <Text className="text-slate-200 text-xs leading-5">
              {user.bio || 'Film industry creative profile on CineConnect.'}
            </Text>
          </View>

          {/* Key Skills */}
          {skillsList.length > 0 && (
            <>
              <Text className="text-slate-400 text-[10px] uppercase font-bold mb-2">Verified Skills</Text>
              <View className="flex-row flex-wrap mb-4">
                {skillsList.map(sk => (
                  <View key={sk} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg mr-1.5 mb-1.5">
                    <Text className="text-amber-300 text-xs font-semibold">{sk}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Paystack Upgrade Banner */}
          {!user.premium && (
            <TouchableOpacity
              onPress={() => setPaystackVisible(true)}
              className="bg-amber-500 active:bg-amber-600 rounded-2xl p-4 flex-row items-center justify-between shadow-lg shadow-amber-500/30 mb-2"
            >
              <View className="flex-1 mr-2">
                <Text className="text-slate-950 font-black text-sm">Upgrade to Premium Portfolio</Text>
                <Text className="text-slate-900 text-[11px] font-medium">
                  Unlock Paystack verification badge & top matchmaker ranking
                </Text>
              </View>
              <Sparkles size={24} color="#0F172A" />
            </TouchableOpacity>
          )}
        </View>

        {/* Headshots Gallery Carousel */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-5 shadow-xl">
          <Text className="text-white font-bold text-sm mb-3">Portfolio Headshots & Media</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {headshotsList.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                className="w-32 h-44 rounded-2xl mr-3 border border-slate-700 bg-slate-950"
                contentFit="cover"
              />
            ))}
          </ScrollView>
        </View>

        {/* Portfolio Actions: Resume & Reel links */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-5 space-y-3">
          {user.resumeUrl && (
            <TouchableOpacity
              onPress={handleOpenResume}
              className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex-row items-center justify-between mb-3"
            >
              <View className="flex-row items-center">
                <FileText size={20} color="#F59E0B" className="mr-3" />
                <View>
                  <Text className="text-white font-bold text-xs">Acting Resume / CV</Text>
                  <Text className="text-slate-500 text-[10px]">PDF Document Attached</Text>
                </View>
              </View>
              <ExternalLink size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}

          {user.reelsUrl && (
            <TouchableOpacity
              onPress={handleOpenReel}
              className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex-row items-center justify-between mb-3"
            >
              <View className="flex-row items-center">
                <Video size={20} color="#0D9488" className="mr-3" />
                <View>
                  <Text className="text-white font-bold text-xs">Showreel & Monologue Demo</Text>
                  <Text className="text-slate-500 text-[10px]">Video Reel Link</Text>
                </View>
              </View>
              <ExternalLink size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}

          {/* Admin Dashboard Shortcut */}
          {user.isAdmin && (
            <TouchableOpacity
              onPress={() => router.push('/admin')}
              className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex-row items-center justify-between mb-3"
            >
              <View className="flex-row items-center">
                <ShieldAlert size={20} color="#F59E0B" className="mr-3" />
                <View>
                  <Text className="text-amber-400 font-bold text-xs">Admin Control Panel</Text>
                  <Text className="text-slate-400 text-[10px]">System Settings & Content Moderation</Text>
                </View>
              </View>
              <Text className="text-amber-400 font-bold text-xs">Open →</Text>
            </TouchableOpacity>
          )}

          {/* Sign Out */}
          <TouchableOpacity
            onPress={logout}
            className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-2xl flex-row items-center justify-center"
          >
            <LogOut size={16} color="#EF4444" className="mr-2" />
            <Text className="text-rose-400 font-bold text-xs uppercase tracking-wider">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PaystackWebViewModal
        visible={paystackVisible}
        onClose={() => setPaystackVisible(false)}
        onSuccess={handlePaystackSuccess}
      />
    </SafeAreaView>
  );
}
