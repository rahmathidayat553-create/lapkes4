
import React, { useContext, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, DataContext } from './context/DataContext';
import Layout from './components/Layout';

// Lazy load page components
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const IdentitasSekolah = lazy(() => import('./pages/IdentitasSekolah'));
const DataGuru = lazy(() => import('./pages/DataGuru'));
const DataMapel = lazy(() => import('./pages/DataMapel'));
const DataSiswa = lazy(() => import('./pages/DataSiswa'));
const DataKelas = lazy(() => import('./pages/DataKelas'));
const ManajemenPengguna = lazy(() => import('./pages/ManajemenPengguna'));
const KalenderPendidikan = lazy(() => import('./pages/KalenderPendidikan'));
const DataPengajarMapel = lazy(() => import('./pages/DataPengajarMapel'));
const InputKehadiranSiswa = lazy(() => import('./pages/InputKehadiranSiswa'));
const DaftarKehadiranSiswa = lazy(() => import('./pages/DaftarKehadiranSiswa'));
const RekapKehadiranSiswa = lazy(() => import('./pages/RekapKehadiranSiswa'));
const RekapKehadiranGuru = lazy(() => import('./pages/RekapKehadiranGuru'));
const DataMutasiSiswa = lazy(() => import('./pages/DataMutasiSiswa'));

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Main />
      </HashRouter>
    </DataProvider>
  );
};

const Main: React.FC = () => {
  const context = useContext(DataContext);

  if (!context) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading Data...</div>;
  }

  const { currentUser } = context;

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading Page...</div>}>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={currentUser ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="identitas-sekolah" element={<IdentitasSekolah />} />
          <Route path="kalender-pendidikan" element={<KalenderPendidikan />} />
          <Route path="data-guru" element={<DataGuru />} />
          <Route path="data-mapel" element={<DataMapel />} />
          <Route path="data-pengajar-mapel" element={<DataPengajarMapel />} />
          <Route path="data-siswa" element={<DataSiswa />} />
          <Route path="data-kelas" element={<DataKelas />} />
          <Route path="input-kehadiran-siswa" element={<InputKehadiranSiswa />} />
          <Route path="daftar-kehadiran-siswa" element={<DaftarKehadiranSiswa />} />
          <Route path="rekap-kehadiran-siswa" element={<RekapKehadiranSiswa />} />
          <Route path="rekap-kehadiran-guru" element={<RekapKehadiranGuru />} />
          <Route path="data-mutasi-siswa" element={<DataMutasiSiswa />} />
          <Route path="manajemen-pengguna" element={<ManajemenPengguna />} />
        </Route>
        <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
      </Routes>
    </Suspense>
  );
};

export default App;
