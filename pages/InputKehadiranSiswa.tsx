
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { KehadiranGuru, KehadiranGuruRecord, KehadiranSiswa, KehadiranSiswaRecord, KehadiranStatus, HariFormat } from '../types';
import Modal from '../components/Modal';
import { DeleteIcon } from '../components/icons/Icons';

const InputKehadiranSiswaPage: React.FC = () => {
    const context = useContext(DataContext);
    const [selectedKelasId, setSelectedKelasId] = useState<string>('');
    const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
    const [siswaKehadiran, setSiswaKehadiran] = useState<KehadiranSiswaRecord[]>([]);
    const [guruHadirCount, setGuruHadirCount] = useState<number>(1);
    const [guruKehadiran, setGuruKehadiran] = useState<Partial<KehadiranGuruRecord>[]>([{}]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const inputStyles = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";

    if (!context) return <div>Loading...</div>;
    const { kelasList, gurus, mapels, setKehadiranSiswa, setKehadiranGuru, kehadiranSiswa, kehadiranGuru, identitasSekolah, setIsLoading, setNotification } = context;

    // Menentukan jumlah pertemuan berdasarkan format hari sekolah
    const jumlahPertemuan = identitasSekolah.format === HariFormat.LIMA ? 5 : 6;

    const availablePengajar = useMemo(() => {
        if (!context || !selectedKelasId) return [];
        return context.pengajarMapels.filter(p => p.kelasId === selectedKelasId);
    }, [context, selectedKelasId]);
    
    const studentsInClass = useMemo(() => {
        if (!context || !selectedKelasId) return [];
        return context.siswas.filter(s => s.kelasId === selectedKelasId && !s.mutasi);
    }, [context, selectedKelasId]);
    
    // EFFECT: Load Data or Reset based on selection
    useEffect(() => {
        if (!selectedKelasId || !tanggal) return;

        const idToCheck = `${selectedKelasId}-${tanggal}`;
        const existingSiswaData = kehadiranSiswa.find(k => k.id === idToCheck);
        const existingGuruData = kehadiranGuru.find(k => k.id === idToCheck);

        if (existingSiswaData) {
            // MODE EDIT: Data ditemukan
            setIsEditMode(true);
            
            // Map existing status to current students (handle students added after record creation)
            const mappedKehadiran = studentsInClass.map(s => {
                const record = existingSiswaData.kehadiran.find(r => r.siswaId === s.id);
                return {
                    siswaId: s.id,
                    status: record ? record.status : Array(jumlahPertemuan).fill(KehadiranStatus.HADIR) as KehadiranStatus[]
                };
            });
            setSiswaKehadiran(mappedKehadiran);

            if (existingGuruData) {
                setGuruKehadiran(existingGuruData.kehadiran);
                setGuruHadirCount(existingGuruData.kehadiran.length);
            } else {
                setGuruKehadiran([{}]);
                setGuruHadirCount(1);
            }

        } else {
            // MODE BARU: Data tidak ditemukan
            setIsEditMode(false);
            if (studentsInClass.length > 0) {
                const defaultKehadiran = studentsInClass.map(s => ({
                    siswaId: s.id,
                    status: Array(jumlahPertemuan).fill(KehadiranStatus.HADIR) as KehadiranStatus[]
                }));
                setSiswaKehadiran(defaultKehadiran);
            } else {
                setSiswaKehadiran([]);
            }
            // Reset guru form
            setGuruKehadiran([{}]);
            setGuruHadirCount(1);
        }

    }, [selectedKelasId, tanggal, studentsInClass, kehadiranSiswa, kehadiranGuru, jumlahPertemuan]);


    // Effect untuk mengatur jumlah baris input guru saat count berubah (hanya jika manual change, bukan saat load edit)
    useEffect(() => {
        if (guruKehadiran.length !== guruHadirCount) {
             setGuruKehadiran(prev => {
                const newArr = [...prev];
                if (guruHadirCount > prev.length) {
                    for (let i = prev.length; i < guruHadirCount; i++) {
                        newArr.push({});
                    }
                } else {
                    newArr.splice(guruHadirCount);
                }
                return newArr;
             });
        }
    }, [guruHadirCount]);


    const resetForm = () => {
        setSelectedKelasId('');
        setTanggal(new Date().toISOString().split('T')[0]);
        setSiswaKehadiran([]);
        setGuruHadirCount(1);
        setGuruKehadiran([{}]);
        setIsEditMode(false);
    }

    const handleSiswaStatusChange = (siswaId: string, pertemuanIndex: number, status: KehadiranStatus) => {
        setSiswaKehadiran(prev => prev.map(s => {
            if (s.siswaId === siswaId) {
                const newStatus = [...s.status];
                newStatus[pertemuanIndex] = status;
                return { ...s, status: newStatus };
            }
            return s;
        }));
    };

    // Fungsi untuk mengubah status semua siswa sekaligus
    const handleMarkAll = (status: KehadiranStatus) => {
        if (siswaKehadiran.length === 0) return;

        if (!window.confirm(`Apakah Anda yakin ingin menandai SEMUA siswa sebagai ${status} untuk semua pertemuan?`)) return;

        setSiswaKehadiran(prev => prev.map(s => ({
            ...s,
            status: s.status.map(() => status)
        })));
        
        setNotification({ type: 'success', message: `Semua siswa ditandai sebagai ${status}.` });
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

        // Jika mode baru (bukan edit), cek duplikat
        const idToCheck = `${selectedKelasId}-${tanggal}`;
        if (!isEditMode && kehadiranSiswa.some(k => k.id === idToCheck)) {
            setNotification({ type: 'error', message: "Data kehadiran untuk kelas dan tanggal ini sudah ada! Halaman akan direfresh." });
            // Fallback safety re-trigger effect
            const temp = selectedKelasId;
            setSelectedKelasId('');
            setTimeout(() => setSelectedKelasId(temp), 10);
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
            const id = `${selectedKelasId}-${tanggal}`;
            
            const newKehadiranSiswa: KehadiranSiswa = {
                id,
                kelasId: selectedKelasId,
                tanggal,
                kehadiran: siswaKehadiran,
            };
            
            const enrichedGuruKehadiran: KehadiranGuruRecord[] = guruKehadiran
                .filter(g => g.guruId && g.mapelId)
                .map(g => ({
                    guruId: g.guruId!,
                    mapelId: g.mapelId!,
                    jumlahPertemuan: g.jumlahPertemuan || 0,
                    namaGuru: gurus.find(guru => guru.id === g.guruId)?.nama_guru || 'Unknown',
                    namaMapel: mapels.find(mapel => mapel.id === g.mapelId)?.nama_mapel || 'Unknown'
                }));

            const newKehadiranGuru: KehadiranGuru = {
                id,
                kelasId: selectedKelasId,
                tanggal,
                kehadiran: enrichedGuruKehadiran,
            };
            
            if (isEditMode) {
                // UPDATE Existing Data
                setKehadiranSiswa(prev => prev.map(k => k.id === id ? newKehadiranSiswa : k));
                setKehadiranGuru(prev => prev.map(k => k.id === id ? newKehadiranGuru : k));
                setNotification({type: 'success', message: 'Data kehadiran berhasil diperbarui!'});
            } else {
                // INSERT New Data
                setKehadiranSiswa(prev => [...prev, newKehadiranSiswa]);
                setKehadiranGuru(prev => [...prev, newKehadiranGuru]);
                setNotification({type: 'success', message: 'Data kehadiran berhasil disimpan!'});
            }
            
            setIsLoading(false);
            resetForm();

        }, 800);
    };
    
    const handleDeleteKehadiran = () => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus data kehadiran untuk tanggal ini? Data tidak dapat dikembalikan.")) return;
        
        const idToDelete = `${selectedKelasId}-${tanggal}`;
        setIsLoading(true);
        setTimeout(() => {
             setKehadiranSiswa(prev => prev.filter(k => k.id !== idToDelete));
             setKehadiranGuru(prev => prev.filter(k => k.id !== idToDelete));
             setIsLoading(false);
             setNotification({type: 'success', message: 'Data kehadiran berhasil dihapus.'});
             resetForm();
        }, 500);
    };

    // Helper untuk menghitung statistik status
    const countStatus = (status: KehadiranStatus) => {
        return siswaKehadiran.reduce((total, record) => {
            return total + record.status.filter(s => s === status).length;
        }, 0);
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
                    {isEditMode && (
                        <div className="bg-yellow-900 bg-opacity-50 border-l-4 border-yellow-500 text-yellow-200 p-4 mb-6 rounded-r">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold">⚠️ Mode Edit Aktif</p>
                                    <p className="text-sm">Anda sedang mengubah data kehadiran yang sudah ada untuk tanggal {new Date(tanggal).toLocaleDateString('id-ID')}.</p>
                                </div>
                                <button 
                                    onClick={handleDeleteKehadiran}
                                    className="flex items-center px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-sm font-medium transition-colors"
                                >
                                    <DeleteIcon className="w-4 h-4 mr-1" /> Hapus Data
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-100">
                                    Absensi Siswa: {kelasList.find(k=>k.id === selectedKelasId)?.nama_kelas}
                                </h2>
                                <div className="text-sm text-gray-400">
                                    Format: {identitasSekolah.format} ({jumlahPertemuan} Pertemuan)
                                </div>
                            </div>
                            
                            {/* Tombol Bulk Update */}
                            <div className="flex flex-wrap gap-2">
                                <span className="self-center text-sm text-gray-400 mr-2">Set Semua:</span>
                                <button 
                                    onClick={() => handleMarkAll(KehadiranStatus.HADIR)} 
                                    className="px-3 py-1 bg-green-700 text-green-100 rounded-md hover:bg-green-600 text-sm font-medium transition-colors"
                                    type="button"
                                >
                                    Hadir
                                </button>
                                <button 
                                    onClick={() => handleMarkAll(KehadiranStatus.SAKIT)} 
                                    className="px-3 py-1 bg-blue-700 text-blue-100 rounded-md hover:bg-blue-600 text-sm font-medium transition-colors"
                                    type="button"
                                >
                                    Sakit
                                </button>
                                <button 
                                    onClick={() => handleMarkAll(KehadiranStatus.IJIN)} 
                                    className="px-3 py-1 bg-yellow-700 text-yellow-100 rounded-md hover:bg-yellow-600 text-sm font-medium transition-colors"
                                    type="button"
                                >
                                    Izin
                                </button>
                                <button 
                                    onClick={() => handleMarkAll(KehadiranStatus.ALPA)} 
                                    className="px-3 py-1 bg-red-700 text-red-100 rounded-md hover:bg-red-600 text-sm font-medium transition-colors"
                                    type="button"
                                >
                                    Alpa
                                </button>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-center">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-2 py-2 border border-gray-600 whitespace-nowrap">No</th>
                                        <th className="px-4 py-2 border border-gray-600 text-left whitespace-nowrap">Nama Siswa</th>
                                        {Array.from({ length: jumlahPertemuan }).map((_, i) => (
                                            <th key={i} className="px-2 py-2 border border-gray-600 w-12 whitespace-nowrap">{i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsInClass.map((siswa, siswaIndex) => (
                                        <tr key={siswa.id} className="bg-gray-800">
                                            <td className="px-2 py-2 border border-gray-600 whitespace-nowrap">{siswaIndex + 1}</td>
                                            <td className="px-4 py-2 border border-gray-600 text-left whitespace-nowrap">{siswa.nama_siswa}</td>
                                            {Array.from({ length: jumlahPertemuan }).map((_, pertemuanIndex) => (
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
                        
                        {/* Summary Section */}
                        <div className="mt-4 p-3 bg-gray-700 rounded-md border border-gray-600">
                            <h3 className="text-sm font-semibold text-gray-300 mb-2">Ringkasan Kehadiran Hari Ini:</h3>
                            <div className="flex space-x-6 text-sm font-bold">
                                <span className="text-green-400">Total Hadir: {countStatus(KehadiranStatus.HADIR)}</span>
                                <span className="text-blue-400">Total Sakit: {countStatus(KehadiranStatus.SAKIT)}</span>
                                <span className="text-yellow-400">Total Izin: {countStatus(KehadiranStatus.IJIN)}</span>
                                <span className="text-red-400">Total Alpa: {countStatus(KehadiranStatus.ALPA)}</span>
                            </div>
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
                            className={`px-6 py-3 text-white rounded-md font-bold transition-colors ${
                                isEditMode 
                                ? 'bg-yellow-600 hover:bg-yellow-700' 
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {isEditMode ? 'UPDATE KEHADIRAN' : 'SIMPAN KEHADIRAN'}
                        </button>
                    </div>
                </>
            )}
             <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title={isEditMode ? "Konfirmasi Update" : "Konfirmasi Penyimpanan"}>
                <p className="text-gray-300">
                    {isEditMode 
                        ? "Yakin anda ingin mengubah data kehadiran ini? Data lama akan ditimpa." 
                        : "Yakin anda ingin menyimpan data kehadiran ini?"}
                </p>
                <div className="flex justify-end pt-4 mt-4">
                    <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Batal</button>
                    <button type="button" onClick={handleConfirmSave} className={`px-4 py-2 text-white rounded-md ${isEditMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                        {isEditMode ? 'Ya, Update' : 'Ya, Simpan'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default InputKehadiranSiswaPage;
