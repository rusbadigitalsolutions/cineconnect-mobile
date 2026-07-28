import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { GraduationCap, Calendar, MapPin, Phone, Mail, Bell, Check } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { db } from '../../lib/firebase';
import { TrainingProgramme } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function TrainingsScreen() {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<TrainingProgramme[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'workshop' | 'seminar' | 'programme'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      if (db) {
        const tRef = collection(db, 'trainingProgrammes');
        unsubscribe = onSnapshot(tRef, (snap) => {
          const fetched = snap.docs.map(docSnap => {
            const d = docSnap.data();
            const rawTime = d.createdAt?.toDate ? d.createdAt.toDate().getTime() : (typeof d.createdAt === 'number' ? d.createdAt : (d.createdAt ? (Date.parse(d.createdAt) || 0) : 0));
            return {
              id: docSnap.id,
              rawTime,
              title: d.title || d.name || 'Masterclass',
              type: d.type || 'workshop',
              description: d.description || d.details || '',
              instructor: d.instructor || d.speaker || d.host || 'Industry Lead',
              date: d.date?.toDate ? d.date.toDate().toLocaleDateString() : (typeof d.date === 'string' ? d.date : 'TBA'),
              location: d.location || 'Lagos, Nigeria',
              contactEmail: d.contactEmail || d.email || '',
              contactPhone: d.contactPhone || d.phone || '',
              bannerUrl: d.bannerUrl || d.imageUrl || d.image || undefined,
              subscriberCount: typeof d.subscriberCount === 'number' ? d.subscriberCount : 0
            } as TrainingProgramme;
          });
          fetched.sort((a, b) => b.rawTime - a.rawTime);
          setTrainings(fetched);
        });
      }
    } catch(e){}
    return () => unsubscribe();
  }, []);

  const filtered = trainings.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleToggleSubscription = useCallback(async (programmeId: string) => {
    if (!user) return;
    setTrainings(prev => prev.map(t => {
      if (t.id === programmeId) {
        const isSubbed = !t.isSubscribed;
        const newCount = isSubbed ? t.subscriberCount + 1 : t.subscriberCount - 1;

        try {
          if (db) {
            const subRef = doc(db, 'trainingProgrammes', programmeId, 'subscriptions', user.uid);
            if (isSubbed) {
              setDoc(subRef, { userId: user.uid, subscribedAt: new Date().toISOString() });
            } else {
              deleteDoc(subRef);
            }
          }
        } catch(e){}

        return { ...t, isSubscribed: isSubbed, subscriberCount: newCount };
      }
      return t;
    }));
  }, [user]);

  const handlePhoneCall = useCallback((phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber.replace(/\s+/g, '')}`);
  }, []);

  const handleSendEmail = useCallback((email: string, title: string) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}?subject=Inquiry: ${encodeURIComponent(title)}`);
  }, []);

  const renderTrainingItem = useCallback(({ item }: { item: TrainingProgramme }) => (
    <View className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-6 shadow-xl">
      {item.bannerUrl && (
        <View className="h-44 relative bg-slate-950">
          <Image source={{ uri: item.bannerUrl }} className="w-full h-full" resizeMode="cover" />
          <View className="absolute top-3 left-3 bg-amber-500 px-3 py-1 rounded-full">
            <Text className="text-slate-950 font-black text-xs uppercase">{item.type}</Text>
          </View>
        </View>
      )}

      <View className="p-4">
        <Text className="text-white font-black text-lg mb-1">{item.title}</Text>
        <Text className="text-amber-400 font-bold text-xs mb-3">{item.instructor}</Text>

        <Text className="text-slate-300 text-xs mb-4 leading-5">{item.description}</Text>

        <View className="bg-slate-950 rounded-2xl p-3 mb-4 space-y-2 border border-slate-800">
          <View className="flex-row items-center mb-1.5">
            <Calendar size={14} color="#F59E0B" className="mr-2" />
            <Text className="text-slate-300 text-xs font-semibold">{item.date}</Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={14} color="#64748B" className="mr-2" />
            <Text className="text-slate-400 text-xs">{item.location}</Text>
          </View>
        </View>

        {/* Action Buttons: Phone, Email, Subscription */}
        <View className="flex-row items-center space-x-2 pt-2 border-t border-slate-800">
          {item.contactPhone ? (
            <TouchableOpacity
              onPress={() => handlePhoneCall(item.contactPhone)}
              className="bg-slate-800 p-3 rounded-xl flex-row items-center justify-center mr-2"
            >
              <Phone size={16} color="#10B981" />
            </TouchableOpacity>
          ) : null}

          {item.contactEmail ? (
            <TouchableOpacity
              onPress={() => handleSendEmail(item.contactEmail, item.title)}
              className="bg-slate-800 p-3 rounded-xl flex-row items-center justify-center mr-2"
            >
              <Mail size={16} color="#3B82F6" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => handleToggleSubscription(item.id)}
            className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center border ${
              item.isSubscribed
                ? 'bg-emerald-500/20 border-emerald-500'
                : 'bg-amber-500 border-amber-500'
            }`}
          >
            {item.isSubscribed ? (
              <>
                <Check size={16} color="#10B981" className="mr-1.5" />
                <Text className="text-emerald-400 font-bold text-xs">Subscribed to Updates</Text>
              </>
            ) : (
              <>
                <Bell size={16} color="#0F172A" className="mr-1.5" />
                <Text className="text-slate-950 font-bold text-xs">Join Announcement List</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [handlePhoneCall, handleSendEmail, handleToggleSubscription]);

  const keyExtractor = useCallback((item: TrainingProgramme) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <Header title="Trainings & Seminars" subtitle="Industry Masterclasses & Workshops" />

      {/* Filter Tabs */}
      <View className="bg-slate-900 border-b border-slate-800 p-4 flex-row justify-around">
        {(['all', 'workshop', 'seminar', 'programme'] as const).map(type => {
          const active = filterType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full border ${
                active ? 'bg-amber-500 border-amber-500' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <Text className={`text-xs font-bold capitalize ${active ? 'text-slate-950' : 'text-slate-400'}`}>
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderTrainingItem}
        initialNumToRender={4}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
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
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8 mt-12">
            <Text className="text-lg font-bold text-white mb-2">No Training Programmes</Text>
            <Text className="text-slate-400 text-xs text-center">
              Masterclasses, seminars, and training programs added to Firestore will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
