import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MapPin, Tag } from 'lucide-react-native';
import { MarketplaceItem } from '../types';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onContactVendor: (item: MarketplaceItem) => void;
}

export const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = React.memo(({ item, onContactVendor }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Equipment': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Location': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Costumes': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <View className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex-1 m-1.5">
      <View className="relative h-36 bg-slate-950">
        <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
        <View className="absolute top-2 left-2 flex-row">
          <View className={`px-2 py-0.5 rounded-md border ${getCategoryColor(item.category)}`}>
            <Text className="text-[9px] font-bold">{item.category}</Text>
          </View>
        </View>

        <View className="absolute bottom-2 right-2 bg-slate-950/90 px-2 py-1 rounded-lg border border-slate-800">
          <Text className="text-amber-400 font-extrabold text-xs">
            ${item.price}<Text className="text-slate-400 text-[10px]">/{item.period}</Text>
          </Text>
        </View>
      </View>

      <View className="p-3">
        <Text className="text-white font-bold text-xs mb-1" numberOfLines={1}>{item.title}</Text>
        <Text className="text-slate-400 text-[10px] mb-2">{item.vendorName}</Text>

        <View className="flex-row items-center mb-3">
          <MapPin size={11} color="#64748B" />
          <Text className="text-slate-400 text-[10px] ml-1 flex-1" numberOfLines={1}>{item.location}</Text>
        </View>

        <TouchableOpacity
          onPress={() => onContactVendor(item)}
          className="bg-amber-500 active:bg-amber-600 rounded-xl py-2 items-center"
        >
          <Text className="text-slate-950 font-bold text-[11px]">Rent / Inquire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
