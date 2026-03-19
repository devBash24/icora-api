declare namespace NodeJS {
    export interface ProcessEnv {
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      API_KEY?: string;
      DATABASE_URL?: string;
      SUPABASE_DUMP_PATH?: string;
    }
  }
