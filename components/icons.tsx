import { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement> & {
  className?: string
}

const iconClasses = "w-5 h-5 stroke-current stroke-2 fill-none"

export function HomeIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H16V13H8V21H4C3.44772 21 3 20.5523 3 20V9.5Z" />
    </svg>
  )
}

export function BriefcaseIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" />
    </svg>
  )
}

export function ChatIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.8 20 9.65 19.77 8.6 19.35L3 21L4.65 15.4C4.23 14.35 4 13.2 4 12C4 7.30558 8.02944 3.5 12 3.5C16.9706 3.5 21 7.30558 21 11.5Z" />
    </svg>
  )
}

export function UsersIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21V19C22.5 17.5 21 16 19 16" />
      <circle cx="19" cy="7" r="4" />
    </svg>
  )
}

export function UserIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function FolderIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" />
    </svg>
  )
}

export function ChartBarIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20V14" />
    </svg>
  )
}

export function CreditCardIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

export function SettingsIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function SearchIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export function BellIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
    </svg>
  )
}

export function PlusIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function BookmarkIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M19 21L12 17L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" />
    </svg>
  )
}

export function TrendingIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M3 17L9 11L13 15L21 7" />
      <path d="M15 7H21V13" />
    </svg>
  )
}

export function TrashIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M3 6H21" />
      <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" />
      <path d="M19 6L18.2 20C18.1 20.5523 17.6 21 17 21H7C6.4 21 5.9 20.5523 5.8 20L5 6" />
      <path d="M10 11V17" />
      <path d="M14 11V17" />
    </svg>
  )
}

export function HeartIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57843 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57843 3.16 4.61C2.1283 5.6417 1.54858 7.04096 1.54858 8.5C1.54858 9.95904 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.9379 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12082 20.84 4.61Z" />
    </svg>
  )
}

export function ArrowIcon({ className = "", direction = "right", ...props }: IconProps & { direction?: 'up' | 'down' | 'left' | 'right' }) {
  const rotation = {
    up: '-90',
    down: '90',
    left: '180',
    right: '0',
  }
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" style={{ transform: `rotate(${rotation[direction]}deg)` }} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export function ChevronIcon({ className = "", direction = "right", ...props }: IconProps & { direction?: 'up' | 'down' | 'left' | 'right' }) {
  const rotation = {
    up: '-90',
    down: '90',
    left: '180',
    right: '0',
  }
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" style={{ transform: `rotate(${rotation[direction]}deg)` }} {...props}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function FilterIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}

export function SlidersIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
      <circle cx="4" cy="14" r="1.5" />
      <circle cx="12" cy="8" r="1.5" />
      <circle cx="20" cy="16" r="1.5" />
    </svg>
  )
}

export function MoreIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

export function EditIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M12 20H21" />
      <path d="M16.5 3.5L20.5 7.5" />
      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L7 20L3 21L4 17L18.5 2.5Z" />
    </svg>
  )
}

export function UploadIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

export function ImageIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

export function VideoIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="8" y1="2" x2="8" y2="22" />
      <line x1="16" y1="2" x2="16" y2="22" />
      <line x1="2" y1="8" x2="22" y2="8" />
      <line x1="2" y1="16" x2="22" y2="16" />
    </svg>
  )
}

export function ExternalLinkIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export function EyeIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function AnalyticsIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M3 3V21H21" />
      <path d="M18 17L14 12L10 16L6 11" />
    </svg>
  )
}

export function CalendarIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export function CheckIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function CloseIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function MenuIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  )
}

export function BackIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export function TieIcon({ className = "", ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.5l3.5 2.5-1.5 2.5h-4l-1.5-2.5z" />
      <path d="M10 7.5h4l2 6.5-4 7.5-4-7.5z" />
    </svg>
  )
}

export function CompassIcon({ className = "", ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9z" />
    </svg>
  )
}

export function CommentIcon({ className = "", ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

export function ShareIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

export function LocationIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function SkillIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  )
}

export function ExperienceIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M12 2V7M12 17V22M5 12H2M22 12H19M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}

export function SendIcon({ className = "", ...props }: IconProps) {
  return (
    <svg className={`${iconClasses} ${className}`} viewBox="0 0 24 24" {...props}>
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  )
}

export const Icons = {
  HomeIcon,
  BriefcaseIcon,
  UsersIcon,
  UserIcon,
  FolderIcon,
  ChartBarIcon,
  CreditCardIcon,
  SettingsIcon,
  SearchIcon,
  BellIcon,
  PlusIcon,
  BookmarkIcon,
  HeartIcon,
  ArrowIcon,
  ChevronIcon,
  FilterIcon,
  SlidersIcon,
  MoreIcon,
  EditIcon,
  UploadIcon,
  ImageIcon,
  VideoIcon,
  ExternalLinkIcon,
  EyeIcon,
  AnalyticsIcon,
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  BackIcon,
  ShareIcon,
  LocationIcon,
  SkillIcon,
  ExperienceIcon,
}
