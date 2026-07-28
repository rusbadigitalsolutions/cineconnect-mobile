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
          const fetched = snap.docs.map(docSnap => {
            const d = docSnap.data();
            const rawTime = d.createdAt?.toDate ? d.createdAt.toDate().getTime() : (typeof d.createdAt === 'number' ? d.createdAt : (d.createdAt ? (Date.parse(d.createdAt) || 0) : 0));
            return {
              id: docSnap.id,
              rawTime,
              title: d.title || d.name || 'Monologue Challenge',
              description: d.description || d.details || '',
              hashtag: d.hashtag || '#CineConnect',
              rules: Array.isArray(d.rules) ? d.rules : [],
              prizePool: d.prizePool || d.prize || '₦500,000',
              bannerUrl: d.bannerUrl || d.imageUrl || d.image || undefined,
              deadline: d.deadline?.toDate ? d.deadline.toDate().toLocaleDateString() : (typeof d.deadline === 'string' ? d.deadline : 'Active'),
              submissionsCount: typeof d.submissionsCount === 'number' ? d.submissionsCount : 0
            } as Contest;
          });
          fetched.sort((a, b) => b.rawTime - a.rawTime);
          setContests(fetched);
        }));

        const sRef = collection(db, 'contestSubmissions');
        unsubs.push(onSnapshot(sRef, (snap) => {
          const fetched = snap.docs.map(docSnap => {
            const d = docSnap.data();
            const rawTime = d.createdAt?.toDate ? d.createdAt.toDate().getTime() : (typeof d.createdAt === 'number' ? d.createdAt : (d.createdAt ? (Date.parse(d.createdAt) || 0) : 0));
            return {
              id: docSnap.id,
              rawTime,
              contestId: d.contestId || '',
              userId: d.userId || d.authorId || '',
              userName: d.userName || d.authorName || 'Contestant',
              userAvatar: d.userAvatar || d.avatar || d.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
              videoUrl: d.videoUrl || d.mediaUrl || '',
              caption: d.caption || d.text || '',
              votes: Array.isArray(d.votes) ? d.votes : (d.votes && typeof d.votes === 'object' ? Object.keys(d.votes) : []),
              createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : (typeof d.createdAt === 'string' ? d.createdAt : 'Recently')
            } as ContestSubmission;
          });
          fetched.sort((a, b) => b.rawTime - a.rawTime);
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
