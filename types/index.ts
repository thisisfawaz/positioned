export interface User {
  id: string
  email: string
  name: string
  role: 'PROFESSIONAL' | 'RECRUITER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface ProfessionalProfile {
  id: string
  userId: string
  title?: string
  bio?: string
  location?: string
  country?: string
  profilePhoto?: string
  availability: AvailabilityStatus
  opportunityPreferences?: string
  featuredWorkIds: string[]
  skills: ProfessionalSkill[]
  experiences: Experience[]
  workPosts: WorkPost[]
}

export type AvailabilityStatus = 
  | 'OPEN_TO_WORK'
  | 'OPEN_TO_CONTRACT'
  | 'OPEN_TO_FREELANCE'
  | 'OPEN_TO_FULL_TIME'
  | 'OPEN_TO_OPPORTUNITIES'
  | 'NOT_AVAILABLE'

export interface Skill {
  id: string
  name: string
}

export interface ProfessionalSkill {
  id: string
  professionalId: string
  skillId: string
  skill: Skill
}

export interface Experience {
  id: string
  professionalId: string
  title: string
  company: string
  startDate: Date
  endDate?: Date
  current: boolean
  description?: string
}

export interface WorkPost {
  id: string
  professionalId: string
  template: WorkTemplate
  title: string
  purpose?: string
  challenge?: string
  goal?: string
  approach?: string
  solution?: string
  contribution?: string
  result?: string
  metrics?: string
  situation?: string
  action?: string
  skills: string[]
  mediaAssets: MediaAsset[]
  featured: boolean
  boosted: boolean
  boostExpiresAt?: Date
  status: WorkStatus
  views: number
  recruiterViews: number
  saves: number
  createdAt: Date
  updatedAt: Date
  professional: ProfessionalProfile
}

export type WorkTemplate = 
  | 'PROJECT_SHOWCASE'
  | 'CASE_STUDY'
  | 'ACHIEVEMENT'
  | 'WORK_SAMPLE'

export type WorkStatus = 
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'REJECTED'

export interface MediaAsset {
  id: string
  workPostId: string
  provider: StorageProvider
  providerAssetId: string
  type: MediaType
  thumbnail?: string
  preview?: string
  metadata?: any
  createdAt: Date
}

export type StorageProvider = 
  | 'GOOGLE_DRIVE'
  | 'DROPBOX'
  | 'ONEDRIVE'
  | 'S3'

export type MediaType = 
  | 'IMAGE'
  | 'VIDEO'
  | 'PREVIEW'

export interface RecruiterProfile {
  id: string
  userId: string
  organization?: string
  role?: string
  location?: string
  hiringInterests?: string
  isVerified: boolean
}

export interface Payment {
  id: string
  userId: string
  boostId?: string
  amount: number
  currency: string
  provider: PaymentProvider
  providerTransactionId?: string
  status: PaymentStatus
  createdAt: Date
  updatedAt: Date
}

export type PaymentProvider = 
  | 'STRIPE'
  | 'PAYSTACK'
  | 'FLUTTERWAVE'

export type PaymentStatus = 
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REFUNDED'

export interface SearchFilters {
  skills?: string[]
  role?: string
  country?: string
  city?: string
  experience?: string
  availability?: AvailabilityStatus
  category?: string
  keywords?: string
}

export interface VisibilityAnalytics {
  totalViews: number
  recruiterViews: number
  professionalViews: number
  saves: number
  profileVisits: number
  contacts: number
  boostGeneratedViews: number
}
