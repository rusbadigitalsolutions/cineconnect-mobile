import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { X, Plus, Store, Camera, CheckCircle } from 'lucide-react-native';
import { MarketplaceItem, MarketplaceCategory } from '../types';
import { pickMediaAsync, uploadMediaToStorage } from '../lib/mediaPicker';
import { useAuth } from '../context/AuthContext';

interface VendorDashboardModalProps {
  visible: boolean;
  onClose: () => void;
  myItems: MarketplaceItem[];
  onAddItem: (item: Omit<MarketplaceItem, 'id' | 'createdAt'>) => Promise<void>;
  onToggleStatus: (itemId: string, status: 'available' | 'rented' | 'unavailable') => void;
}

export const VendorDashboardModal: React.FC<VendorDashboardModalProps> = ({
  visible,
  onClose,
  myItems,
  onAddItem,
  onToggleStatus
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'add'>('inventory');

  // New Item Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory>('Equipment');
  const [price, setPrice] = useState('150');
  const [period, setPeriod] = useState<'hour' | 'day' | 'week'>('day');
  const [location, setLocation] = useState(user?.location || 'Lagos, Nigeria');
  const [imageAsset, setImageAsset] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePickPhoto = async () => {
    const asset = await pickMediaAsync('image');
    if (asset) {
      setImageAsset(asset);
    }
  };

  const handleCreateItem = async () => {
    if (!title.trim() || !user) return;
    setSubmitting(true);
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=600';
      if (imageAsset?.uri) {
        imageUrl = await uploadMediaToStorage(imageAsset.uri, 'marketplace', imageAsset.base64);
      }

      await onAddItem({
        title: title.trim(),
        category,
        price: parseFloat(price) || 100,
        period,
        location,
        imageUrl,
        status: 'available',
        vendorId: user.uid,
        vendorName: user.name
      });

      setTitle('');
      setImageAsset(null);
      setActiveTab('inventory');
    } catch (e) {
      console.error('Add vendor item error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-slate-950/90 justify-end">
        <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 h-[85%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-slate-800">
            <View className="flex-row items-center">
              <Store size={20} color="#F59E0B" className="mr-2" />
              <View>
                <Text className="text-xl font-bold text-white">Vendor Store Portal</Text>
                <Text className="text-slate-400 text-xs">Manage rental listings & store inventory</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-800 rounded-full">
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Sub Tabs */}
          <View className="flex-row bg-slate-950 p-1 rounded-xl mb-4 border border-slate-800">
            <TouchableOpacity
              onPress={() => setActiveTab('inventory')}
              className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'inventory' ? 'bg-amber-500' : ''}`}
            >
              <Text className={`font-bold text-xs ${activeTab === 'inventory' ? 'text-slate-950' : 'text-slate-400'}`}>
                My Store Inventory ({myItems.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('add')}
              className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'add' ? 'bg-amber-500' : ''}`}
            >
              <Text className={`font-bold text-xs ${activeTab === 'add' ? 'text-slate-950' : 'text-slate-400'}`}>
                + List New Item
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {activeTab === 'inventory' ? (
              myItems.length > 0 ? (
                myItems.map(item => (
                  <View key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-2">
                      <Image source={{ uri: item.imageUrl }} className="w-14 h-14 rounded-xl mr-3" />
                      <View className="flex-1">
                        <Text className="text-white font-bold text-xs" numberOfLines={1}>{item.title}</Text>
                        <Text className="text-amber-400 font-bold text-[11px]">${item.price}/{item.period}</Text>
                        <Text className="text-slate-500 text-[10px]">{item.category}</Text>
                      </View>
                    </View>

                    {/* Status Toggles */}
                    <View className="flex-row space-x-1">
                      {(['available', 'rented', 'unavailable'] as const).map(st => (
                        <TouchableOpacity
                          key={st}
                          onPress={() => onToggleStatus(item.id, st)}
                          className={`px-2 py-1 rounded-md border ${
                            item.status === st ? 'bg-amber-500 border-amber-500' : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <Text className={`text-[9px] font-bold ${item.status === st ? 'text-slate-950' : 'text-slate-400'}`}>
                            {st}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-12 items-center">
                  <Store size={36} color="#64748B" />
                  <Text className="text-slate-400 text-xs mt-2">No active items in your vendor store yet.</Text>
                </View>
              )
            ) : (
              /* Add New Item Form */
              <View>
                <TouchableOpacity
                  onPress={handlePickPhoto}
                  className="bg-slate-950 border-2 border-dashed border-amber-500/40 rounded-2xl p-6 items-center mb-4"
                >
                  <Camera size={28} color="#F59E0B" className="mb-1" />
                  <Text className="text-white font-bold text-xs">
                    {imageAsset ? 'Item Photo Captured ✓' : 'Capture / Pick Item Photo'}
                  </Text>
                </TouchableOpacity>

                <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Listing Title</Text>
                <TextInput
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs mb-3"
                  placeholder="e.g. RED V-Raptor 8K Camera Package"
                  placeholderTextColor="#64748B"
                  value={title}
                  onChangeText={setTitle}
                />

                <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Category</Text>
                <View className="flex-row flex-wrap mb-3">
                  {(['Equipment', 'Location', 'Props', 'Costumes', 'Services'] as const).map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={`mr-2 mb-2 px-3 py-1.5 rounded-full border ${
                        category === cat ? 'bg-amber-500 border-amber-500' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <Text className={`text-xs font-bold ${category === cat ? 'text-slate-950' : 'text-slate-400'}`}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="flex-row space-x-3 mb-3">
                  <View className="flex-1">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Price ($)</Text>
                    <TextInput
                      className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs"
                      keyboardType="numeric"
                      value={price}
                      onChangeText={setPrice}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Rental Period</Text>
                    <View className="flex-row space-x-1">
                      {(['hour', 'day', 'week'] as const).map(p => (
                        <TouchableOpacity
                          key={p}
                          onPress={() => setPeriod(p)}
                          className={`flex-1 py-3 rounded-xl border items-center ${
                            period === p ? 'bg-amber-500 border-amber-500' : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <Text className={`text-[10px] font-bold ${period === p ? 'text-slate-950' : 'text-slate-400'}`}>
                            {p}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleCreateItem}
                  disabled={submitting || !title.trim()}
                  className={`rounded-xl py-3.5 items-center shadow-lg mt-2 ${
                    title.trim() ? 'bg-amber-500 shadow-amber-500/20' : 'bg-slate-800'
                  }`}
                >
                  {submitting ? (
                    <ActivityIndicator color="#0F172A" />
                  ) : (
                    <Text className={`font-bold text-xs uppercase tracking-wider ${title.trim() ? 'text-slate-950' : 'text-slate-500'}`}>
                      Save Item to Marketplace
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
