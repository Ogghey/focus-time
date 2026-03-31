import { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FocusContext = createContext();

export function FocusProvider({ children }) {

    const [sessions, setSessions] = useState([]);

    //load data sebelumnya saat aplikasi dibuka, jika ada data yang tersimpan di AsyncStorage
    useEffect(() => {
        loadSession();
    }, []);

    const loadSession = async () => {
        try {
            const data = await AsyncStorage.getItem('sessions');
            if (data) {
                setSessions(JSON.parse(data));
            } else {
                setSessions([]); // Set sessions ke array kosong jika tidak ada data yang tersimpan
            }
        } catch (error) {
            console.error('Error loading session:', error);
        }
    };

    const addSession = async (session) => {
        try {
            const updated = [...sessions, session];

            setSessions(updated);
            await AsyncStorage.setItem('sessions', JSON.stringify(updated));
        } catch (error) {
            console.error('Error saving session:', error);
        }
    };


    return (
        <FocusContext.Provider value={{ sessions, addSession }}>
            {children}
        </FocusContext.Provider>
    );
}

