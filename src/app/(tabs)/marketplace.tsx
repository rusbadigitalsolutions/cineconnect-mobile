import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Store } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { MarketplaceItemCard } from '../../components/MarketplaceItemCard';
import { VendorDashboardModal } from '../../components/VendorDashboardModal';
import { db } from '../../lib/firebase';
import { MarketplaceItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function MarketplaceScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [vendorModalVisible, setVendorModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      if (db) {
        const mRef = collection(db, 'marketplaceItems');
        unsubscribe = onSnapshot(mRef, (snap) => {
          const fetched: MarketplaceItem[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as MarketplaceItem));
          setItems(fetched);
        });
      }
    } catch(e){}
    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => {
    if (selectedCat === 'All') return true;
    return item.category === selectedCat;
  });

  const myStoreItems = items.filter(item => item.vendorId === user?.uid);

  const handleContactVendor = useCallback((item: MarketplaceItem) => {
    Alert.alert(
      `Inquire About ${item.title}`,
      `Vendor: ${item.vendorName}\nRate: ₦${item.price}/${item.period}\nLocation: ${item.location}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' }
      ]
    );
  }, []);

  const handleAddVendorItem = async (newItemData: Omit<MarketplaceItem, 'id' | 'createdAt'>) => {
    const created: MarketplaceItem = {
      ...newItemData,
      id: `item-${Date.now()}`,
      createdAt: 'Just now'
    };

    setItems([created, ...items]);
    try {
      if (db) {
        await addDoc(collection(db, 'marketplaceItems'), created);
      }
    } catch(e){}
  };

  const handleToggleStatus = (itemId: string, status: 'available' | 'rented' | 'unavailable') => {
    setItems(prev => prev.map(it => {
      if (it.id === itemId) {
        try {
          if (db) {
            updateDoc(doc(db, 'marketplaceItems', itemId), { status });
          }
        } catch(e){}
        return { ...it, status };
      }
      return it;
    }));
  };

  const renderMarketplaceItem = useCallback(({ item }: { item: MarketplaceItem }) => (
    <MarketplaceItemCard item={item} onContactVendor={handleContactVendor} />
  ), [handleContactVendor]);

  const keyExtractor = useCallback((item: MarketplaceItem) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <Header title="Marketplace & Rentals" subtitle="Equipment, Locations & Costumes" />

      {/* Category Toggles & Vendor Portal trigger */}
      <View className="bg-slate-900 border-b border-slate-800 p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-bold text-sm">Rental Categories</Text>
          <TouchableOpacity
            onPress={() => setVendorModalVisible(true)}
            className="bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-xl flex-row items-center"
          >
            <Store size={14} color="#F59E0B" className="mr-1.5" />
            <Text className="text-amber-400 font-bold text-xs">Manage My Store</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', 'Equipment', 'Location', 'Costumes', 'Props', 'Services']}
          keyExtractor={item => item}
          renderItem={({ item }) => {
            const active = selectedCat === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCat(item)}
                className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                  active ? 'bg-amber-500 border-amber-500' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <Text className={`text-xs font-bold ${active ? 'text-slate-950' : 'text-slate-400'}`}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Bento Grid */}
      <FlatList
        data={filteredItems}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={{ padding: 10 }}
        renderItem={renderMarketplaceItem}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
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
            <Text className="text-lg font-bold text-white mb-2">No Marketplace Listings</Text>
            <Text className="text-slate-400 text-xs text-center">
              Equipment rentals, shooting locations, and props listed in Firestore will appear here.
            </Text>
          </View>
        }
      />

      <VendorDashboardModal
        visible={vendorModalVisible}
        onClose={() => setVendorModalVisible(false)}
        myItems={myStoreItems}
        onAddItem={handleAddVendorItem}
        onToggleStatus={handleToggleStatus}
      />
    </SafeAreaView>
  );
}
