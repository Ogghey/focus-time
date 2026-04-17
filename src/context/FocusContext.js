import { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FocusContext = createContext();

export function FocusProvider({ children }) {


    const [sessions, setSessions] = useState([]);
    const [subjects, setSubjects] = useState([]);

    //load data sebelumnya saat aplikasi dibuka, jika ada data yang tersimpan di AsyncStorage
    useEffect(() => {
        loadSession();
        loadSubjects();

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

    const loadSubjects = async () => {
    try {
        const data = await AsyncStorage.getItem('subjects');
        if (data) {
            setSubjects(JSON.parse(data));
        } else {
            setSubjects([]);
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
};  

    const saveSubjects = async (data) => {
    try {
        setSubjects(data);
        await AsyncStorage.setItem('subjects', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving subjects:', error);
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
        <FocusContext.Provider value={{ sessions, addSession, subjects, saveSubjects }}>
            {children}
        </FocusContext.Provider>
    );
}

