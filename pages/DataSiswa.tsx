
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { Siswa, Jk, StatusSiswa, Kelas } from '../types';
import Modal from '../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon, DownloadIcon } from '../components/icons/Icons';
import * as XLSX from 'xlsx';

const DataSiswaPage: React.FC = () => {
    const context = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSiswa, setCurrentSiswa] = useState<Partial<Siswa> | null>(null);

    if (!context) return <div>Loading...</div>;

    const { siswas, setSiswas, kelasList, setIsLoading, setNotification } = context;

    const handleOpenModal = (siswa: Partial<Siswa> | null = null) => {
        setCurrentSiswa(siswa || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSiswa(null);
    };

    const handleSave = (siswa: Siswa) => {
        // Validasi NISN ganda
        if (siswas.some(s => s.nisn === siswa.nisn && s.id !== siswa.id)) {
            alert("NISN sudah digunakan oleh siswa lain!");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            if (siswa.id) {
                setSiswas(prev => prev.map(s => s.id === siswa.id ? siswa : s));
            } else {
                setSiswas(prev => [...prev, { ...siswa, id: crypto.randomUUID() }]);
            }
            handleCloseModal();
            setIsLoading(false);
            setNotification({ type: 'success', message: 'Data siswa berhasil disimpan!' });
        }, 500);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
            setSiswas(siswas.filter(s => s.id !== id));
            setNotification({ type: 'success', message: 'Data siswa berhasil dihapus.' });
        }
    };
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            const newSiswas: Siswa[] = json.map((row: any) => {
                // Parsing jenis kelamin yang lebih robust (case-insensitive)
                const genderRaw = (row['Jenis Kelamin'] || '').toString().trim().toUpperCase();
                
                return {
                    id: crypto.randomUUID(), // Menggunakan UUID agar lebih unik
                    nisn: row.NISN || '',
                    nama_siswa: row.Nama || '',
                    jk: genderRaw === 'P' ? Jk.PEREMPUAN : Jk.LAKI_LAKI,
                    status: StatusSiswa.BARU,
                    tgl_masuk: new Date().toISOString().split('T')[0],
                    mutasi: false,
                };
            });
            
            if(window.confirm(`Ditemukan ${newSiswas.length} data siswa. Impor sekarang?`)){
               setSiswas(prev => [...prev, ...newSiswas]);
               setNotification({ type: 'success', message: 'Data siswa berhasil diimpor.' });
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            { 'NISN': '', 'Nama': '', 'Jenis Kelamin': 'L atau P' }
        ];
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template Siswa");
        XLSX.writeFile(workbook, "template_import_siswa.xlsx");
    };


    const getKelasName = (kelasId?: string) => {
        if (!kelasId) return '-';
        return kelasList.find(k => k.id === kelasId)?.nama_kelas || 'Tidak Diketahui';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100">Data Siswa</h1>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handleDownloadTemplate} 
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={kelasList.length === 0}
                        title={kelasList.length === 0 ? "Harap isi Data Kelas terlebih dahulu" : "Unduh template Excel"}
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Template
                    </button>
                     <label className="flex items-center px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 cursor-pointer">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Import Excel
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                    </label>
                    <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Tambah Siswa
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">NISN</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama Siswa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kelas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Jenis Kelamin</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status Masuk</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tgl Masuk</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {siswas.filter(s => !s.mutasi).map((siswa) => (
                                <tr key={siswa.id} className="hover:bg-gray-700 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">{siswa.nisn}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">{siswa.nama_siswa}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">{getKelasName(siswa.kelasId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">{siswa.jk}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">{siswa.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-200">{new Date(siswa.tgl_masuk).toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(siswa)} className="text-indigo-400 hover:text-indigo-300 mr-4"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(siswa.id)} className="text-red-400 hover:text-red-300"><DeleteIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <SiswaForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    siswa={currentSiswa}
                    kelasList={kelasList}
                />
            )}
        </div>
    );
};

interface SiswaFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (siswa: Siswa) => void;
    siswa: Partial<Siswa> | null;
    kelasList: Kelas[];
}

const SiswaForm: React.FC<SiswaFormProps> = ({ isOpen, onClose, onSave, siswa, kelasList }) => {
    const [formData, setFormData] = useState<Partial<Siswa>>(siswa || {});
    const inputStyles = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, foto: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi Nomor WA
        if (formData.no_wa && !/^\d{9,15}$/.test(formData.no_wa)) {
            alert("Nomor WA tidak valid. Harus berupa angka 9-15 digit.");
            return;
        }

        if (formData.nisn && formData.nama_siswa && formData.jk && formData.status && formData.tgl_masuk) {
            onSave(formData as Siswa);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={siswa?.id ? "Edit Siswa" : "Tambah Siswa"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">NISN</label>
                        <input type="text" name="nisn" value={formData.nisn || ''} onChange={handleChange} className={inputStyles} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Nama Siswa</label>
                        <input type="text" name="nama_siswa" value={formData.nama_siswa || ''} onChange={handleChange} className={inputStyles} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Kelas</label>
                        <select name="kelasId" value={formData.kelasId || ''} onChange={handleChange} className={inputStyles} required>
                            <option value="">Pilih Kelas</option>
                            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Jenis Kelamin</label>
                        <select name="jk" value={formData.jk || ''} onChange={handleChange} className={inputStyles} required>
                            <option value="">Pilih Jenis Kelamin</option>
                            {Object.values(Jk).map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Status Masuk</label>
                        <select name="status" value={formData.status || ''} onChange={handleChange} className={inputStyles} required>
                            <option value="">Pilih Status</option>
                            {Object.values(StatusSiswa).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Tanggal Masuk</label>
                        <input type="date" name="tgl_masuk" value={formData.tgl_masuk || ''} onChange={handleChange} className={inputStyles} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">No. WA (Opsional)</label>
                        <input type="text" name="no_wa" value={formData.no_wa || ''} onChange={handleChange} className={inputStyles} placeholder="Contoh: 08123456789" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Foto (Opsional)</label>
                         <div className="mt-1 flex items-center space-x-4">
                            {formData.foto && <img src={formData.foto} alt="Foto" className="h-16 w-16 object-cover rounded-full" />}
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"/>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
                </div>
            </form>
        </Modal>
    );
};

export default DataSiswaPage;
