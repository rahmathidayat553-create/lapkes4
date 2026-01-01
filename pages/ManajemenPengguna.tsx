
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { User } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';

const ManajemenPenggunaPage: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);

    if (!context) return <div>Loading...</div>;

    const { users, setUsers, setIsLoading, setNotification } = context;

    const handleOpenModal = (user: Partial<User> | null = null) => {
        setCurrentUser(user || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSave = (user: User) => {
        setIsLoading(true);
        setTimeout(() => {
            if (user.id) {
                setUsers(prev => prev.map(u => u.id === user.id ? user : u));
            } else {
                setUsers(prev => [...prev, { ...user, id: new Date().toISOString() }]);
            }
            handleCloseModal();
            setIsLoading(false);
            setNotification({ type: 'success', message: 'Data pengguna berhasil disimpan!' });
        }, 500);
    };

    const handleDelete = (id: string) => {
        if (users.length <= 1) {
            alert("Tidak dapat menghapus pengguna terakhir.");
            return;
        }
        if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
            setUsers(users.filter(u => u.id !== id));
            setNotification({ type: 'success', message: 'Pengguna berhasil dihapus.' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Manajemen Pengguna</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Tambah Pengguna
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.user}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(user)} className="text-indigo-400 hover:text-indigo-300 mr-4"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300"><DeleteIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <UserForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    user={currentUser}
                />
            )}
        </div>
    );
};

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: Partial<User> | null;
}

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState<Partial<User>>(user || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.nama && formData.user && (formData.password || user?.id)) {
            onSave(formData as User);
        } else if (!formData.password) {
            alert("Password wajib diisi untuk pengguna baru.");
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user?.id ? "Edit Pengguna" : "Tambah Pengguna"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Nama Lengkap</label>
                    <input type="text" name="nama" value={formData.nama || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Username</label>
                    <input type="text" name="user" value={formData.user || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Password</label>
                    <input type="password" name="password" value={formData.password || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white" placeholder={user?.id ? "Kosongkan jika tidak diubah" : ""} required={!user?.id} />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
                </div>
            </form>
        </Modal>
    );
};

export default ManajemenPenggunaPage;