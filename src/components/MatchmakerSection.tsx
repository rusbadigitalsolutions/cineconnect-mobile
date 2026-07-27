import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { Job, MatchmakerScore } from '../types';
import { useAuth } from '../context/AuthContext';

interface MatchmakerSectionProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}

export const MatchmakerSection: React.FC<MatchmakerSectionProps> = ({ jobs = [], onSelectJob }) => {
  const { user } = useAuth();
  if (!user || !jobs || jobs.length === 0) return null;

  const userSkills = user.skills || [];
  const userSkillsLower = userSkills.map(s => (s || '').toLowerCase());

  // Calculate percentage match scores
  const matchedJobs: MatchmakerScore[] = jobs.map(j => {
    let score = 50; // base match
    if (j.roleType === user.role) score += 25;
    
    const requiredSkills = j.requiredSkills || [];
    const matchedSkills = requiredSkills.filter(reqSkill =>
      reqSkill && userSkillsLower.some(us => us.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(us))
    );
    
    score += Math.min(25, matchedSkills.length * 10);
    return {
      job: j,
      scorePercentage: Math.min(99, score),
      matchingSkills: matchedSkills
    };
  }).sort((a, b) => b.scorePercentage - a.scorePercentage);

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-4 mb-3">
        <View className="flex-row items-center">
          <View className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 justify-center items-center mr-2">
            <Sparkles size={14} color="#F59E0B" />
          </View>
          <Text className="text-white font-extrabold text-base">Smart Matchmaker AI</Text>
        </View>
        <Text className="text-amber-400 text-xs font-semibold">Tailored for {user.role}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}>
        {matchedJobs.map(({ job, scorePercentage, matchingSkills }) => {
          const reqSkills = job.requiredSkills || [];
          return (
            <TouchableOpacity
              key={`match-${job.id}`}
              onPress={() => onSelectJob(job)}
              className="w-72 bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4 mr-3 shadow-xl relative"
            >
              {/* Score Pill */}
              <View className="flex-row justify-between items-center mb-2">
                <View className="bg-amber-500 px-2.5 py-0.5 rounded-full shadow-md">
                  <Text className="text-slate-950 font-black text-xs">{scorePercentage}% Match</Text>
                </View>
                <Text className="text-emerald-400 font-bold text-xs">{job.currency || '₦'}{job.budget}</Text>
              </View>

              <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>{job.title}</Text>
              <Text className="text-slate-400 text-xs mb-3">{job.company} • {job.location}</Text>

              {/* Matched Skill Highlights */}
              <View className="bg-slate-950/80 rounded-xl p-2 mb-3 border border-slate-800">
                <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Matched Competencies:</Text>
                <View className="flex-row flex-wrap">
                  {reqSkills.map(sk => {
                    const isMatched = matchingSkills.includes(sk);
                    return (
                      <View
                        key={sk}
                        className={`px-1.5 py-0.5 rounded mr-1 mb-1 border ${
                          isMatched ? 'bg-amber-500/20 border-amber-500/40' : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <Text className={`text-[9px] ${isMatched ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                          {isMatched ? '✓ ' : ''}{sk}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View className="flex-row justify-between items-center pt-2 border-t border-slate-800">
                <Text className="text-slate-500 text-[10px]">Deadline: {job.deadline}</Text>
                <View className="flex-row items-center">
                  <Text className="text-amber-400 font-bold text-xs mr-1">Quick Apply</Text>
                  <ArrowRight size={12} color="#F59E0B" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
