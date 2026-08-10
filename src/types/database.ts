export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          title: string | null;
          location: string | null;
          website: string | null;
          github_username: string | null;
          github_url: string | null;
          tech_stack: string[] | null;
          is_verified: boolean;
          followers_count: number;
          following_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          title?: string | null;
          location?: string | null;
          website?: string | null;
          github_username?: string | null;
          github_url?: string | null;
          tech_stack?: string[] | null;
          is_verified?: boolean;
          followers_count?: number;
          following_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          content: string;
          image_url: string | null;
          source: 'manual' | 'github' | 'devto' | 'reddit';
          source_url: string | null;
          likes_count: number;
          comments_count: number;
          shares_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          content: string;
          image_url?: string | null;
          source?: 'manual' | 'github' | 'devto' | 'reddit';
          source_url?: string | null;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
        Relationships: [];
      };
      likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['likes']['Insert']>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
        Relationships: [];
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['follows']['Insert']>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          is_group: boolean;
          title: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          is_group?: boolean;
          title?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
        Relationships: [];
      };
      conversation_members: {
        Row: {
          conversation_id: string;
          user_id: string;
          last_read_at: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          last_read_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversation_members']['Insert']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          actor_id: string | null;
          type: string;
          entity_id: string | null;
          content: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          actor_id?: string | null;
          type: string;
          entity_id?: string | null;
          content?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
        Relationships: [];
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image: string | null;
          cover: string | null;
          category: string | null;
          is_public: boolean;
          created_by: string | null;
          members_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image?: string | null;
          cover?: string | null;
          category?: string | null;
          is_public?: boolean;
          created_by?: string | null;
          members_count?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['communities']['Insert']>;
        Relationships: [];
      };
      community_members: {
        Row: {
          community_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          community_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: Partial<Database['public']['Tables']['community_members']['Insert']>;
        Relationships: [];
      };
      community_posts: {
        Row: {
          id: string;
          community_id: string;
          author_id: string;
          content: string;
          likes_count: number;
          comments_count: number;
          shares_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          author_id: string;
          content: string;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['community_posts']['Insert']>;
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          company: string;
          company_logo: string | null;
          location: string | null;
          category: string | null;
          contract_type: string | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          is_free: boolean;
          description: string | null;
          requirements: string[] | null;
          is_remote: boolean;
          posted_by: string | null;
          listed_ago: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          company: string;
          company_logo?: string | null;
          location?: string | null;
          category?: string | null;
          contract_type?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          is_free?: boolean;
          description?: string | null;
          requirements?: string[] | null;
          is_remote?: boolean;
          posted_by?: string | null;
          listed_ago?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
        Relationships: [];
      };
      shorts: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          video_url: string | null;
          poster: string | null;
          audio: string | null;
          source: string;
          source_url: string | null;
          created_by: string | null;
          likes_count: number;
          comments_count: number;
          shares_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          video_url?: string | null;
          poster?: string | null;
          audio?: string | null;
          source?: string;
          source_url?: string | null;
          created_by?: string | null;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['shorts']['Insert']>;
        Relationships: [];
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string | null;
          difficulty: string | null;
          image: string | null;
          participants_count: number;
          ends_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category?: string | null;
          difficulty?: string | null;
          image?: string | null;
          participants_count?: number;
          ends_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>;
        Relationships: [];
      };
      challenge_participants: {
        Row: {
          challenge_id: string;
          user_id: string;
          score: number;
          created_at: string;
        };
        Insert: {
          challenge_id: string;
          user_id: string;
          score?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['challenge_participants']['Insert']>;
        Relationships: [];
      };
      news: {
        Row: {
          id: string;
          title: string;
          summary: string | null;
          body: string | null;
          image: string | null;
          source: string;
          source_url: string | null;
          author: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          summary?: string | null;
          body?: string | null;
          image?: string | null;
          source?: string;
          source_url?: string | null;
          author?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['news']['Insert']>;
        Relationships: [];
      };
      saved_posts: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['saved_posts']['Insert']>;
        Relationships: [];
      };
      trending_hashtags: {
        Row: {
          id: string;
          name: string;
          count: number;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          count?: number;
          last_seen_at?: string;
        };
        Update: Partial<Database['public']['Tables']['trending_hashtags']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_post_likes: {
        Args: { post_id: string; delta: number };
        Returns: undefined;
      };
      increment_post_comments: {
        Args: { post_id: string; delta: number };
        Returns: undefined;
      };
      upsert_hashtag: {
        Args: { p_name: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
