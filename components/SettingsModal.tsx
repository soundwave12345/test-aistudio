import React, { useState, useEffect } from 'react';
import { X, Server, User, Lock, Globe } from 'lucide-react';
import { SubsonicCredentials } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: SubsonicCredentials;
  onSave: (creds: SubsonicCredentials, isDemo: boolean) => void;
  isDemo: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, credentials, onSave, isDemo }) => {
  const [url, setUrl] = useState(credentials.url);
  const [username, setUsername] = useState(credentials.username);
  const [password, setPassword] = useState(credentials.password || '');
  const [demoMode, setDemoMode] = useState(isDemo);

  useEffect(() => {
    if (isOpen) {
      setUrl(credentials.url);
      setUsername(credentials.username);
      setPassword(credentials.password || '');
      setDemoMode(isDemo);
    }
  }, [isOpen, credentials, isDemo]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ url, username, password }, demoMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-subsonic-card w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white">Server Settings</h2>
          <button onClick={onClose} className="text-subsonic-secondary hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Demo Toggle */}
           <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-sm font-medium text-white">Use Demo Mode (Mock Data)</span>
             <button 
                onClick={() => setDemoMode(!demoMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${demoMode ? 'bg-subsonic-primary' : 'bg-gray-600'}`}
             >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
          </div>

          {!demoMode && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-subsonic-secondary uppercase tracking-wider">Server URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-subsonic-secondary" size={18} />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://music.example.com"
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-subsonic-primary focus:ring-1 focus:ring-subsonic-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-subsonic-secondary uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-subsonic-secondary" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-subsonic-primary focus:ring-1 focus:ring-subsonic-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-subsonic-secondary uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-subsonic-secondary" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-subsonic-primary focus:ring-1 focus:ring-subsonic-primary transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleSave}
            className="w-full bg-subsonic-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors mt-4 shadow-lg shadow-orange-900/20"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;