import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Edit3,
  Layers
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Signing Queue', href: '/signing', icon: Edit3 },
    { name: 'Templates', href: '/templates', icon: Layers },
  ];

  return (
    <div className="fixed left-0 top-16 bottom-0 w-16 bg-white border-r border-gray-200 z-50">
      <nav className="p-3 space-y-3">
        {navigation.map((item) => (
          <div
            key={item.name}
            className="relative group"
          >
            <NavLink
              to={item.href === '/' ? '/' : item.href}
              className={({ isActive }) =>
                `flex items-center justify-center w-12 h-12 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
            </NavLink>
            
            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100] shadow-lg">
              {item.name}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar