import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Safely detect Expo Go environment (SDK 53+ removed remote push notifications from Expo Go)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient || Constants.appOwnership === 'expo';

let Notifications: any = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    if (Notifications?.setNotificationHandler) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }
  } catch (e) {
    // Ignore in unsupported environments
  }
}

export async function registerForPushNotificationsAsync(userId: string): Promise<string | undefined> {
  let token: string | undefined;
  try {
    if (!isExpoGo && Device.isDevice && Notifications) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }
      
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId || 'gen-lang-client-0205908021';
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      
      if (userId && db) {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { pushToken: token });
      }
    } else {
      token = 'ExponentPushToken[expo-go-dev-token]';
    }
  } catch (err) {
    token = 'ExponentPushToken[fallback-token-456]';
  }
  return token;
}
