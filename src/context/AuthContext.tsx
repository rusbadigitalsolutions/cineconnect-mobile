import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Profile, UserRole } from '../types';
import { registerForPushNotificationsAsync } from '../lib/pushNotifications';

interface AuthContextType {
  user: Profile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogleCredential: (idToken: string) => Promise<void>;
  setRoleAndOnboarding: (role: UserRole, location: string, skills: string[]) => Promise<void>;
  updateUserProfile: (updates: Partial<Profile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      if (auth) {
        unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          setFirebaseUser(fbUser);
          if (fbUser) {
            // Fetch profile from /users/{uid}
            try {
              if (db) {
                const userRef = doc(db, 'users', fbUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const profileData = userSnap.data() as Profile;
                  setUser(profileData);
                  registerForPushNotificationsAsync(fbUser.uid);
                } else {
                  // Initial user profile for newly authenticated user
                  const newProf: Profile = {
                    uid: fbUser.uid,
                    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Film Creative',
                    email: fbUser.email || '',
                    role: 'Actor/Actress',
                    location: 'Lagos, Nigeria',
                    timezone: 'GMT+1 (WAT)',
                    skills: ['Acting', 'Voiceover'],
                    avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                    verified: false,
                    premium: false,
                    isAdmin: (fbUser.email || '').includes('admin')
                  };
                  await setDoc(userRef, newProf);
                  setUser(newProf);
                }
              }
            } catch (err) {
              console.warn('Error fetching Firestore user profile:', err);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.warn('Firebase auth state listener warning:', err);
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized. Please check network connection.");
    }
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user && db) {
      const userSnap = await getDoc(doc(db, 'users', res.user.uid));
      if (userSnap.exists()) {
        setUser(userSnap.data() as Profile);
      }
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized. Please check network connection.");
    }
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const newProf: Profile = {
      uid: res.user.uid,
      name,
      email,
      role: 'Actor/Actress',
      location: 'Lagos, Nigeria',
      timezone: 'GMT+1 (WAT)',
      skills: ['Acting'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      verified: false,
      premium: false,
      isAdmin: email.includes('admin')
    };
    if (db) {
      await setDoc(doc(db, 'users', res.user.uid), newProf);
    }
    setUser(newProf);
  };

  const signInWithGoogleCredential = async (idToken: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized.");
    }
    const credential = GoogleAuthProvider.credential(idToken);
    const res = await signInWithCredential(auth, credential);
    if (res.user && db) {
      const userRef = doc(db, 'users', res.user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser(userSnap.data() as Profile);
      } else {
        const newProf: Profile = {
          uid: res.user.uid,
          name: res.user.displayName || 'Google User',
          email: res.user.email || '',
          role: 'Actor/Actress',
          location: 'Lagos, Nigeria',
          timezone: 'GMT+1 (WAT)',
          skills: ['Acting'],
          avatar: res.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          verified: false,
          premium: false,
          isAdmin: (res.user.email || '').includes('admin')
        };
        await setDoc(userRef, newProf);
        setUser(newProf);
      }
    }
  };

  const setRoleAndOnboarding = async (role: UserRole, location: string, skills: string[]) => {
    if (!user) return;
    const updated = { ...user, role, location, skills };
    setUser(updated);
    try {
      if (db && firebaseUser) {
        await updateDoc(doc(db, 'users', firebaseUser.uid), { role, location, skills });
      }
    } catch (e) {
      console.warn('Role update error:', e);
    }
  };

  const updateUserProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      if (db && user.uid) {
        await updateDoc(doc(db, 'users', user.uid), updates);
      }
    } catch (e) {
      console.warn('Profile update warning:', e);
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      signIn,
      signUp,
      signInWithGoogleCredential,
      setRoleAndOnboarding,
      updateUserProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
