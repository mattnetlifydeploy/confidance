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
          term_name: string | null
          term_year: number | null
          sibling_discount_pct: number | null
          amount_paid_pence: number
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
          term_name?: string | null
          term_year?: number | null
          sibling_discount_pct?: number | null
          amount_paid_pence?: number
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
          term_name?: string | null
          term_year?: number | null
          sibling_discount_pct?: number | null
          amount_paid_pence?: number
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
      admin_audit_log: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          target_type: string
          target_id: string | null
          payload: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          target_type: string
          target_id?: string | null
          payload?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          target_type?: string
          target_id?: string | null
          payload?: Record<string, unknown>
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'admin_audit_log_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      attendance: {
        Row: {
          id: string
          child_id: string
          session_date: string
          class_type: string
          checked_in_at: string
          checked_in_by: string | null
        }
        Insert: {
          id?: string
          child_id: string
          session_date: string
          class_type: string
          checked_in_at?: string
          checked_in_by?: string | null
        }
        Update: {
          id?: string
          child_id?: string
          session_date?: string
          class_type?: string
          checked_in_at?: string
          checked_in_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'attendance_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attendance_checked_in_by_fkey'
            columns: ['checked_in_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      walk_ins: {
        Row: {
          id: string
          parent_name: string
          parent_phone: string | null
          parent_email: string | null
          child_name: string
          child_age: number | null
          class_type: string
          session_date: string
          amount_paid_pence: number | null
          payment_method: string | null
          notes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          parent_name: string
          parent_phone?: string | null
          parent_email?: string | null
          child_name: string
          child_age?: number | null
          class_type: string
          session_date: string
          amount_paid_pence?: number | null
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          parent_name?: string
          parent_phone?: string | null
          parent_email?: string | null
          child_name?: string
          child_age?: number | null
          class_type?: string
          session_date?: string
          amount_paid_pence?: number | null
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'walk_ins_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      banners: {
        Row: {
          id: string
          body: string
          audience: string
          published_at: string
          expires_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          body: string
          audience: string
          published_at?: string
          expires_at?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          body?: string
          audience?: string
          published_at?: string
          expires_at?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'banners_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      waivers: {
        Row: {
          id: string
          title: string
          body_md: string
          published_at: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          body_md: string
          published_at?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          body_md?: string
          published_at?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'waivers_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      waiver_signatures: {
        Row: {
          id: string
          waiver_id: string
          parent_id: string
          child_id: string | null
          signature_text: string
          signed_at: string
        }
        Insert: {
          id?: string
          waiver_id: string
          parent_id: string
          child_id?: string | null
          signature_text: string
          signed_at?: string
        }
        Update: {
          id?: string
          waiver_id?: string
          parent_id?: string
          child_id?: string | null
          signature_text?: string
          signed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'waiver_signatures_waiver_id_fkey'
            columns: ['waiver_id']
            isOneToOne: false
            referencedRelation: 'waivers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'waiver_signatures_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'waiver_signatures_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
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
export type AdminAuditLog = Database['public']['Tables']['admin_audit_log']['Row']
export type AdminAuditLogInsert = Database['public']['Tables']['admin_audit_log']['Insert']
export type SessionCredit = Database['public']['Tables']['session_credits']['Row']
export type Attendance = Database['public']['Tables']['attendance']['Row']
export type WalkIn = Database['public']['Tables']['walk_ins']['Row']
export type Waiver = Database['public']['Tables']['waivers']['Row']
export type WaiverSignature = Database['public']['Tables']['waiver_signatures']['Row']
