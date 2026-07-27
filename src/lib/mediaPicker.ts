import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { storage } from './firebase';

export async function pickMediaAsync(mediaTypes: 'image' | 'video' | 'all' = 'all') {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return null;
    }

    const type = mediaTypes === 'image' 
      ? ImagePicker.MediaTypeOptions.Images 
      : mediaTypes === 'video' 
        ? ImagePicker.MediaTypeOptions.Videos 
        : ImagePicker.MediaTypeOptions.All;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type,
      allowsEditing: true,
      quality: 0.8,
      base64: true
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Error picking media:', error);
    return null;
  }
}

export async function uploadMediaToStorage(localUri: string, folder: string = 'posts', base64Data?: string): Promise<string> {
  try {
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Attempt Firebase Storage Upload
    if (storage) {
      const storageRef = ref(storage, filename);
      const response = await fetch(localUri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    }
    
    // Fallback if storage offline or using base64
    if (base64Data) {
      return `data:image/jpeg;base64,${base64Data}`;
    }
    return localUri;
  } catch (err) {
    console.warn('Storage upload error, using local URI fallback:', err);
    if (base64Data) {
      return `data:image/jpeg;base64,${base64Data}`;
    }
    return localUri;
  }
}
