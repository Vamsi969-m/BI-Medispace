export type Role = 'doctor' | 'rep' | 'admin';

export type ProductCategory =
  | 'Cardiology'
  | 'Oncology'
  | 'Diabetes'
  | 'Neurology'
  | 'Respiratory'
  | 'Gastroenterology'
  | 'Immunology'
  | 'Infectious Diseases';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  price: number;
  shortDescription: string;
  image: string;
  manufacturer: string;
  madeIn: string;
  purpose: string;
  approvedUses: string[];
  features: string[];
  specifications: { label: string; value: string }[];
  importantInfo: string[];
  documentation: { title: string; type: string; size: string }[];
  availability: 'In Stock' | 'Limited Stock' | 'Backorder';
  isFavorite?: boolean;
}

export type DemoStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'In Progress';
export type SessionType = 'Video Call' | 'Phone Call' | 'Face-to-Face Meeting';

export interface DemoSession {
  id: string;
  productId: string;
  productName: string;
  doctorId: string;
  doctorName: string;
  repId: string;
  repName: string;
  date: string;
  time: string;
  sessionType: SessionType;
  status: DemoStatus;
  meetingLink?: string;
  notes?: string;
  feedback?: { rating: number; comment: string };
}

export type SampleStatus = 'Requested' | 'Approved' | 'Dispatched' | 'Delivered' | 'Rejected';

export interface SampleRequest {
  id: string;
  productId: string;
  productName: string;
  doctorId: string;
  doctorName: string;
  quantity: number;
  organization: string;
  status: SampleStatus;
  requestDate: string;
  repId: string;
  repName: string;
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  charges: number;
  total: number;
  doctorId: string;
  doctorName: string;
  organization: string;
  repId: string;
  repName: string;
  orderDate: string;
  status: OrderStatus;
  deliveryDate?: string;
  trackingNumber?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  organization: string;
  email: string;
  phone: string;
  avatar: string;
  favorites: string[];
  licenseNumber: string;
  yearsExperience: number;
}

export interface Rep {
  id: string;
  name: string;
  region: string;
  email: string;
  phone: string;
  avatar: string;
  assignedDoctors: string[];
  specialization: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  departments: string[];
  doctors: { id: string; name: string; specialization: string }[];
  contactEmail: string;
  contactPhone: string;
  bedCount: number;
}

export type InteractionType = 'Call' | 'Face-to-Face Visit';
export type InterestLevel = 'High' | 'Medium' | 'Low' | 'None';

export interface Interaction {
  id: string;
  type: InteractionType;
  doctorId: string;
  doctorName: string;
  organization: string;
  productId: string;
  productName: string;
  date: string;
  summary: string;
  doctorResponse: string;
  samplesProvided: number;
  interestLevel: InterestLevel;
  followUpDate?: string;
  notes: string;
  repId: string;
  repName: string;
}

export interface Notification {
  id: string;
  type: 'demo' | 'sample' | 'order' | 'interaction' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
  icon: string;
}
