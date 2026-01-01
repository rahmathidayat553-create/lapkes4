
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { KehadiranGuru, KehadiranGuruRecord, KehadiranSiswa, KehadiranSiswaRecord, KehadiranStatus } from '../types';
import Modal from '../components/Modal';

const InputKehadiranSiswaPage: React.FC = () => {
    const context = useContext(DataContext);
    const [selectedKelasId, setSelectedKelasId] = useState<string>('');
    const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
    const [siswaKehadiran, setSiswaKehadiran] = useState<KehadiranSiswaRecord[]>([]);
    const [guruHadirCount, setGuruHadirCount] = useState<number>(1);
    const [guruKehadiran, setGuruKehadiran] = useState<Partial<KehadiranGuruRecord>[]>([{}]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const inputStyles = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";

    const availablePengajar = useMemo(() => {
        if (!context || !selectedKelasId) return [];
        return context.pengajarMapels.filter(p => p.kelasId === selectedKelasId);
    }, [context, selectedKelasId]);
    
    const studentsInClass = useMemo(() => {
        if (!context || !selectedKelasId) return [];
        return context.siswas.filter(s => s.kelasId === selectedKelasId && !s.mutasi);
    }, [context, selectedKelasId]);
    
    useEffect(() => {
        if (studentsInClass.length > 0) {
            const defaultKehadiran = studentsInClass.map(s => ({
                siswaId: s.id,
                status: Array(10).fill(KehadiranStatus.HADIR) as [KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus]
            }));
            setSiswaKehadiran(defaultKehadiran);
        } else {
            setSiswaKehadiran([]);
        }
    }, [studentsInClass]);

    useEffect(() => {
        setGuruKehadiran(Array(guruHadirCount).fill({}));
    }, [guruHadirCount]);

    if (!context) return <div>Loading...</div>;
    const { kelasList, gurus, mapels, setKehadiranSiswa, setKehadiranGuru, kehadiranSiswa, kehadiranGuru, setIsLoading, setNotification } = context;

    const resetForm = () => {
        setSelectedKelasId('');
        setTanggal(new Date().toISOString().split('T')[0]);
        setSiswaKehadiran([]);
        setGuruHadirCount(1);
        setGuruKehadiran([{}]);
    }

    const handleSiswaStatusChange = (siswaId: string, pertemuanIndex: number, status: KehadiranStatus) => {
        setSiswaKehadiran(prev => prev.map(s => {
            if (s.siswaId === siswaId) {
                const newStatus = [...s.status] as [KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus,KehadiranStatus];
                newStatus[pertemuanIndex] = status;
                return { ...s, status: newStatus };
            }
            return s;
        }));
    };

    const handleGuruChange = (index: number, field: keyof KehadiranGuruRecord, value: string | number) => {
        setGuruKehadiran(prev => {
            const newKehadiran = [...prev];
            newKehadiran[index] = { ...newKehadiran[index], [field]: value };
            return newKehadiran;
        });
    };

    const handleAttemptSave = () => {
        if (!selectedKelasId || !tanggal) {
            setNotification({type: 'warning', message: "Harap pilih kelas dan tanggal terlebih dahulu."});
            return;
        }

        const isAnyGuruFilled = guruKehadiran.some(g => g.guruId && g.mapelId && g.jumlahPertemuan);
        if (!isAnyGuruFilled) {
             setNotification({type: 'warning', message: "Harap isi minimal satu data kehadiran guru."});
            return;
        }
        
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSave = () => {
        setIsConfirmModalOpen(false);
        setIsLoading(true);

        setTimeout(() => {
            const newKehadiranSiswa: KehadiranSiswa = {
                id: `${selectedKelasId}-${tanggal}`,
                kelasId: selectedKelasId,
                tanggal,
                kehadiran: siswaKehadiran,
            };
            
            const newKehadiranGuru: KehadiranGuru = {
                 id: `${selectedKelasId}-${tanggal}`,
                kelasId: selectedKelasId,
                tanggal,
                kehadiran: guruKehadiran.filter(g => g.guruId && g.mapelId) as KehadiranGuruRecord[],
            };
            
            const existingSiswaIndex = kehadiranSiswa.findIndex(k => k.id === newKehadiranSiswa.id);
            if (existingSiswaIndex > -1) {
                const updated = [...kehadiranSiswa];
                updated[existingSiswaIndex] = newKehadiranSiswa;
                setKehadiranSiswa(updated);
            } else {
                setKehadiranSiswa([...kehadiranSiswa, newKehadiranSiswa]);
            }
            
            const existingGuruIndex = kehadiranGuru.findIndex(k => k.id === newKehadiranGuru.id);
            if (existingGuruIndex > -1) {
                const updated = [...kehadiranGuru];
                updated[existingGuruIndex] = newKehadiranGuru;
                setKehadiranGuru(updated);
            } else {
                setKehadiranGuru([...kehadiranGuru, newKehadiranGuru]);
            }
            
            setIsLoading(false);
            setNotification({type: 'success', message: 'Data kehadiran berhasil disimpan!'});
            resetForm();

        }, 1000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-6">Input Kehadiran Siswa</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Pilih Kelas</label>
                        <select
                            value={selectedKelasId}
                            onChange={(e) => setSelectedKelasId(e.target.value)}
                            className={inputStyles}
                        >
                            <option value="">-- Pilih Kelas --</option>
                            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Tanggal</label>
                        <input
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            className={inputStyles}
                        />
                    </div>
                </div>
            </div>

            {selectedKelasId && (
                <>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-100">Absensi Siswa: {kelasList.find(k=>k.id === selectedKelasId)?.nama_kelas}</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-center">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">No</th>
                                        <th className="px-4 py-2 border border-gray-600 text-left whitespace-nowrap">Nama Siswa</th>
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <th key={i} className="px-2 py-2 border border-gray-600 w-12 whitespace-nowrap">{i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsInClass.map((siswa, siswaIndex) => (
                                        <tr key={siswa.id} className="bg-gray-800">
                                            <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{siswaIndex + 1}</td>
                                            <td className="px-4 py-2 border border-gray-600 text-left whitespace-nowrap">{siswa.nama_siswa}</td>
                                            {Array.from({ length: 10 }).map((_, pertemuanIndex) => (
                                                <td key={pertemuanIndex} className="px-2 py-2 border border-gray-600 whitespace-nowrap">
                                                    <select
                                                        value={siswaKehadiran[siswaIndex]?.status[pertemuanIndex] || KehadiranStatus.HADIR}
                                                        onChange={(e) => handleSiswaStatusChange(siswa.id, pertemuanIndex, e.target.value as KehadiranStatus)}
                                                        className={`w-full p-1 rounded border-0 text-center font-bold appearance-none min-w-[60px]
                                                            ${(siswaKehadiran[siswaIndex]?.status[pertemuanIndex] === KehadiranStatus.HADIR) ? 'bg-green-900 bg-opacity-50 text-green-300' :
                                                             (siswaKehadiran[siswaIndex]?.status[pertemuanIndex] === KehadiranStatus.SAKIT) ? 'bg-blue-900 bg-opacity-50 text-blue-300' :
                                                             (siswaKehadiran[siswaIndex]?.status[pertemuanIndex] === KehadiranStatus.IJIN) ? 'bg-yellow-900 bg-opacity-50 text-yellow-300' :
                                                             'bg-red-900 bg-opacity-50 text-red-300'
                                                            }`}
                                                    >
                                                        {Object.values(KehadiranStatus).map(s => <option className="bg-gray-700" key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-100">Isi Data Hadir Guru</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300">Jumlah guru yang hadir</label>
                            <input
                                type="number"
                                min="1"
                                value={guruHadirCount}
                                onChange={(e) => setGuruHadirCount(parseInt(e.target.value, 10))}
                                className={`w-24 ${inputStyles}`}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="py-2 border border-gray-600 text-left px-4 whitespace-nowrap">Nama Guru</th>
                                        <th className="py-2 border border-gray-600 text-left px-4 whitespace-nowrap">Mata Pelajaran</th>
                                        <th className="py-2 border border-gray-600 text-left px-4 whitespace-nowrap">Jumlah Pertemuan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: guruHadirCount }).map((_, index) => (
                                        <tr key={index} className="bg-gray-800">
                                            <td className="py-2 border border-gray-600 px-2 whitespace-nowrap min-w-[200px]">
                                                <select 
                                                    className={inputStyles}
                                                    value={guruKehadiran[index]?.guruId || ''}
                                                    onChange={e => handleGuruChange(index, 'guruId', e.target.value)}
                                                >
                                                    <option value="">Pilih Guru</option>
                                                    {availablePengajar.map(p => <option key={p.id} value={p.guruId}>{gurus.find(g => g.id === p.guruId)?.nama_guru}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-2 border border-gray-600 px-2 whitespace-nowrap min-w-[200px]">
                                                <select 
                                                    className={inputStyles}
                                                    value={guruKehadiran[index]?.mapelId || ''}
                                                    onChange={e => handleGuruChange(index, 'mapelId', e.target.value)}
                                                >
                                                    <option value="">Pilih Mapel</option>
                                                    {availablePengajar.map(p => <option key={p.id} value={p.mapelId}>{mapels.find(m => m.id === p.mapelId)?.nama_mapel}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-2 border border-gray-600 px-2 whitespace-nowrap min-w-[150px]">
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    max="10" 
                                                    className={inputStyles}
                                                    value={guruKehadiran[index]?.jumlahPertemuan || 1}
                                                    onChange={e => handleGuruChange(index, 'jumlahPertemuan', parseInt(e.target.value))}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleAttemptSave}
                            className="px-6 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 font-bold"
                        >
                            SIMPAN KEHADIRAN
                        </button>
                    </div>
                </>
            )}
             <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Konfirmasi Penyimpanan">
                <p className="text-gray-300">Yakin anda ingin menyimpan data kehadiran ini?</p>
                <div className="flex justify-end pt-4 mt-4">
                    <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Batal</button>
                    <button type="button" onClick={handleConfirmSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Ya, Simpan</button>
                </div>
            </Modal>
        </div>
    );
};

export default InputKehadiranSiswaPage;
