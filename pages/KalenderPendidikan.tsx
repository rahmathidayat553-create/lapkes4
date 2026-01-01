
import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { KalenderPendidikan, StatusKalender } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';

const KalenderPendidikanPage: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentKalender, setCurrentKalender] = useState<Partial<KalenderPendidikan> | null>(null);

    const sortedKalender = useMemo(() => {
        if (!context?.kalender) return [];
        return [...context.kalender].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    }, [context?.kalender]);

    if (!context) return <div>Loading...</div>;

    const { kalender, setKalender, setIsLoading, setNotification } = context;

    const handleOpenModal = (kal: Partial<KalenderPendidikan> | null = null) => {
        setCurrentKalender(kal || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentKalender(null);
    };

    const handleSave = (kal: KalenderPendidikan) => {
        // Validasi Duplikat Tanggal
        if (kalender.some(k => k.tanggal === kal.tanggal && k.id !== kal.id)) {
            alert("Tanggal ini sudah memiliki agenda! Silakan pilih tanggal lain atau edit agenda yang sudah ada.");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            if (kal.id) {
                setKalender(prev => prev.map(k => k.id === kal.id ? kal : k));
            } else {
                setKalender(prev => [...prev, { ...kal, id: new Date().toISOString() }]);
            }
            handleCloseModal();
            setIsLoading(false);
            setNotification({ type: 'success', message: 'Data agenda berhasil disimpan!' });
        }, 500);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            setKalender(kalender.filter(k => k.id !== id));
            setNotification({ type: 'success', message: 'Data agenda berhasil dihapus.' });
        }
    };

    const getStatusBadgeClass = (status: StatusKalender) => {
        switch (status) {
            case StatusKalender.LIBUR: return "bg-red-900 text-red-200";
            case StatusKalender.TIDAK_EFEKTIF: return "bg-yellow-900 text-yellow-200";
            case StatusKalender.AKTIF: return "bg-green-900 text-green-200";
            default: return "bg-gray-700 text-gray-200";
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Kalender Pendidikan</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Tambah Agenda
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Judul Agenda</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Keterangan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {sortedKalender.map((kal) => (
                                <tr key={kal.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">{new Date(kal.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">{kal.judul}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(kal.status)}`}>
                                            {kal.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">{kal.ket || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(kal)} className="text-indigo-400 hover:text-indigo-300 mr-4">
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(kal.id)} className="text-red-400 hover:text-red-300">
                                            <DeleteIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <KalenderForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    kalender={currentKalender}
                />
            )}
        </div>
    );
};

interface KalenderFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (kalender: KalenderPendidikan) => void;
    kalender: Partial<KalenderPendidikan> | null;
}

const KalenderForm: React.FC<KalenderFormProps> = ({ isOpen, onClose, onSave, kalender }) => {
    const [formData, setFormData] = useState<Partial<KalenderPendidikan>>(kalender || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.tanggal && formData.judul && formData.status) {
            onSave(formData as KalenderPendidikan);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={kalender?.id ? "Edit Agenda" : "Tambah Agenda"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Tanggal</label>
                    <input type="date" name="tanggal" value={formData.tanggal || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Judul Agenda</label>
                    <input type="text" name="judul" value={formData.judul || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Status</label>
                    <select name="status" value={formData.status || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                        <option value="">Pilih Status</option>
                        {Object.values(StatusKalender).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Keterangan (Opsional)</label>
                    <textarea name="ket" value={formData.ket || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
                </div>
            </form>
        </Modal>
    );
};

export default KalenderPendidikanPage;
