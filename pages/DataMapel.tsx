
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { Mapel } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';

const DataMapelPage: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMapel, setCurrentMapel] = useState<Partial<Mapel> | null>(null);

    if (!context) return <div>Loading...</div>;

    const { mapels, setMapels, setIsLoading, setNotification } = context;

    const handleOpenModal = (mapel: Partial<Mapel> | null = null) => {
        setCurrentMapel(mapel || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentMapel(null);
    };

    const handleSave = (mapel: Mapel) => {
        setIsLoading(true);
        setTimeout(() => {
            if (mapel.id) {
                setMapels(prev => prev.map(m => m.id === mapel.id ? mapel : m));
            } else {
                setMapels(prev => [...prev, { ...mapel, id: new Date().toISOString() }]);
            }
            handleCloseModal();
            setIsLoading(false);
            setNotification({ type: 'success', message: 'Data mapel berhasil disimpan!' });
        }, 500);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data mata pelajaran ini?")) {
            setMapels(mapels.filter(m => m.id !== id));
            setNotification({ type: 'success', message: 'Data mapel berhasil dihapus.' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Data Mata Pelajaran</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Tambah Mapel
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kode Mapel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama Mapel</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {mapels.map((mapel) => (
                                <tr key={mapel.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{mapel.kd_mapel}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{mapel.nama_mapel}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(mapel)} className="text-indigo-400 hover:text-indigo-300 mr-4"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(mapel.id)} className="text-red-400 hover:text-red-300"><DeleteIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <MapelForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    mapel={currentMapel}
                />
            )}
        </div>
    );
};

interface MapelFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mapel: Mapel) => void;
    mapel: Partial<Mapel> | null;
}

const MapelForm: React.FC<MapelFormProps> = ({ isOpen, onClose, onSave, mapel }) => {
    const [formData, setFormData] = useState<Partial<Mapel>>(mapel || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.kd_mapel && formData.nama_mapel) {
            onSave(formData as Mapel);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mapel?.id ? "Edit Mapel" : "Tambah Mapel"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Kode Mapel</label>
                    <input type="text" name="kd_mapel" value={formData.kd_mapel || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Nama Mapel</label>
                    <input type="text" name="nama_mapel" value={formData.nama_mapel || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
                </div>
            </form>
        </Modal>
    );
};

export default DataMapelPage;