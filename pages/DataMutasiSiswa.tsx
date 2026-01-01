
import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { MutasiSiswa, AlasanMutasi } from '../types';
import Modal from '../components/Modal';
import { PlusIcon } from '../components/icons/Icons';

const DataMutasiSiswaPage: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!context) return <div>Loading...</div>;

    const { mutasiSiswa, setMutasiSiswa, siswas, setSiswas, setIsLoading, setNotification } = context;

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = (mutasiData: Omit<MutasiSiswa, 'id'>) => {
        setIsLoading(true);
        setTimeout(() => {
            const newMutasi: MutasiSiswa = { ...mutasiData, id: new Date().toISOString() };
            setMutasiSiswa(prev => [...prev, newMutasi]);
            
            setSiswas(prev => prev.map(s => 
                s.id === mutasiData.siswaId 
                ? { ...s, tgl_keluar: mutasiData.tanggal_keluar, mutasi: true } 
                : s
            ));
            
            handleCloseModal();
            setIsLoading(false);
            setNotification({ type: 'success', message: 'Data mutasi siswa berhasil disimpan!' });
        }, 500);
    };

    const siswaAktif = useMemo(() => siswas.filter(s => !s.mutasi), [siswas]);
    
    const getSiswaName = (id: string) => siswas.find(s => s.id === id)?.nama_siswa || 'Siswa tidak ditemukan';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Data Mutasi Siswa</h1>
                <button onClick={handleOpenModal} className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Tambah Data Mutasi
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-100">Daftar Siswa Mutasi</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama Siswa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tanggal Keluar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Alasan Mutasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {mutasiSiswa.map((m) => (
                                <tr key={m.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{getSiswaName(m.siswaId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(m.tanggal_keluar).toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{m.alasan_mutasi}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{m.keterangan || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <MutasiForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    siswaAktif={siswaAktif}
                />
            )}
        </div>
    );
};

interface MutasiFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<MutasiSiswa, 'id'>) => void;
    siswaAktif: { id: string, nama_siswa: string }[];
}

const MutasiForm: React.FC<MutasiFormProps> = ({ isOpen, onClose, onSave, siswaAktif }) => {
    const [formData, setFormData] = useState<Partial<Omit<MutasiSiswa, 'id'>>>({});
    const inputStyles = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.siswaId && formData.tanggal_keluar && formData.alasan_mutasi) {
            onSave(formData as Omit<MutasiSiswa, 'id'>);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Form Mutasi Siswa">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Pilih Siswa</label>
                    <select name="siswaId" value={formData.siswaId || ''} onChange={handleChange} className={inputStyles} required>
                        <option value="">-- Pilih Siswa --</option>
                        {siswaAktif.map(s => <option key={s.id} value={s.id}>{s.nama_siswa}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Tanggal Keluar</label>
                    <input type="date" name="tanggal_keluar" value={formData.tanggal_keluar || ''} onChange={handleChange} className={inputStyles} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Alasan Mutasi</label>
                    <select name="alasan_mutasi" value={formData.alasan_mutasi || ''} onChange={handleChange} className={inputStyles} required>
                        <option value="">-- Pilih Alasan --</option>
                        {Object.values(AlasanMutasi).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Keterangan (Opsional)</label>
                    <textarea name="keterangan" value={formData.keterangan || ''} onChange={handleChange} rows={3} className={inputStyles}></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
                </div>
            </form>
        </Modal>
    );
};

export default DataMutasiSiswaPage;