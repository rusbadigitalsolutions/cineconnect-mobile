import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Trophy, ThumbsUp, Flame, ShieldAlert } from 'lucide-react-native';
import { Contest, ContestSubmission } from '../types';
import { useAuth } from '../context/AuthContext';
import { MediaRenderer } from './MediaRenderer';

interface ContestCardProps {
  contest: Contest;
  submissions: ContestSubmission[];
  onVote: (submissionId: string) => void;
  onSubmitMonologue: (contestId: string) => void;
}

export const ContestCard: React.FC<ContestCardProps> = React.memo(({
  contest,
  submissions,
  onVote,
  onSubmitMonologue
}) => {
  const { user } = useAuth();

  const handleVoteClick = (subId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch(e){}
    onVote(subId);
  };

  return (
    <View className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-6 shadow-xl">
      {/* Banner */}
      {contest.bannerUrl && (
        <View className="relative h-44">
          <Image source={{ uri: contest.bannerUrl }} className="w-full h-full" resizeMode="cover" />
          <View className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 justify-between">
            <View className="flex-row justify-between items-center">
              <View className="bg-amber-500/90 px-3 py-1 rounded-full flex-row items-center">
                <Trophy size={12} color="#0F172A" />
                <Text className="text-slate-950 font-black text-xs ml-1">{contest.hashtag}</Text>
              </View>
              <View className="bg-slate-950/80 px-2.5 py-1 rounded-full">
                <Text className="text-amber-400 font-bold text-[10px]">{contest.deadline}</Text>
              </View>
            </View>

            <View>
              <Text className="text-white font-black text-xl">{contest.title}</Text>
              <Text className="text-emerald-400 font-bold text-xs mt-0.5">Prize: {contest.prizePool}</Text>
            </View>
          </View>
        </View>
      )}

      <View className="p-4">
        <Text className="text-slate-300 text-xs mb-3 leading-5">{contest.description}</Text>

        {/* Challenge Rules */}
        <View className="bg-slate-950/80 rounded-xl p-3 mb-4 border border-slate-800">
          <Text className="text-amber-400 font-bold text-[11px] uppercase tracking-wider mb-1">Challenge Rules</Text>
          {contest.rules.map((rule, idx) => (
            <Text key={idx} className="text-slate-400 text-[11px] mb-0.5">• {rule}</Text>
          ))}
        </View>

        {/* Submit Monologue Button */}
        <TouchableOpacity
          onPress={() => onSubmitMonologue(contest.id)}
          className="bg-amber-500 active:bg-amber-600 rounded-xl py-3 items-center flex-row justify-center shadow-lg shadow-amber-500/20 mb-5"
        >
          <Flame size={16} color="#0F172A" className="mr-1.5" />
          <Text className="text-slate-950 font-extrabold text-xs uppercase tracking-wider">
            Submit Monologue Video Entry
          </Text>
        </TouchableOpacity>

        {/* Submissions Section Header */}
        <Text className="text-white font-bold text-sm mb-3">
          Top Submissions ({submissions.length})
        </Text>

        {/* Submissions List */}
        {submissions.map((sub, idx) => {
          const hasVoted = user ? sub.votes.includes(user.uid) : false;
          return (
            <View key={sub.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Text className="text-amber-500 font-black text-sm mr-2">#{idx + 1}</Text>
                  <Image
                    source={{ uri: sub.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' }}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <Text className="text-white font-bold text-xs">{sub.userName}</Text>
                </View>

                {/* Voting Button with tactile feedback */}
                <TouchableOpacity
                  onPress={() => handleVoteClick(sub.id)}
                  className={`px-3 py-1.5 rounded-xl flex-row items-center border ${
                    hasVoted
                      ? 'bg-amber-500/20 border-amber-500'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <ThumbsUp size={13} color={hasVoted ? "#F59E0B" : "#94A3B8"} />
                  <Text className={`ml-1.5 font-bold text-xs ${hasVoted ? 'text-amber-400' : 'text-slate-300'}`}>
                    {sub.votes.length} Votes
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-slate-300 text-xs mb-2 italic">"{sub.caption}"</Text>

              {/* Monologue Video Renderer (YouTube, MP4, Vimeo) */}
              <MediaRenderer mediaUrl={sub.videoUrl} text={sub.caption} />
            </View>
          );
        })}
      </View>
    </View>
  );
});
