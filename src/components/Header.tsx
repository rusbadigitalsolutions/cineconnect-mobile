import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showAdminBadge?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showAdminBadge = true }) => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex-row items-center justify-between">
      {/* Brand & Page Info */}
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-xl overflow-hidden mr-3 border border-amber-500/40 bg-slate-950 shadow-md shadow-amber-500/20">
          <Image
            source={require('../../assets/AppIcon.icon/Assets/icon.png')}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View>
          <Text className="text-lg font-bold text-white tracking-wide">{title || 'CineConnect'}</Text>
          {subtitle ? (
            <Text className="text-slate-400 text-xs">{subtitle}</Text>
          ) : (
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
              <Text className="text-emerald-400 text-xs font-medium">{user?.role || 'Film Ecosystem'}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Icons */}
      <View className="flex-row items-center space-x-2">
        {user?.isAdmin && showAdminBadge && (
          <TouchableOpacity
            onPress={() => router.push('/admin')}
            className="bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-lg flex-row items-center mr-2"
          >
            <ShieldAlert size={14} color="#F59E0B" />
            <Text className="text-amber-400 text-xs font-bold ml-1">Admin</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/messages')}
          className="w-10 h-10 bg-slate-800 rounded-xl justify-center items-center relative mr-2"
        >
          <Bell size={20} color="#94A3B8" />
          <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/profile')}
          className="w-10 h-10 rounded-xl border-2 border-amber-500 overflow-hidden bg-slate-800"
        >
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
