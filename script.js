// Inisialisasi variabel dan data
let currentQueue = {
    number: null,
    operator: null,
    time: null
};

let queueHistory = [];
let isMuted = false;
let audioVolume = 0.7;
let nextQueueNumbers = [1, 2, 3];

// Data operator
const operators = {
    1: { name: "Operator 1 - Pendaftaran", counter: "Loket 1" },
    2: { name: "Operator 2 - Berkas", counter: "Loket 2" },
    3: { name: "Operator 3 - Tes Akademik", counter: "Loket 3" },
    4: { name: "Operator 4 - Wawancara", counter: "Loket 4" },
    5: { name: "Operator 5 - Kesehatan", counter: "Loket 5" },
    6: { name: "Operator 6 - Pembayaran", counter: "Loket 6" },
    7: { name: "Operator 7 - Pengumuman", counter: "Loket 7" },
    8: { name: "Operator 8 - Konsultasi", counter: "Loket 8" }
};

// Update tanggal dan waktu secara real-time
function updateDateTime() {
    const now = new Date();
    
    // Format tanggal
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('id-ID', optionsDate);
    document.getElementById('current-date').textContent = formattedDate;
    
    // Format waktu
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;
}

// Fungsi untuk mengucapkan teks dengan Web Speech API
function speakText(text) {
    if (isMuted) return;
    
    // Hapus semua sintesis suara yang sedang berjalan
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9; // Kecepatan bicara
    utterance.pitch = 1; // Nada suara
    utterance.volume = audioVolume;
    
    // Coba gunakan suara wanita jika tersedia
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
        voice.lang.includes('id') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => voice.lang.includes('id'));
    
    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }
    
    window.speechSynthesis.speak(utterance);
}

// Fungsi untuk memanggil antrian
function callQueue() {
    const queueNumber = document.getElementById('queue-number').value;
    const operatorId = document.getElementById('operator').value;
    
    if (!queueNumber || queueNumber < 1) {
        alert("Masukkan nomor antrian yang valid!");
        return;
    }
    
    // Update antrian saat ini
    currentQueue = {
        number: queueNumber,
        operator: operators[operatorId].name,
        operatorId: operatorId,
        counter: operators[operatorId].counter,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    
    // Update tampilan
    document.getElementById('current-queue-number').textContent = queueNumber;
    document.getElementById('current-operator').textContent = operators[operatorId].name;
    
    document.getElementById('display-queue-number').textContent = queueNumber;
    document.getElementById('display-operator').textContent = `Operator: ${operators[operatorId].name}`;
    document.getElementById('display-counter').textContent = operators[operatorId].counter;
    
    // Tambahkan ke riwayat
    addToHistory(currentQueue);
    
    // Update status operator
    updateOperatorStatus(operatorId, 'busy');
    
    // Update antrian berikutnya
    updateNextQueues(parseInt(queueNumber));
    
    // Ucapkan panggilan antrian
    const announcement = `Nomor antrian ${queueNumber}, menuju ${operators[operatorId].name}, di ${operators[operatorId].counter}.`;
    speakText(announcement);
    
    // Animasi panggilan
    animateCall();
}

// Fungsi untuk menambahkan ke riwayat antrian
function addToHistory(queue) {
    const queueItem = {
        number: queue.number,
        operator: queue.operator,
        time: queue.time
    };
    
    queueHistory.unshift(queueItem); // Tambahkan di awal array
    
    // Batasi riwayat hanya 10 item terakhir
    if (queueHistory.length > 10) {
        queueHistory.pop();
    }
    
    updateHistoryDisplay();
}

// Fungsi untuk memperbarui tampilan riwayat
function updateHistoryDisplay() {
    const queueList = document.getElementById('queue-list');
    queueList.innerHTML = '';
    
    queueHistory.forEach(item => {
        const queueItem = document.createElement('div');
        queueItem.className = 'queue-item';
        queueItem.innerHTML = `
            <div class="queue-info">Antrian ${item.number} - ${item.operator}</div>
            <div class="queue-time">${item.time}</div>
        `;
        queueList.appendChild(queueItem);
    });
}

// Fungsi untuk memperbarui antrian berikutnya
function updateNextQueues(currentNumber) {
    // Generate 3 nomor berikutnya
    nextQueueNumbers = [
        currentNumber + 1,
        currentNumber + 2,
        currentNumber + 3
    ];
    
    const nextQueuesContainer = document.getElementById('next-queues');
    nextQueuesContainer.innerHTML = '';
    
    nextQueueNumbers.forEach(number => {
        const nextItem = document.createElement('div');
        nextItem.className = 'next-item';
        nextItem.textContent = number;
        nextQueuesContainer.appendChild(nextItem);
    });
    
    // Update input nomor antrian berikutnya
    document.getElementById('queue-number').value = currentNumber + 1;
}

// Fungsi untuk antrian berikutnya (otomatis)
function nextQueue() {
    // Ambil nomor antrian saat ini dari tampilan atau buat yang baru
    let currentNumber = currentQueue.number ? parseInt(currentQueue.number) : 1;
    
    if (!currentNumber || isNaN(currentNumber)) {
        currentNumber = 1;
    }
    
    // Pilih operator secara acak yang tersedia
    const availableOperators = Array.from(document.querySelectorAll('.operator-card .available'))
        .map(el => el.closest('.operator-card').dataset.operator)
        .filter(Boolean);
    
    let selectedOperator;
    if (availableOperators.length > 0) {
        // Pilih operator acak yang tersedia
        selectedOperator = availableOperators[Math.floor(Math.random() * availableOperators.length)];
    } else {
        // Jika tidak ada yang tersedia, pilih operator 1-8 secara berurutan
        selectedOperator = String((currentNumber % 8) + 1);
    }
    
    // Set nilai di form
    document.getElementById('queue-number').value = currentNumber + 1;
    document.getElementById('operator').value = selectedOperator;
    
    // Panggil antrian
    callQueue();
}

// Fungsi untuk mereset antrian
function resetQueue() {
    if (confirm("Apakah Anda yakin ingin mereset semua antrian? Riwayat akan dihapus.")) {
        currentQueue = {
            number: null,
            operator: null,
            time: null
        };
        
        queueHistory = [];
        nextQueueNumbers = [1, 2, 3];
        
        // Reset tampilan
        document.getElementById('current-queue-number').textContent = '--';
        document.getElementById('current-operator').textContent = 'Belum ada panggilan';
        
        document.getElementById('display-queue-number').textContent = '--';
        document.getElementById('display-operator').textContent = 'Operator: --';
        document.getElementById('display-counter').textContent = 'Loket: --';
        
        document.getElementById('queue-number').value = 1;
        document.getElementById('queue-list').innerHTML = '';
        
        // Reset antrian berikutnya
        const nextQueuesContainer = document.getElementById('next-queues');
        nextQueuesContainer.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const nextItem = document.createElement('div');
            nextItem.className = 'next-item';
            nextItem.textContent = '--';
            nextQueuesContainer.appendChild(nextItem);
        }
        
        // Reset semua operator ke status tersedia
        for (let i = 1; i <= 8; i++) {
            updateOperatorStatus(i, 'available');
        }
        
        alert("Sistem antrian telah direset!");
    }
}

// Fungsi untuk memperbarui status operator
function updateOperatorStatus(operatorId, status) {
    const operatorCard = document.querySelector(`.operator-card[data-operator="${operatorId}"]`);
    if (!operatorCard) return;
    
    const statusElement = operatorCard.querySelector('.operator-status');
    statusElement.textContent = status === 'available' ? 'Tersedia' : 'Sibuk';
    statusElement.className = 'operator-status ' + status;
}

// Fungsi untuk menguji suara
function testVoice() {
    const testText = "Ini adalah uji suara dari sistem antrian SPMB SMA Negeri 1 Magetan. Suara dapat didengar dengan baik.";
    speakText(testText);
}

// Fungsi untuk mute/unmute suara
function toggleMute() {
    isMuted = !isMuted;
    const muteBtn = document.getElementById('mute-btn');
    
    if (isMuted) {
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i> Hidupkan Suara';
        muteBtn.style.backgroundColor = '#4CAF50';
        window.speechSynthesis.cancel(); // Hentikan semua ucapan
    } else {
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Matikan Suara';
        muteBtn.style.backgroundColor = '';
    }
}

// Fungsi untuk mengatur volume
function setVolume(value) {
    audioVolume = parseFloat(value);
}

// Animasi panggilan antrian
function animateCall() {
    const displayQueue = document.getElementById('display-queue-number');
    const display = document.querySelector('.called-queue');
    
    // Reset animasi
    displayQueue.style.transform = 'scale(1)';
    display.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    
    // Trigger animasi
    setTimeout(() => {
        displayQueue.style.transform = 'scale(1.1)';
        display.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
        
        setTimeout(() => {
            displayQueue.style.transform = 'scale(1)';
            display.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        }, 300);
    }, 10);
}

// Inisialisasi aplikasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Update waktu setiap detik
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Inisialisasi antrian berikutnya
    updateNextQueues(1);
    
    // Event listeners untuk tombol
    document.getElementById('call-btn').addEventListener('click', callQueue);
    document.getElementById('next-btn').addEventListener('click', nextQueue);
    document.getElementById('reset-btn').addEventListener('click', resetQueue);
    document.getElementById('test-voice-btn').addEventListener('click', testVoice);
    document.getElementById('mute-btn').addEventListener('click', toggleMute);
    document.getElementById('volume-slider').addEventListener('input', function(e) {
        setVolume(e.target.value);
    });
    
    // Event listener untuk input nomor antrian (Enter key)
    document.getElementById('queue-number').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            callQueue();
        }
    });
    
    // Event listener untuk klik pada kartu operator
    document.querySelectorAll('.operator-card').forEach(card => {
        card.addEventListener('click', function() {
            const operatorId = this.dataset.operator;
            document.getElementById('operator').value = operatorId;
            
            // Highlight operator yang dipilih
            document.querySelectorAll('.operator-card').forEach(c => {
                c.style.borderColor = '';
            });
            this.style.borderColor = '#26d0ce';
        });
    });
    
    // Inisialisasi Web Speech API
    if ('speechSynthesis' in window) {
        // Chrome memerlukan voices di-load terlebih dahulu
        speechSynthesis.getVoices();
        setTimeout(() => {
            console.log("Web Speech API siap digunakan.");
        }, 500);
    } else {
        alert("Browser Anda tidak mendukung Web Speech API. Fitur suara tidak akan berfungsi.");
    }
    
    // Tampilkan pesan selamat datang
    setTimeout(() => {
        if (!isMuted) {
            const welcomeText = "Selamat datang di sistem antrian S P M B SMA Negeri 1 Magetan. Silakan ambil nomor antrian dan tunggu panggilan.";
            speakText(welcomeText);
        }
    }, 1000);
});