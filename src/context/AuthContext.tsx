import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { StudentTelemetry, AdaptiveResponse, SkillRoadmapData } from '../types/learning.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveSessionToFirestore: (telemetry: StudentTelemetry, adaptive: AdaptiveResponse) => Promise<void>;
  saveRoadmapToFirestore: (roadmap: SkillRoadmapData) => Promise<void>;
  loadSavedRoadmaps: () => Promise<SkillRoadmapData[]>;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Sync or update profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Learner',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              streakCount: 1,
              totalXP: 100,
              totalStepsCompleted: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn('Profile sync warning:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  const saveSessionToFirestore = async (telemetry: StudentTelemetry, adaptive: AdaptiveResponse) => {
    if (!user) return;
    setIsSyncing(true);
    const sessionPath = `users/${user.uid}/sessions/${telemetry.sessionId}`;
    try {
      const sessionRef = doc(db, 'users', user.uid, 'sessions', telemetry.sessionId);
      await setDoc(
        sessionRef,
        {
          sessionId: telemetry.sessionId,
          userId: user.uid,
          skillGoal: telemetry.skillGoal,
          currentFocusScore: adaptive.real_time_metrics.current_focus_score,
          momentumStatus: adaptive.real_time_metrics.momentum_status,
          adaptiveLayout: adaptive.adaptive_ui_layout,
          stepsCompleted: telemetry.totalStepsCompleted,
          timeSpentSec: telemetry.timeSpentOnCurrentStepSec,
          hintsClicked: telemetry.hintsClicked,
          quizAttempts: telemetry.quizAttempts,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Also update user profile stats
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          streakCount: telemetry.streakCount,
          totalXP: telemetry.totalStepsCompleted * 150 + telemetry.streakCount * 50,
          totalStepsCompleted: telemetry.totalStepsCompleted,
          activeSkillGoal: telemetry.skillGoal,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, sessionPath);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveRoadmapToFirestore = async (roadmap: SkillRoadmapData) => {
    if (!user) return;
    setIsSyncing(true);
    const roadmapId = `rm-${roadmap.skillGoal.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`;
    const path = `users/${user.uid}/roadmaps/${roadmapId}`;
    try {
      const roadmapRef = doc(db, 'users', user.uid, 'roadmaps', roadmapId);
      await setDoc(roadmapRef, {
        roadmapId,
        userId: user.uid,
        skillGoal: roadmap.skillGoal,
        summary: roadmap.summary.slice(0, 990),
        mermaidRoadmap: roadmap.mermaidRoadmap.slice(0, 7900),
        stepsCount: roadmap.steps.length,
        updatedAt: new Date().toISOString(),
      });
      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadSavedRoadmaps = async (): Promise<SkillRoadmapData[]> => {
    if (!user) return [];
    const path = `users/${user.uid}/roadmaps`;
    try {
      const q = query(collection(db, 'users', user.uid, 'roadmaps'), limit(10));
      const snaps = await getDocs(q);
      const roadmaps: any[] = [];
      snaps.forEach((doc) => roadmaps.push(doc.data()));
      return roadmaps as SkillRoadmapData[];
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logout,
        saveSessionToFirestore,
        saveRoadmapToFirestore,
        loadSavedRoadmaps,
        isSyncing,
        lastSyncedAt,
      }}
    >
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
