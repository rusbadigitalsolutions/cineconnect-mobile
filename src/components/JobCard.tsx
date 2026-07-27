import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, DollarSign, Calendar, ChevronRight } from 'lucide-react-native';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  matchScore?: number;
  onApply: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = React.memo(({ job, matchScore, onApply }) => {
  return (
    <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 shadow-lg">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{job.title}</Text>
          <Text className="text-amber-400 font-semibold text-xs">{job.company}</Text>
        </View>

        {matchScore !== undefined && (
          <View className="bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full">
            <Text className="text-amber-400 text-xs font-black">{matchScore}% Match</Text>
          </View>
        )}
      </View>

      <Text className="text-slate-300 text-xs mb-3 leading-5" numberOfLines={2}>{job.description}</Text>

      {/* Skills Tags */}
      <View className="flex-row flex-wrap mb-3">
        {job.requiredSkills.map((sk) => (
          <View key={sk} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg mr-1.5 mb-1.5">
            <Text className="text-slate-400 text-[10px] font-semibold">{sk}</Text>
          </View>
        ))}
      </View>

      {/* Meta Footer */}
      <View className="flex-row items-center justify-between pt-3 border-t border-slate-800">
        <View className="flex-row items-center space-x-3">
          <View className="flex-row items-center mr-3">
            <DollarSign size={13} color="#10B981" />
            <Text className="text-emerald-400 font-bold text-xs">{job.currency}{job.budget}</Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={13} color="#64748B" />
            <Text className="text-slate-400 text-xs ml-1">{job.location}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onApply(job)}
          className="bg-amber-500 active:bg-amber-600 px-4 py-2 rounded-xl flex-row items-center shadow-sm"
        >
          <Text className="text-slate-950 font-bold text-xs mr-1">Apply Now</Text>
          <ChevronRight size={14} color="#0F172A" />
        </TouchableOpacity>
      </View>
    </View>
  );
});
