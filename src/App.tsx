import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { HomeScreenView } from './components/screens/HomeScreenView';
import { MissionDetailView } from './components/screens/MissionDetailView';
import { AICoachModalView } from './components/screens/AICoachModalView';
import { MarketplaceView } from './components/screens/MarketplaceView';
import { ProfileView } from './components/screens/ProfileView';
import { AuthScreenView } from './components/screens/AuthScreenView';
import { initialMissions, initialMarketplaceItems } from './data/initialData';
import { Mission, TabType, DeviceFrame, MarketplaceItem } from './types';

export default function App() {
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>('iphone16');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedMissionId, setSelectedMissionId] = useState<string>('m2');

  // Load persistent missions or initial state
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem('lifekit_missions');
      return saved ? JSON.parse(saved) : initialMissions;
    } catch {
      return initialMissions;
    }
  });

  const [marketplaceItems] = useState<MarketplaceItem[]>(initialMarketplaceItems);
  const [showAICoach, setShowAICoach] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password'>('login');

  const handleOpenAuth = (mode: 'login' | 'signup' | 'forgot-password' = 'login') => {
    setAuthMode(mode);
    setActiveTab('auth');
  };

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lifekit_missions', JSON.stringify(missions));
    } catch (e) {
      console.error(e);
    }
  }, [missions]);

  // Handle task toggling (Riverpod-style state update)
  const handleToggleTask = (missionId: string, taskId: string) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) => {
        if (mission.id === missionId) {
          return {
            ...mission,
            tasks: mission.tasks.map((task) =>
              task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
            ),
          };
        }
        return mission;
      })
    );
  };

  // Add task to mission
  const handleAddTask = (missionId: string, taskTitle: string) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) => {
        if (mission.id === missionId) {
          const newTask = {
            id: `t_${Date.now()}`,
            title: taskTitle,
            isCompleted: false,
            difficulty: 'Medium' as const,
          };
          return {
            ...mission,
            tasks: [...mission.tasks, newTask],
          };
        }
        return mission;
      })
    );
  };

  // Add new mission
  const handleAddMission = (newMission: Mission) => {
    setMissions((prev) => [newMission, ...prev]);
  };

  const selectedMission = missions.find((m) => m.id === selectedMissionId) || missions[0];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-[#7C3AED] selection:text-white">
      {/* Top Bar Header */}
      <Header
        deviceFrame={deviceFrame}
        setDeviceFrame={setDeviceFrame}
      />

      {/* Main App Content View */}
      <main className="flex-1 flex flex-col">
        <MobileDeviceFrame
          deviceFrame={deviceFrame}
          activeTab={activeTab}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
          }}
        >
          {activeTab === 'home' && (
            <HomeScreenView
              missions={missions}
              onSelectMission={(id) => {
                setSelectedMissionId(id);
                setActiveTab('mission');
              }}
              onNavigateTab={setActiveTab}
              onAddMission={handleAddMission}
            />
          )}

          {activeTab === 'mission' && (
            <MissionDetailView
              mission={selectedMission}
              onBack={() => setActiveTab('home')}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onOpenAICoach={() => setShowAICoach(true)}
            />
          )}

          {activeTab === 'marketplace' && <MarketplaceView items={marketplaceItems} />}

          {activeTab === 'profile' && <ProfileView onOpenAuth={handleOpenAuth} />}

          {activeTab === 'auth' && (
            <AuthScreenView
              initialMode={authMode}
              onLoginSuccess={() => setActiveTab('home')}
            />
          )}

          {showAICoach && (
            <AICoachModalView
              mission={selectedMission}
              onClose={() => setShowAICoach(false)}
            />
          )}
        </MobileDeviceFrame>
      </main>
    </div>
  );
}

