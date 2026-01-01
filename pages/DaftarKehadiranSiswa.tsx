
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { KehadiranStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { EditIcon } from '../components/icons/Icons';

const DaftarKehadiranSiswaPage: React.FC = () => {
    const context = useContext(DataContext);
    const navigate = useNavigate();

    if (!context) return <div>Loading...</div>;

    const { kehadiranSiswa, kelasList } = context;

    // Urutkan berdasarkan tanggal terbaru
    const sortedData = useMemo(() => {
        return [...kehadiranSiswa].sort(
            (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
        );
    }, [kehadiranSiswa]);

    // Helper untuk menghitung total status (akumulasi dari semua siswa dan semua jam pertemuan)
    const hitungStatusTotal = (records: any[]) => {
        let H = 0, S = 0, I = 0, A = 0;
        records.forEach(r => {
            r.status.forEach((s: KehadiranStatus) => {
                if (s === KehadiranStatus.HADIR) H++;
                else if (s === KehadiranStatus.SAKIT) S++;
                else if (s === KehadiranStatus.IJIN) I++;
                else if (s === KehadiranStatus.ALPA) A++;
            });
        });
        return { H, S, I, A };
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-6">Daftar Kehadiran Harian</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kelas</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider text-green-400">Hadir</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider text-blue-400">Sakit</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider text-yellow-400">Izin</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider text-red-400">Alpa</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {sortedData.map((k) => {
                                const { H, S, I, A } = hitungStatusTotal(k.kehadiran);
                                const kelas = kelasList.find(c => c.id === k.kelasId);
                                return (
                                    <tr key={k.id} className="hover:bg-gray-700 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                                            {new Date(k.tanggal).toLocaleDateString('id-ID', {
                                                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-200 font-medium">
                                            {kelas?.nama_kelas || 'Kelas Terhapus'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-green-400 font-bold">{H}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-blue-400 font-bold">{S}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-yellow-400 font-bold">{I}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-red-400 font-bold">{A}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => navigate(`/input-kehadiran-siswa?kelasId=${k.kelasId}&tanggal=${k.tanggal}`)}
                                                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors"
                                            >
                                                <EditIcon className="w-4 h-4 mr-1.5" />
                                                Lihat / Edit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {sortedData.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-400 text-lg">Belum ada data kehadiran yang diinput.</p>
                            <button 
                                onClick={() => navigate('/input-kehadiran-siswa')}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Input Kehadiran Baru
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DaftarKehadiranSiswaPage;