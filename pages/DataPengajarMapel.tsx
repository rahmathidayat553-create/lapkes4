
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { PengajarMapel, Guru, Mapel, Kelas } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';

const DataPengajarMapelPage: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentData, setCurrentData] = useState<Partial<PengajarMapel> | null>(null);

    if (!context) return <div>Loading...</div>;

    const { pengajarMapels, setPengajarMapels, gurus, mapels, kelasList, setIsLoading, setNotification } = context;

    const handleOpenModal = (data: Partial<PengajarMapel> | null = null) => {
        setCurrentData(data || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentData(null);
    };

    const handleSave = (data: PengajarMapel) => {
        setIsLoading(true);
        setTimeout(() => {
            if (data.id) {
                setPengajarMapels(prev => prev.map(p => p.id === data.id ? data : p));
            } else {
                setPengajarMapels(prev => [...prev, { ...data, id: new Date().toISOString() }]);
            }
            handleCloseModal();
            setIsLoading(false);
            setNotification({ type: 'success', message: 'Data pengajar berhasil disimpan!' });
        }, 500);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            setPengajarMapels(pengajarMapels.filter(p => p.id !== id));
            setNotification({ type: 'success', message: 'Data pengajar berhasil dihapus.' });
        }
    };

    const getName = (id: string, type: 'guru' | 'mapel' | 'kelas') => {
        switch (type) {
            case 'guru': return gurus.find(g => g.id === id)?.nama_guru || 'N/A';
            case 'mapel': return mapels.find(m => m.id === id)?.nama_mapel || 'N/A';
            case 'kelas': return kelasList.find(k => k.id === id)?.nama_kelas || 'N/A';
            default: return 'N/A';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Data Pengajar Mapel</h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600"
                    disabled={gurus.length === 0 || mapels.length === 0 || kelasList.length === 0}
                    title={gurus.length === 0 || mapels.length === 0 || kelasList.length === 0 ? "Harap isi Data Guru, Mapel, dan Kelas terlebih dahulu" : ""}
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Tambah Pengajar
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama Mapel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama Guru</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Jumlah Pertemuan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {pengajarMapels.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{getName(p.mapelId, 'mapel')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getName(p.guruId, 'guru')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getName(p.kelasId, 'kelas')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{p.jp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(p)} className="text-indigo-400 hover:text-indigo-300 mr-4"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300"><DeleteIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <PengajarMapelForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    data={currentData}
                    gurus={gurus}
                    mapels={mapels}
                    kelasList={kelasList}
                />
            )}
        </div>
    );
};

interface FormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: PengajarMapel) => void;
    data: Partial<PengajarMapel> | null;
    gurus: Guru[];
    mapels: Mapel[];
    kelasList: Kelas[];
}

const PengajarMapelForm: React.FC<FormProps> = ({ isOpen, onClose, onSave, data, gurus, mapels, kelasList }) => {
    const [formData, setFormData] = useState<Partial<PengajarMapel>>(data || {});
    const inputStyles = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'jp' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.mapelId && formData.guruId && formData.kelasId && formData.jp) {
            onSave(formData as PengajarMapel);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={data?.id ? "Edit Pengajar" : "Tambah Pengajar"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Mata Pelajaran</label>
                    <select name="mapelId" value={formData.mapelId || ''} onChange={handleChange} className={inputStyles} required>
                        <option value="">Pilih Mapel</option>
                        {mapels.map(m => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Guru Pengajar</label>
                    <select name="guruId" value={formData.guruId || ''} onChange={handleChange} className={inputStyles} required>
                        <option value="">Pilih Guru</option>
                        {gurus.map(g => <option key={g.id} value={g.id}>{g.nama_guru}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Kelas</label>
                    <select name="kelasId" value={formData.kelasId || ''} onChange={handleChange} className={inputStyles} required>
                        <option value="">Pilih Kelas</option>
                        {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Jumlah Pertemuan</label>
                    <input type="number" name="jp" value={formData.jp || ''} onChange={handleChange} min="1" className={inputStyles} required />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
                </div>
            </form>
        </Modal>
    );
};

export default DataPengajarMapelPage;