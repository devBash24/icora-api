declare namespace NodeJS {
    export interface ProcessEnv {
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      API_KEY?: string;
      SUPABASE_URL?: string;
      SUPABASE_KEY?: string;
    }
  }
  