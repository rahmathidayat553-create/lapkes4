
import React, { createContext, useState, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { 
    User, IdentitasSekolah, KalenderPendidikan, Guru, Mapel, PengajarMapel, 
    Siswa, Kelas, KehadiranSiswa, KehadiranGuru, MutasiSiswa, Jenjang, HariFormat, Notification, UserRole
} from '../types';

interface DataContextType {
    currentUser: User | null;
    login: (user: string, pass: string) => boolean;
    logout: () => void;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    identitasSekolah: IdentitasSekolah;
    setIdentitasSekolah: React.Dispatch<React.SetStateAction<IdentitasSekolah>>;
    kalender: KalenderPendidikan[];
    setKalender: React.Dispatch<React.SetStateAction<KalenderPendidikan[]>>;
    gurus: Guru[];
    setGurus: React.Dispatch<React.SetStateAction<Guru[]>>;
    mapels: Mapel[];
    setMapels: React.Dispatch<React.SetStateAction<Mapel[]>>;
    pengajarMapels: PengajarMapel[];
    setPengajarMapels: React.Dispatch<React.SetStateAction<PengajarMapel[]>>;
    siswas: Siswa[];
    setSiswas: React.Dispatch<React.SetStateAction<Siswa[]>>;
    kelasList: Kelas[];
    setKelasList: React.Dispatch<React.SetStateAction<Kelas[]>>;
    kehadiranSiswa: KehadiranSiswa[];
    setKehadiranSiswa: React.Dispatch<React.SetStateAction<KehadiranSiswa[]>>;
    kehadiranGuru: KehadiranGuru[];
    setKehadiranGuru: React.Dispatch<React.SetStateAction<KehadiranGuru[]>>;
    mutasiSiswa: MutasiSiswa[];
    setMutasiSiswa: React.Dispatch<React.SetStateAction<MutasiSiswa[]>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    notification: Notification | null;
    setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
}

export const DataContext = createContext<DataContextType | null>(null);

const initialUsers: User[] = [
    // password: 'password123' encoded in base64
    { id: '1', nama: 'Administrator', user: 'admin', password: btoa('password123'), role: UserRole.ADMIN },
];

const initialIdentitas: IdentitasSekolah = {
    id: '1',
    npsn: '12345678',
    nama_sekolah: 'Sekolah Contoh',
    jenjang: Jenjang.SMA,
    nama_kepsek: 'Dr. John Doe',
    nama_wakasek: 'Jane Doe, S.Pd.',
    alamat: 'Jl. Pendidikan No. 1, Jakarta',
    logo: '',
    format: HariFormat.LIMA,
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('lapkes_currentUser', null);
    const [users, setUsers] = useLocalStorage<User[]>('lapkes_users', initialUsers);
    const [identitasSekolah, setIdentitasSekolah] = useLocalStorage<IdentitasSekolah>('lapkes_identitas', initialIdentitas);
    const [kalender, setKalender] = useLocalStorage<KalenderPendidikan[]>('lapkes_kalender', []);
    const [gurus, setGurus] = useLocalStorage<Guru[]>('lapkes_gurus', []);
    const [mapels, setMapels] = useLocalStorage<Mapel[]>('lapkes_mapels', []);
    const [pengajarMapels, setPengajarMapels] = useLocalStorage<PengajarMapel[]>('lapkes_pengajarMapels', []);
    const [siswas, setSiswas] = useLocalStorage<Siswa[]>('lapkes_siswas', []);
    const [kelasList, setKelasList] = useLocalStorage<Kelas[]>('lapkes_kelasList', []);
    const [kehadiranSiswa, setKehadiranSiswa] = useLocalStorage<KehadiranSiswa[]>('lapkes_kehadiranSiswa', []);
    const [kehadiranGuru, setKehadiranGuru] = useLocalStorage<KehadiranGuru[]>('lapkes_kehadiranGuru', []);
    const [mutasiSiswa, setMutasiSiswa] = useLocalStorage<MutasiSiswa[]>('lapkes_mutasiSiswa', []);
    
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<Notification | null>(null);


    const login = (user: string, pass: string): boolean => {
        // Compare encoded passwords
        const encodedPass = btoa(pass);
        const foundUser = users.find(u => u.user === user && u.password === encodedPass);
        
        if (foundUser) {
            const userToStore = { ...foundUser };
            delete userToStore.password; // Don't store encoded password in session if possible, though local storage has it
            setCurrentUser(userToStore);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <DataContext.Provider value={{
            currentUser, login, logout, users, setUsers,
            identitasSekolah, setIdentitasSekolah,
            kalender, setKalender,
            gurus, setGurus,
            mapels, setMapels,
            pengajarMapels, setPengajarMapels,
            siswas, setSiswas,
            kelasList, setKelasList,
            kehadiranSiswa, setKehadiranSiswa,
            kehadiranGuru, setKehadiranGuru,
            mutasiSiswa, setMutasiSiswa,
            isLoading, setIsLoading,
            notification, setNotification
        }}>
            {children}
        </DataContext.Provider>
    );
};
