
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { Guru, Jk, StatusGuru } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';

const DataGuruPage: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGuru, setCurrentGuru] = useState<Partial<Guru> | null>(null);

    if (!context) return <div>Loading...</div>;

    const { gurus, setGurus, setIsLoading, setNotification } = context;

    const handleOpenModal = (guru: Partial<Guru> | null = null) => {
        setCurrentGuru(guru || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentGuru(null);
    };

    const handleSave = async (guru: Guru) => {
        setIsLoading(true);
        
        // Use async promise instead of standard setTimeout for cleaner async flow
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (guru.id) {
            setGurus(prev => prev.map(g => g.id === guru.id ? guru : g));
        } else {
            setGurus(prev => [...prev, { ...guru, id: new Date().toISOString() }]);
        }
        
        handleCloseModal();
        setIsLoading(false);
        setNotification({ type: 'success', message: 'Data guru berhasil disimpan!' });
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data guru ini?")) {
            setGurus(gurus.filter(g => g.id !== id));
            setNotification({ type: 'success', message: 'Data guru berhasil dihapus.' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Data Guru</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Tambah Guru
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama Guru</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Jenis Kelamin</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">NIP</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {gurus.map((guru) => (
                                <tr key={guru.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{guru.nama_guru}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{guru.jk}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{guru.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{guru.status === StatusGuru.ASN ? guru.nip : '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(guru)} className="text-indigo-400 hover:text-indigo-300 mr-4"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(guru.id)} className="text-red-400 hover:text-red-300"><DeleteIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <GuruForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    guru={currentGuru}
                />
            )}
        </div>
    );
};

interface GuruFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (guru: Guru) => void;
    guru: Partial<Guru> | null;
}

const GuruForm: React.FC<GuruFormProps> = ({ isOpen, onClose, onSave, guru }) => {
    const [formData, setFormData] = useState<Partial<Guru>>(guru || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation for NIP
        if (formData.status === StatusGuru.ASN) {
            // Regex: Exactly 18 digits
            const nipRegex = /^\d{18}$/;
            if (!formData.nip || !nipRegex.test(formData.nip)) {
                alert("NIP wajib diisi dan harus terdiri dari 18 digit angka untuk status ASN.");
                return;
            }
        }

        if (formData.nama_guru && formData.jk && formData.status) {
            // Clear NIP if changed to NON-ASN
            const finalData = { ...formData };
            if (finalData.status === StatusGuru.NON_ASN) {
                finalData.nip = '-';
            }
            onSave(finalData as Guru);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={guru?.id ? "Edit Guru" : "Tambah Guru"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Nama Guru</label>
                    <input type="text" name="nama_guru" value={formData.nama_guru || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Jenis Kelamin</label>
                    <select name="jk" value={formData.jk || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                        <option value="">Pilih Jenis Kelamin</option>
                        {Object.values(Jk).map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Status Kepegawaian</label>
                    <select name="status" value={formData.status || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                        <option value="">Pilih Status</option>
                        {Object.values(StatusGuru).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                {formData.status === StatusGuru.ASN && (
                     <div>
                        <label className="block text-sm font-medium text-gray-300">NIP (18 Digit Angka)</label>
                        <input type="text" name="nip" value={formData.nip || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required maxLength={18} placeholder="Contoh: 198001012005011005" />
                    </div>
                )}
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
                </div>
            </form>
        </Modal>
    );
};

export default DataGuruPage;
