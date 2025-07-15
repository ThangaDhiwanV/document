import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PenTool,
  FileStack
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Signing Queue', href: '/signing', icon: PenTool },
    { name: 'Templates', href: '/templates', icon: FileStack },
  ];

  return (
    <div className="fixed left-0 top-16 bottom-0 w-16 bg-white border-r border-gray-200 z-40 group">
      <nav className="p-2 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center justify-center w-12 h-12 rounded-lg text-sm font-medium transition-all duration-200 nav-item relative ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
            title={item.name}
          >
            <item.icon className="w-6 h-6" />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible nav-item:hover:opacity-100 nav-item:hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50 transform translate-x-0 nav-item:hover:translate-x-1">
              {item.name}
              {/* Arrow pointing to sidebar */}
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
            </div>
          </NavLink>
        ))}
      </nav>
      
      <style jsx>{`
        .nav-item:hover .absolute {
          opacity: 1;
          visibility: visible;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
};

export default Sidebar