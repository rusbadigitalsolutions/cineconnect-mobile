import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

const ROLES: { type: UserRole; title: string; desc: string; icon: string }[] = [
  {
    type: 'Actor/Actress',
    title: 'Actor / Actress',
    desc: 'Audition for leading roles, submit monologue challenges, and showcase acting showreels.',
    icon: '🎭'
  },
  {
    type: 'Crew member',
    title: 'Crew Member',
    desc: 'DP, Sound Engineer, Editor, Gaffer, Art Director, Makeup Artist.',
    icon: '🎥'
  },
  {
    type: 'Casting Director',
    title: 'Casting Director',
    desc: 'Post open casting calls, leverage Smart Matchmaker AI, review auditions.',
    icon: '🎬'
  },
  {
    type: 'Producer',
    title: 'Producer / Exec',
    desc: 'Finance productions, rent equipment & locations, discover top talent.',
    icon: '💼'
  }
];

export const AVAILABLE_SKILLS = [
  'Dramatic Acting', 'Voiceover', 'Stage Combat', 'Improv', 'Nollywood Accent',
  'Camera Operation', 'Color Grading', 'Lighting Setup', 'Directing',
  'Audio Engineering', 'Special Effects Makeup', 'Screenwriting', 'Production Design'
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setRoleAndOnboarding } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('Actor/Actress');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Dramatic Acting', 'Voiceover']);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      await setRoleAndOnboarding(selectedRole, location, selectedSkills);
      router.replace('/(tabs)/gist');
    } catch (e) {
      router.replace('/(tabs)/gist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">Step 2 of 2</Text>
        <Text className="text-3xl font-extrabold text-white mb-2">Declare Industry Role</Text>
        <Text className="text-slate-400 text-sm mb-6">Select your primary role in the film ecosystem to customize your feed and smart casting matches.</Text>

        {/* Roles List */}
        <View className="mb-6 space-y-3">
          {ROLES.map((r) => {
            const isSelected = selectedRole === r.type;
            return (
              <TouchableOpacity
                key={r.type}
                onPress={() => setSelectedRole(r.type)}
                className={`p-4 rounded-2xl border flex-row items-center mb-3 ${
                  isSelected 
                    ? 'bg-amber-500/10 border-amber-500' 
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <Text className="text-3xl mr-4">{r.icon}</Text>
                <View className="flex-1">
                  <Text className={`font-bold text-base ${isSelected ? 'text-amber-400' : 'text-white'}`}>{r.title}</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">{r.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Location */}
        <Text className="text-slate-300 font-semibold text-xs mb-1 uppercase tracking-wider">Primary Location / Base</Text>
        <TextInput
          className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3.5 mb-6 text-sm"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Lagos, Nigeria"
          placeholderTextColor="#64748B"
        />

        {/* Key Skills Picker */}
        <Text className="text-slate-300 font-semibold text-xs mb-2 uppercase tracking-wider">Select Key Skills (For Matchmaker)</Text>
        <View className="flex-row flex-wrap mb-8">
          {AVAILABLE_SKILLS.map((skill) => {
            const active = selectedSkills.includes(skill);
            return (
              <TouchableOpacity
                key={skill}
                onPress={() => toggleSkill(skill)}
                className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                  active 
                    ? 'bg-amber-500 border-amber-500' 
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <Text className={`text-xs font-semibold ${active ? 'text-slate-950' : 'text-slate-300'}`}>
                  {active ? '✓ ' : '+ '}{skill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submit */}
        <TouchableOpacity
          className="bg-amber-500 active:bg-amber-600 rounded-xl py-4 items-center shadow-lg shadow-amber-500/20"
          onPress={handleFinishOnboarding}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text className="text-slate-950 font-bold text-base uppercase tracking-wider">Complete Profile Setup</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
