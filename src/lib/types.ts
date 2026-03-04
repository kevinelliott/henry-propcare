export type WorkOrderStatus = "open" | "in_progress" | "resolved" | "cancelled";
export type WorkOrderPriority = "low" | "medium" | "high" | "emergency";
export type WorkOrderCategory =
  | "plumbing"
  | "electrical"
  | "hvac"
  | "appliance"
  | "structural"
  | "pest"
  | "cleaning"
  | "other";

export interface Profile {
  id: string;
  user_id: string;
  plan: "free" | "starter" | "growth";
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  name: string;
  address: string;
  slug: string;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  property_id: string;
  unit: string | null;
  category: WorkOrderCategory;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  vendor_id: string | null;
  tenant_name: string;
  tenant_email: string;
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
  property?: Property;
  vendor?: Vendor;
}

export interface Vendor {
  id: string;
  landlord_id: string;
  name: string;
  specialty: string;
  phone: string | null;
  email: string | null;
  active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  plan: string;
  current_period_end: string;
  created_at: string;
}

export interface DashboardStats {
  totalWorkOrders: number;
  openWorkOrders: number;
  inProgressWorkOrders: number;
  resolvedThisMonth: number;
  totalProperties: number;
  totalVendors: number;
}
