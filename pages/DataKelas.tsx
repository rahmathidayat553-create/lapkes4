
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { Kelas, Guru } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';

const DataKelasPage: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentKelas, setCurrentKelas] = useState<Partial<Kelas> | null>(null);

    if (!context) return <div>Loading...</div>;

    const { kelasList, setKelasList, gurus, setIsLoading, setNotification } = context;

    const handleOpenModal = (kelas: Partial<Kelas> | null = null) => {
        setCurrentKelas(kelas || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentKelas(null);
    };

    const handleSave = (kelas: Kelas) => {
        setIsLoading(true);
        setTimeout(() => {
            if (kelas.id) {
                setKelasList(prev => prev.map(k => k.id === kelas.id ? kelas : k));
            } else {
                setKelasList(prev => [...prev, { ...kelas, id: new Date().toISOString() }]);
            }
            handleCloseModal();
            setIsLoading(false);
            setNotification({ type: 'success', message: 'Data kelas berhasil disimpan!' });
        }, 500);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data kelas ini?")) {
            setKelasList(kelasList.filter(k => k.id !== id));
            setNotification({ type: 'success', message: 'Data kelas berhasil dihapus.' });
        }
    };

    const getWaliKelasName = (id: string) => {
        return gurus.find(g => g.id === id)?.nama_guru || 'Tidak diketahui';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Data Kelas</h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    disabled={gurus.length === 0}
                    title={gurus.length === 0 ? "Isi data guru terlebih dahulu untuk menentukan Wali Kelas" : ""}
                    className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Tambah Kelas
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kode Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Wali Kelas</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {kelasList.map((kelas) => (
                                <tr key={kelas.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{kelas.kd_kelas}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{kelas.nama_kelas}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getWaliKelasName(kelas.waliKelasId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(kelas)} className="text-indigo-400 hover:text-indigo-300 mr-4"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(kelas.id)} className="text-red-400 hover:text-red-300"><DeleteIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <KelasForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    kelas={currentKelas}
                    gurus={gurus}
                />
            )}
        </div>
    );
};

interface KelasFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (kelas: Kelas) => void;
    kelas: Partial<Kelas> | null;
    gurus: Guru[];
}

const KelasForm: React.FC<KelasFormProps> = ({ isOpen, onClose, onSave, kelas, gurus }) => {
    const [formData, setFormData] = useState<Partial<Kelas>>(kelas || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.kd_kelas && formData.nama_kelas && formData.waliKelasId) {
            onSave(formData as Kelas);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={kelas?.id ? "Edit Kelas" : "Tambah Kelas"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Kode Kelas</label>
                    <input type="text" name="kd_kelas" value={formData.kd_kelas || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Nama Kelas</label>
                    <input type="text" name="nama_kelas" value={formData.nama_kelas || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Wali Kelas</label>
                    <select name="waliKelasId" value={formData.waliKelasId || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                        <option value="">Pilih Wali Kelas</option>
                        {gurus.map(g => <option key={g.id} value={g.id}>{g.nama_guru}</option>)}
                    </select>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
                </div>
            </form>
        </Modal>
    );
};

export default DataKelasPage;
