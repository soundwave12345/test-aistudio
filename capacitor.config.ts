import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.subsonic.geministreamer',
  appName: 'Subsonic Gemini Streamer',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;