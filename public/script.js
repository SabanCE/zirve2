// Doğru token
const CORRECT_TOKEN = 'EGZ-26';

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    const loginForm = document.getElementById('login-form');
    const tokenInput = document.getElementById('token-input');
    const loginError = document.getElementById('login-error');

    // Login işlemi
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const enteredToken = tokenInput.value.trim();
        
        if (enteredToken === CORRECT_TOKEN) {
            // Başarılı giriş
            loginError.classList.add('hidden');
            loginContainer.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            tokenInput.value = '';
            
            // Ana sayfayı başlat
            initializeApp();
        } else {
            // Başarısız giriş
            loginError.textContent = 'Geçersiz token! Tekrar deneyin.';
            loginError.classList.remove('hidden');
            tokenInput.value = '';
            tokenInput.focus();
        }
    });

    // Ana uygulama
    function initializeApp() {
        const namesList = document.getElementById('names-list');
        const selectBtn = document.getElementById('select-btn');
        const winnerSection = document.getElementById('winner-section');
        const winnerName = document.getElementById('winner-name');
        const resetBtn = document.getElementById('reset-btn');
        const errorMessage = document.getElementById('error-message');

        let names = [];

        // Katılımcıları yükle
        async function loadNames() {
            try {
                namesList.innerHTML = '<p class="loading">Yükleniyor...</p>';
                const response = await fetch('/names');
                
                if (!response.ok) {
                    throw new Error('Veriler yüklenemedi');
                }

                names = await response.json();
                displayNames();
                hideError();
            } catch (err) {
                showError('Katılımcılar yüklenemedi: ' + err.message);
                namesList.innerHTML = '<p class="loading">Hata oluştu!</p>';
            }
        }

        // Katılımcıları göster
        function displayNames() {
            namesList.innerHTML = '';
            
            if (names.length === 0) {
                namesList.innerHTML = '<p class="loading">Katılımcı bulunamadı</p>';
                return;
            }

            names.forEach(name => {
                const tag = document.createElement('div');
                tag.className = 'name-tag';
                tag.textContent = name;
                namesList.appendChild(tag);
            });
        }

        // Kazananı seç
        selectBtn.addEventListener('click', async () => {
            if (names.length === 0) {
                showError('Katılımcı bulunamadı!');
                return;
            }

            selectBtn.disabled = true;
            selectBtn.innerHTML = '<span class="btn-text">Seçiliyor...</span><span class="btn-emoji spinning">🎲</span>';

            try {
                const response = await fetch('/winner');
                
                if (!response.ok) {
                    throw new Error('Kazanan seçilemedi');
                }

                const data = await response.json();
                
                // 2 saniye bekleme (dramatik efekt)
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                showWinner(data.winner);
                hideError();
            } catch (err) {
                showError('Hata: ' + err.message);
            } finally {
                selectBtn.disabled = false;
                selectBtn.innerHTML = '<span class="btn-text">Kazananı Seç</span><span class="btn-emoji">🎲</span>';
            }
        });

        // Kazananı göster
        function showWinner(winner) {
            winnerName.textContent = winner;
            document.querySelector('.section').style.display = 'none';
            winnerSection.classList.remove('hidden');
            
            // Kazanan sesini çal (isteğe bağlı)
            playWinnerSound();
            
            // Confetti saçma efekti
            createConfetti();
        }

        // Confetti efekti
        function createConfetti() {
            for (let i = 0; i < 15; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = ['#667eea', '#764ba2', '#f093fb', '#f5576c'][Math.floor(Math.random() * 4)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.animation = `confetti ${2000 + Math.random() * 1000}ms ease-in forwards`;
                document.body.appendChild(confetti);

                setTimeout(() => confetti.remove(), 3000);
            }
        }

        // Kazanan sesi (isteğe bağlı)
        function playWinnerSound() {
            // Modern Web Audio API ile ses efekti
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Kısa müzik parçası çal
                const notes = [880, 1320, 880, 1760];
                const now = audioContext.currentTime;
                
                notes.forEach((freq, index) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    
                    gain.gain.setValueAtTime(0.3, now + index * 0.2);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.2 + 0.15);
                    
                    osc.start(now + index * 0.2);
                    osc.stop(now + index * 0.2 + 0.15);
                });
            } catch (e) {
                // Browsers eski versiyonunda ses çalmaz, sorun değil
            }
        }

        // Tekrar seç
        resetBtn.addEventListener('click', () => {
            winnerSection.classList.add('hidden');
            document.querySelector('.section').style.display = 'block';
        });

        // Hata mesajı göster
        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        }

        // Hata mesajı gizle
        function hideError() {
            errorMessage.classList.add('hidden');
        }

        // Katılımcıları yüklemeyi başlat
        loadNames();
    }
});
