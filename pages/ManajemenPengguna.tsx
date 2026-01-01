
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { User, UserRole } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';

const ManajemenPenggunaPage: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserForm, setCurrentUserForm] = useState<Partial<User> | null>(null);

    if (!context) return <div>Loading...</div>;

    const { users, setUsers, setIsLoading, setNotification, currentUser } = context;

    const handleOpenModal = (user: Partial<User> | null = null) => {
        // Don't show the encrypted password in the form
        if (user) {
            const { password, ...rest } = user;
            setCurrentUserForm(rest);
        } else {
            setCurrentUserForm({});
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUserForm(null);
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
        if (id === currentUser?.id) {
            alert("Anda tidak dapat menghapus akun Anda sendiri!");
            return;
        }

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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.user}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' : 
                                              user.role === UserRole.STAFF ? 'bg-green-100 text-green-800' : 
                                              'bg-blue-100 text-blue-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(user)} className="text-indigo-400 hover:text-indigo-300 mr-4"><EditIcon className="w-5 h-5" /></button>
                                        <button 
                                            onClick={() => handleDelete(user.id)} 
                                            className={`${user.id === currentUser?.id ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:text-red-300'}`}
                                            disabled={user.id === currentUser?.id}
                                            title={user.id === currentUser?.id ? "Tidak dapat menghapus akun sendiri" : "Hapus Pengguna"}
                                        >
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
                <UserForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    user={currentUserForm}
                    existingUser={context.users.find(u => u.id === currentUserForm?.id)}
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
    existingUser?: User;
}

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSave, user, existingUser }) => {
    const [formData, setFormData] = useState<Partial<User>>(user || {});
    // For password field, we separate it because we don't want to show the hash
    const [passwordInput, setPasswordInput] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalPassword = existingUser?.password; // Keep old password by default

        // If user entered a new password, encrypt it
        if (passwordInput) {
            finalPassword = btoa(passwordInput);
        }

        if (formData.nama && formData.user && formData.role && (finalPassword || user?.id)) {
             const userToSave: User = {
                id: user?.id || '',
                nama: formData.nama!,
                user: formData.user!,
                role: formData.role || UserRole.OPERATOR,
                password: finalPassword
            };
            onSave(userToSave);
        } else if (!finalPassword) {
            alert("Password wajib diisi untuk pengguna baru.");
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user?.id ? "Edit Pengguna" : "Tambah Pengguna"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Nama Lengkap</label>
                    <input type="text" name="nama" value={formData.nama || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Username</label>
                    <input type="text" name="user" value={formData.user || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Role</label>
                    <select name="role" value={formData.role || UserRole.OPERATOR} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                        {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={passwordInput} 
                        onChange={(e) => setPasswordInput(e.target.value)} 
                        className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder={user?.id ? "Kosongkan jika tidak ingin mengubah password" : "Masukkan password"} 
                        required={!user?.id} 
                    />
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
