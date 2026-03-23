export type Database = {
  graphql_public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Record<string, unknown>
          extensions?: Record<string, unknown>
        }
        Returns: Record<string, unknown>
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          id: string
          parent_id: string
          name: string
          age: number
          medical_info: string | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          age: number
          medical_info?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          age?: number
          medical_info?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'children_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      bookings: {
        Row: {
          id: string
          parent_id: string
          child_id: string
          class_type: string
          booking_type: string
          status: string
          emergency_contact: string
          emergency_phone: string
          location: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          child_id: string
          class_type: string
          booking_type: string
          status?: string
          emergency_contact: string
          emergency_phone: string
          location: string
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          child_id?: string
          class_type?: string
          booking_type?: string
          status?: string
          emergency_contact?: string
          emergency_phone?: string
          location?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
            referencedColumns: ['id']
          },
        ]
      }
      sessions: {
        Row: {
          id: string
          class_type: string
          session_date: string
          cancelled: boolean
          cancel_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          class_type: string
          session_date: string
          cancelled?: boolean
          cancel_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          class_type?: string
          session_date?: string
          cancelled?: boolean
          cancel_reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
      session_credits: {
        Row: {
          id: string
          child_id: string
          session_id: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          session_id: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          session_id?: string
          used?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_credits_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_credits_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Child = Database['public']['Tables']['children']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionCredit = Database['public']['Tables']['session_credits']['Row']
