import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    const { identitasSekolah, currentUser } = context;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-4">Dashboard</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-200 mb-6">Selamat Datang, {currentUser?.nama}!</h2>
                
                <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold text-gray-100 mb-4">Identitas Sekolah</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Nama Sekolah</p>
                            <p className="text-lg text-gray-100">{identitasSekolah.nama_sekolah}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">NPSN</p>
                            <p className="text-lg text-gray-100">{identitasSekolah.npsn}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Jenjang</p>
                            <p className="text-lg text-gray-100">{identitasSekolah.jenjang}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Kepala Sekolah</p>
                            <p className="text-lg text-gray-100">{identitasSekolah.nama_kepsek}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Wakasek Kesiswaan</p>
                            <p className="text-lg text-gray-100">{identitasSekolah.nama_wakasek}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Format Hari Sekolah</p>
                            <p className="text-lg text-gray-100">{identitasSekolah.format}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-400">Alamat</p>
                            <p className="text-lg text-gray-100">{identitasSekolah.alamat}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                         <Link to="/identitas-sekolah" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                           Ubah Identitas Sekolah
                         </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;