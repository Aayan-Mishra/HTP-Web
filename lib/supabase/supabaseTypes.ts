// This file contains TypeScript types for the Hometown Pharmacy database schema
// Updated to match schema.sql with Clerk authentication

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'ready' | 'completed';
export type MembershipStatus = 'active' | 'expired' | 'cancelled';
export type MembershipTier = 'bronze' | 'silver' | 'gold';
export type StaffRole = 'staff' | 'admin';

export interface Database {
  public: {
    Tables: {
      customer_profiles: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          full_name: string;
          phone: string | null;
          address: string | null;
          membership_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          address?: string | null;
          membership_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          address?: string | null;
          membership_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medicines: {
        Row: {
          id: string;
          generic_name: string;
          brand_name: string | null;
          category: string;
          manufacturer: string | null;
          description: string | null;
          requires_prescription: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          generic_name: string;
          brand_name?: string | null;
          category: string;
          manufacturer?: string | null;
          description?: string | null;
          requires_prescription?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          generic_name?: string;
          brand_name?: string | null;
          category?: string;
          manufacturer?: string | null;
          description?: string | null;
          requires_prescription?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      batches: {
        Row: {
          id: string;
          medicine_id: string;
          batch_number: string;
          quantity: number;
          expiry_date: string;
          supplier: string | null;
          cost_price: number | null;
          selling_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          medicine_id: string;
          batch_number: string;
          quantity: number;
          expiry_date: string;
          supplier?: string | null;
          cost_price?: number | null;
          selling_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          medicine_id?: string;
          batch_number?: string;
          quantity?: number;
          expiry_date?: string;
          supplier?: string | null;
          cost_price?: number | null;
          selling_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          medicine_id: string;
          total_quantity: number;
          low_stock_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          medicine_id: string;
          total_quantity?: number;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          medicine_id?: string;
          total_quantity?: number;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_requests: {
        Row: {
          id: string;
          customer_profile_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          medicine_name: string;
          quantity: number;
          prescription_url: string | null;
          status: OrderStatus;
          notes: string | null;
          staff_notes: string | null;
          processed_by: string | null;
          pickup_code: string;
          customer_signature: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_profile_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          medicine_name: string;
          quantity: number;
          prescription_url?: string | null;
          status?: OrderStatus;
          notes?: string | null;
          staff_notes?: string | null;
          processed_by?: string | null;
          pickup_code?: string;
          customer_signature?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_profile_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          medicine_name?: string;
          quantity?: number;
          prescription_url?: string | null;
          status?: OrderStatus;
          notes?: string | null;
          staff_notes?: string | null;
          processed_by?: string | null;
          pickup_code?: string;
          customer_signature?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      memberships: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          membership_number: string;
          tier: MembershipTier;
          status: MembershipStatus;
          start_date: string;
          end_date: string;
          discount_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          membership_number: string;
          tier?: MembershipTier;
          status?: MembershipStatus;
          start_date: string;
          end_date: string;
          discount_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          membership_number?: string;
          tier?: MembershipTier;
          status?: MembershipStatus;
          start_date?: string;
          end_date?: string;
          discount_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff_roles: {
        Row: {
          id: string;
          email: string;
          clerk_user_id: string | null;
          role: StaffRole;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          clerk_user_id?: string | null;
          role?: StaffRole;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          clerk_user_id?: string | null;
          role?: StaffRole;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      low_stock_view: {
        Row: {
          medicine_id: string;
          medicine_name: string;
          generic_name: string;
          brand_name: string | null;
          total_quantity: number;
          low_stock_threshold: number;
        };
      };
      expiry_alerts: {
        Row: {
          batch_id: string;
          medicine_id: string;
          medicine_name: string;
          generic_name: string;
          brand_name: string | null;
          batch_number: string;
          quantity: number;
          expiry_date: string;
          days_until_expiry: number;
        };
      };
    };
    Functions: {
      search_medicines: {
        Args: {
          search_term: string;
        };
        Returns: {
          id: string;
          generic_name: string;
          brand_name: string | null;
          category: string;
          manufacturer: string | null;
          total_quantity: number;
          requires_prescription: boolean;
          latest_batch_price: number | null;
        }[];
      };
      process_order_approval: {
        Args: {
          order_id: string;
          medicine_id: string;
          quantity: number;
          staff_clerk_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      order_status: OrderStatus;
      membership_status: MembershipStatus;
      membership_tier: MembershipTier;
      staff_role: StaffRole;
    };
  };
}
