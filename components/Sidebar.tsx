import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    HomeIcon, SchoolIcon, CalendarIcon, TeacherIcon, BookIcon, StudentIcon, 
    ClassIcon, AttendanceIcon, MutationIcon, UserManagementIcon, ChevronDownIcon 
} from './icons/Icons';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const linkClasses = "flex items-center px-4 py-2 mt-2 text-gray-300 transition-colors duration-200 transform rounded-md hover:bg-gray-700";
  const activeLinkClasses = "bg-gray-700 text-white";

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black opacity-50 transition-opacity lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-gray-900 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <span className="text-white text-2xl mx-2 font-semibold">LapKes</span>
          </div>
        </div>
        <nav className="mt-10 px-2">
          <NavLink to="/" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`} end>
            <HomeIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Dashboard</span>
          </NavLink>

          <NavLink to="/identitas-sekolah" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <SchoolIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Identitas Sekolah</span>
          </NavLink>
          
          <NavLink to="/kalender-pendidikan" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <CalendarIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Kalender Pendidikan</span>
          </NavLink>

          <NavLink to="/data-guru" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <TeacherIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Data Guru</span>
          </NavLink>

          <NavLink to="/data-mapel" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <BookIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Data Mata Pelajaran</span>
          </NavLink>

          <NavLink to="/data-pengajar-mapel" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <BookIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Data Pengajar Mapel</span>
          </NavLink>

          <NavLink to="/data-siswa" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <StudentIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Data Siswa</span>
          </NavLink>

          <NavLink to="/data-kelas" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <ClassIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Data Kelas</span>
          </NavLink>
          
          <div>
            <button onClick={() => toggleSubmenu('kehadiran')} className={`${linkClasses} w-full`}>
                <AttendanceIcon className="w-6 h-6" />
                <span className="mx-4 font-medium">Kehadiran Siswa</span>
                <ChevronDownIcon className={`w-5 h-5 ml-auto transition-transform ${openSubmenus['kehadiran'] ? 'rotate-180' : ''}`} />
            </button>
            {openSubmenus['kehadiran'] && (
              <div className="pl-8">
                <NavLink to="/input-kehadiran-siswa" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                  <span className="mx-4 text-sm">Input Kehadiran</span>
                </NavLink>
                <NavLink to="/rekap-kehadiran-siswa" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                  <span className="mx-4 text-sm">Rekap Kehadiran</span>
                </NavLink>
              </div>
            )}
          </div>
          
           <div>
            <button onClick={() => toggleSubmenu('tatapMuka')} className={`${linkClasses} w-full`}>
                <AttendanceIcon className="w-6 h-6" />
                <span className="mx-4 font-medium">Data Tatap Guru</span>
                <ChevronDownIcon className={`w-5 h-5 ml-auto transition-transform ${openSubmenus['tatapMuka'] ? 'rotate-180' : ''}`} />
            </button>
            {openSubmenus['tatapMuka'] && (
              <div className="pl-8">
                 <NavLink to="/rekap-kehadiran-guru" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                  <span className="mx-4 text-sm">Rekap Kehadiran</span>
                </NavLink>
              </div>
            )}
          </div>
          
          <NavLink to="/data-mutasi-siswa" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <MutationIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Data Mutasi Siswa</span>
          </NavLink>
          
          <div className="border-t border-gray-700 my-4"></div>

          <NavLink to="/manajemen-pengguna" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <UserManagementIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Manajemen Pengguna</span>
          </NavLink>

        </nav>
      </div>
    </>
  );
};

export default Sidebar;