// ✅ Updated sidebar config with asset-based icons – 2025-01-27 (by Cursor AI)

export interface SidebarNavItem {
  label: string
  icon: string // file name in /assets/icons/
  href: string
}

export const sidebarNavItems: SidebarNavItem[] = [
  {
    label: "Dashboard",
    icon: "001-home-agreement.png",
    href: "/",
  },
  {
    label: "Google Sheets Records",
    icon: "002-plus.png",
    href: "/google-sheets-records",
  },
  {
    label: "Creatives",
    icon: "003-shine.png",
    href: "/creatives",
  },

  {
    label: "Strategy Sync",
    icon: "004-brain.png",
    href: "/strategy-sync",
  },
  {
    label: "Lightbox",
    icon: "005-magic-box.png",
    href: "/lightbox",
  },
  {
    label: "Takeaway History",
    icon: "006-history.png",
    href: "/takeaway-history",
  },
] 