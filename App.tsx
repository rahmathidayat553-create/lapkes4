
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, DataContext } from './context/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IdentitasSekolah from './pages/IdentitasSekolah';
import DataGuru from './pages/DataGuru';
import DataMapel from './pages/DataMapel';
import DataSiswa from './pages/DataSiswa';
import DataKelas from './pages/DataKelas';
import ManajemenPengguna from './pages/ManajemenPengguna';
import KalenderPendidikan from './pages/KalenderPendidikan';
import DataPengajarMapel from './pages/DataPengajarMapel';
import InputKehadiranSiswa from './pages/InputKehadiranSiswa';
import RekapKehadiranSiswa from './pages/RekapKehadiranSiswa';
import RekapKehadiranGuru from './pages/RekapKehadiranGuru';
import DataMutasiSiswa from './pages/DataMutasiSiswa';

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
    return <div>Loading...</div>;
  }

  const { currentUser } = context;

  return (
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
        <Route path="rekap-kehadiran-siswa" element={<RekapKehadiranSiswa />} />
        <Route path="rekap-kehadiran-guru" element={<RekapKehadiranGuru />} />
        <Route path="data-mutasi-siswa" element={<DataMutasiSiswa />} />
        <Route path="manajemen-pengguna" element={<ManajemenPengguna />} />
      </Route>
      <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
    </Routes>
  );
};

export default App;
