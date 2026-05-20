export interface Chalet {
  id: number;
  name: string;
  code: string;
  location: string;
  city: string;
  description: string;
  rooms_count: number;
  bathrooms_count: number;
  capacity: number;
  status: "available" | "rented" | "maintenance";
  status_display: string;
  features: string[];
  notes: string;
  nightly_price: string;
  images: ChaletImage[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChaletImage {
  id: number;
  image: string;
  is_primary: boolean;
  caption: string;
}

export interface Owner {
  id: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface OwnerContract {
  id: number;
  chalet: number;
  chalet_name: string;
  owner: number;
  owner_name: string;
  daily_rate: string;
  start_date: string;
  end_date: string;
  days_count: number;
  total_cost: string;
  payment_method: string;
  payment_status: string;
  paid_amount: string;
  remaining_amount: number;
  notes: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  bookings_count?: number;
}

export interface Booking {
  id: number;
  chalet: number;
  chalet_name: string;
  chalet_code: string;
  customer: number;
  customer_name: string;
  customer_phone: string;
  guests_count: number;
  check_in: string;
  check_out: string;
  days_count: number;
  nightly_price: string;
  discount: string;
  total_amount: string;
  final_amount: string;
  deposit: string;
  remaining_amount: string;
  payment_status: string;
  status: string;
  profit: string;
  notes: string;
}

export interface Expense {
  id: number;
  chalet: number;
  chalet_name: string;
  expense_type: string;
  expense_type_display: string;
  amount: string;
  date: string;
  notes: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardData {
  total_chalets: number;
  rented_chalets: number;
  available_chalets: number;
  total_revenue: number;
  total_expenses: number;
  owner_rental_costs: number;
  net_profit: number;
  total_bookings: number;
  monthly_stats: { month: string; revenue: number; count: number }[];
  latest_bookings: Booking[];
  top_chalets: { chalet__name: string; revenue: number; booking_count: number }[];
  profit_summary: ProfitSummary;
}

export interface ProfitSummary {
  total_revenue: number;
  total_expenses: number;
  total_owner_costs: number;
  net_profit: number;
  occupancy_rate: number;
  best_chalet: { chalet_name: string; net_profit: number } | null;
  chalets: ChaletProfit[];
}

export interface ChaletProfit {
  chalet_id: number;
  chalet_name: string;
  total_revenue: number;
  owner_cost: number;
  total_expenses: number;
  net_profit: number;
}

export interface CalendarEvent {
  id: string;
  type: "booking" | "owner_contract";
  title: string;
  start: string;
  end: string;
  chalet_id: number;
  chalet_name: string;
  status: string;
  color: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
