import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  PenTool, 
  Layers
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Signing Queue', href: '/signing', icon: PenTool },
    { name: 'Templates', href: '/templates', icon: Layers },
  ];

  return (
    <div className="fixed left-0 top-16 bottom-0 w-16 bg-white border-r border-gray-200 z-40">
      <nav className="p-2 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href === '/' ? '/' : item.href}
            className={({ isActive }) =>
              `flex items-center justify-center w-12 h-12 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar