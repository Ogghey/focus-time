import { useState, useEffect } from 'react'; 

// untuk menerima props (properties/ data yang dikirim dari komponen parent ke komponen child) agar lebih singkat digunakan {} / destructuring
export default function useTimer() {
  const [startTime, setStartTime] = useState(Date.now()); //state untuk menyimpan detik yang sudah berlalu
  const [currentTime, setCurrentTime] = useState(Date.now()); //state untuk menyimpan waktu saat ini
  const [isRunning, setIsRunning] = useState(true); //true agar timer langsung berjalan ketika screen dibuka

useEffect(() => {
  let interval //variabel untuk menyimpan interval timer

  if (isRunning) {
    interval = setInterval(() => { //jalankan fungsi dalam parameter
      setCurrentTime(Date.now());
    }, 1000) //1000ms = 1 detik (dinyatakan dalam detik)
  }

  return () => clearInterval(interval); //fungsi untuk membersihkan interval ketika komponen unmount atau isRunning berubah
}, [isRunning]); //efek ini dijalankan ketika isRunning berubah


  //Hitung selisih waktu
  const seconds = Math.floor((currentTime - startTime) / 1000);


  // fungsi toggle
  const toggleTimer = () => {
    setIsRunning(prev => !prev);}

    return { seconds, isRunning, toggleTimer, startTime}; //mengembalikan state seconds, isRunning, dan fungsi setIsRunning agar bisa digunakan di komponen lain
}