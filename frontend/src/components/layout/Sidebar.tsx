import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Upload,
  BookTemplate,
  MessageSquare,
  Settings,
  FileBarChart,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/submit', icon: Upload, labelKey: 'nav.submit' },
  { to: '/templates', icon: BookTemplate, labelKey: 'nav.templates' },
  { to: '/chat', icon: MessageSquare, labelKey: 'nav.chat' },
  { to: '/history', icon: FileBarChart, labelKey: 'nav.history' },
  { to: '/admin', icon: Settings, labelKey: 'nav.admin' },
]

export function Sidebar() {
  const { t, i18n } = useTranslation()

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#003B80] text-white flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-[#009EE0]">Deck</span>Review AI
        </h1>
        <p className="text-sm text-blue-200/70 mt-0.5">{t('app.tagline')}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon size={20} />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={toggleLang}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100/70 hover:bg-white/10 hover:text-white transition-colors w-full cursor-pointer"
        >
          <Globe size={20} />
          {i18n.language === 'fr' ? 'English' : 'Français'}
        </button>
      </div>
    </aside>
  )
}
