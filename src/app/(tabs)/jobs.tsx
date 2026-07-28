import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { Search } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { JobCard } from '../../components/JobCard';
import { ApplyJobModal } from '../../components/ApplyJobModal';
import { MatchmakerSection } from '../../components/MatchmakerSection';
import { db } from '../../lib/firebase';
import { Job } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function JobsScreen() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [roleFilter, setRoleFilter] = useState<'All' | 'Actor/Actress' | 'Crew member'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      if (db) {
        const jobsRef = collection(db, 'jobs');
        unsubscribe = onSnapshot(jobsRef, (snapshot) => {
          const fetched: Job[] = snapshot.docs.map(docSnap => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              title: d.title || d.jobTitle || d.roleName || 'Casting Call',
              company: d.company || d.productionCompany || d.studio || 'Production Studio',
              roleType: d.roleType || d.type || 'Actor/Actress',
              requiredSkills: Array.isArray(d.requiredSkills) ? d.requiredSkills : (Array.isArray(d.skills) ? d.skills : []),
              budget: typeof d.budget === 'number' ? d.budget : (typeof d.pay === 'number' ? d.pay : 0),
              currency: d.currency || '₦',
              location: d.location || 'Lagos, Nigeria',
              description: d.description || d.details || '',
              deadline: d.deadline?.toDate ? d.deadline.toDate().toLocaleDateString() : (typeof d.deadline === 'string' ? d.deadline : 'Open'),
              createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : (typeof d.createdAt === 'string' ? d.createdAt : 'Recently')
            } as Job;
          });
          setJobs(fetched);
        }, (err) => {
          console.warn('Jobs snapshot listener warning:', err);
        });
      }
    } catch(e){}
    return () => unsubscribe();
  }, []);

  const filteredJobs = jobs.filter(j => {
    if (roleFilter !== 'All' && j.roleType !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const skills = j.requiredSkills || [];
      return (j.title || '').toLowerCase().includes(q) || 
             (j.company || '').toLowerCase().includes(q) || 
             skills.some(s => (s || '').toLowerCase().includes(q));
    }
    return true;
  });

  const handleApplyClick = useCallback((job: Job) => {
    setSelectedJob(job);
    setApplyModalVisible(true);
  }, []);

  const handleApplicationSubmit = async (jobId: string, monologueUrl: string, coverLetter: string) => {
    if (!user) return;
    const applicationPayload = {
      id: `app-${Date.now()}`,
      jobId,
      userId: user.uid,
      userName: user.name,
      userRole: user.role,
      resumeUrl: user.resumeUrl || 'https://cineconnect.app/resume.pdf',
      monologueUrl,
      coverLetter,
      appliedAt: new Date().toISOString()
    };

    try {
      if (db) {
        const appRef = doc(db, 'jobs', jobId, 'applications', user.uid);
        await setDoc(appRef, applicationPayload);
      }
    } catch(e){
      console.warn('Application save fallback:', e);
    }
  };

  const renderJobItem = useCallback(({ item }: { item: Job }) => (
    <JobCard
      job={item}
      onApply={handleApplyClick}
    />
  ), [handleApplyClick]);

  const keyExtractor = useCallback((item: Job) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <Header title="Casting & Crew Calls" subtitle="Active Industry Job Listings" />

      {/* Filter & Search Header */}
      <View className="bg-slate-900 border-b border-slate-800 p-4">
        {/* Search Bar */}
        <View className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex-row items-center mb-3">
          <Search size={16} color="#64748B" className="mr-2" />
          <TextInput
            className="flex-1 text-white text-xs"
            placeholder="Search roles, skills, or production companies..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Role Type Tabs */}
        <View className="flex-row justify-around">
          {(['All', 'Actor/Actress', 'Crew member'] as const).map(role => {
            const active = roleFilter === role;
            return (
              <TouchableOpacity
                key={role}
                onPress={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-full border ${
                  active ? 'bg-amber-500 border-amber-500' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <Text className={`text-xs font-bold ${active ? 'text-slate-950' : 'text-slate-400'}`}>
                  {role}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          jobs.length > 0 ? <MatchmakerSection jobs={jobs} onSelectJob={handleApplyClick} /> : null
        }
        renderItem={renderJobItem}
        initialNumToRender={5}
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
            <Text className="text-lg font-bold text-white mb-2">No Casting Calls Available</Text>
            <Text className="text-slate-400 text-xs text-center">
              Active job listings published by Producers and Casting Directors in Firestore will appear here in real-time.
            </Text>
          </View>
        }
      />

      <ApplyJobModal
        job={selectedJob}
        visible={applyModalVisible}
        onClose={() => setApplyModalVisible(false)}
        onSubmit={handleApplicationSubmit}
      />
    </SafeAreaView>
  );
}
