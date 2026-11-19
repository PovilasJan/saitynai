const Svg = ({ children, size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{children}</svg>
)

export const DroneIcon = (p) => (
  <Svg {...p}><circle cx="5" cy="5" r="3" /><circle cx="19" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" />
    <path d="M7 7l3 3m4 0l3-3M7 17l3-3m4 0l3 3" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /></Svg>
)
export const MenuIcon = (p) => <Svg {...p}><path d="M3 6h18M3 12h18M3 18h18" /></Svg>
export const CloseIcon = (p) => <Svg {...p}><path d="M18 6L6 18M6 6l12 12" /></Svg>
export const PlusIcon = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
export const EditIcon = (p) => <Svg {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></Svg>
export const TrashIcon = (p) => <Svg {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></Svg>
export const StarIcon = ({ filled, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></Svg>
)
export const UserIcon = (p) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></Svg>
export const LogoutIcon = (p) => <Svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></Svg>
export const ClockIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></Svg>
export const WeightIcon = (p) => <Svg {...p}><path d="M6 8h12l2 13H4z" /><circle cx="12" cy="5" r="2" /></Svg>
export const InfoIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></Svg>
export const MailIcon = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Svg>
export const PinIcon = (p) => <Svg {...p}><path d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></Svg>
export const BackIcon = (p) => <Svg {...p}><path d="M15 18l-6-6 6-6" /></Svg>
export const NextIcon = (p) => <Svg {...p}><path d="M9 18l6-6-6-6" /></Svg>
export const GridIcon = (p) => <Svg {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Svg>
export const ChartIcon = (p) => <Svg {...p}><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></Svg>
export const LoginIcon = (p) => <Svg {...p}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></Svg>
export const UserPlusIcon = (p) => <Svg {...p}><circle cx="9" cy="8" r="4" /><path d="M1 21c0-4 4-6 8-6s8 2 8 6M19 8v6M16 11h6" /></Svg>
export const SearchIcon = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Svg>
export const CheckIcon = (p) => <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>
export const AlertIcon = (p) => <Svg {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></Svg>
