export interface Icon {
    id: number;
    name: string;
    folder: string;
    content: string;
    created_at: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  