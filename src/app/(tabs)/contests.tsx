import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Header } from '../../components/Header';
import { ContestCard } from '../../components/ContestCard';
import { SubmitMonologueModal } from '../../components/SubmitMonologueModal';
import { db } from '../../lib/firebase';
import { Contest, ContestSubmission } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function ContestsScreen() {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    try {
      if (db) {
        const cRef = collection(db, 'contests');
        unsubs.push(onSnapshot(cRef, (snap) => {
          const fetched: Contest[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Contest));
          setContests(fetched);
        }));

        const sRef = collection(db, 'contestSubmissions');
        unsubs.push(onSnapshot(sRef, (snap) => {
          const fetched: ContestSubmission[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContestSubmission));
          setSubmissions(fetched);
        }));
      }
    } catch(e){}
    return () => unsubs.forEach(u => u());
  }, []);

  const handleVote = useCallback((submissionId: string) => {
    if (!user) return;
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        const votes = s.votes || [];
        const alreadyVoted = votes.includes(user.uid);
        const newVotes = alreadyVoted ? votes.filter(id => id !== user.uid) : [...votes, user.uid];

        try {
          if (db) {
            updateDoc(doc(db, 'contestSubmissions', submissionId), { votes: newVotes });
          }
        } catch(e){}

        return { ...s, votes: newVotes };
      }
      return s;
    }));
  }, [user]);

  const handleSubmitMonologueClick = useCallback((contestId: string) => {
    setSelectedContestId(contestId);
    setSubmitModalVisible(true);
  }, []);

  const handleSubmissionComplete = async (contestId: string, videoUrl: string, caption: string) => {
    if (!user) return;
    const newSub: ContestSubmission = {
      id: `sub-${Date.now()}`,
      contestId,
      userId: user.uid,
      userName: user.name,
      userAvatar: user.avatar,
      videoUrl,
      caption,
      votes: [user.uid],
      createdAt: 'Just now'
    };

    setSubmissions(prev => [newSub, ...prev]);
    try {
      if (db) {
        await addDoc(collection(db, 'contestSubmissions'), newSub);
      }
    } catch(e){}
  };

  const renderContestItem = useCallback(({ item }: { item: Contest }) => {
    const contestSubs = submissions.filter(s => s.contestId === item.id);
    return (
      <ContestCard
        contest={item}
        submissions={contestSubs}
        onVote={handleVote}
        onSubmitMonologue={handleSubmitMonologueClick}
      />
    );
  }, [submissions, handleVote, handleSubmitMonologueClick]);

  const keyExtractor = useCallback((item: Contest) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <Header title="Talent Contests" subtitle="Monologue Challenges & Live Voting" />

      <FlatList
        data={contests}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderContestItem}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
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
            <Text className="text-lg font-bold text-white mb-2">No Active Contests</Text>
            <Text className="text-slate-400 text-xs text-center">
              Active monologue challenges and video competitions created in Firestore will appear here.
            </Text>
          </View>
        }
      />

      <SubmitMonologueModal
        contestId={selectedContestId}
        visible={submitModalVisible}
        onClose={() => setSubmitModalVisible(false)}
        onSubmit={handleSubmissionComplete}
      />
    </SafeAreaView>
  );
}
