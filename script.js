// --- 1. MAGNETIC BUTTONS ---
        const magnets = document.querySelectorAll('.btn');
        magnets.forEach(magnet => {
            magnet.addEventListener('mousemove', function(e) {
                const position = magnet.getBoundingClientRect();
                const x = e.clientX - position.left - position.width / 2;
                const y = e.clientY - position.top - position.height / 2;
                magnet.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
            });
            magnet.addEventListener('mouseleave', function(e) {
                magnet.style.transform = 'translate(0px, 0px)';
            });
        });

        // --- 2. CANVAS PARTICLES (NEURAL NET) ---
        const canvas = document.getElementById('particles-bg');
        if(canvas) {
            const ctx = canvas.getContext('2d');
            let particlesArray = [];
            const mouse = { x: null, y: null, radius: 120 };

            function resizeCanvas() {
                canvas.width = canvas.parentElement.offsetWidth;
                canvas.height = canvas.parentElement.offsetHeight;
            }
            window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
            
            canvas.addEventListener('mousemove', function(event) {
                const rect = canvas.getBoundingClientRect();
                mouse.x = event.clientX - rect.left;
                mouse.y = event.clientY - rect.top;
            });
            canvas.addEventListener('mouseleave', function() {
                mouse.x = null;
                mouse.y = null;
            });

            class Particle {
                constructor(x, y, dx, dy, size) {
                    this.x = x; this.y = y;
                    this.dx = dx; this.dy = dy;
                    this.size = size;
                }
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                    ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
                    ctx.fill();
                }
                update() {
                    if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
                    if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;
                    
                    if(mouse.x != null) {
                        let mx = mouse.x - this.x; let my = mouse.y - this.y;
                        let distance = Math.sqrt(mx*mx + my*my);
                        if (distance < mouse.radius) {
                            // Dodge mouse
                            const force = (mouse.radius - distance) / mouse.radius;
                            this.x -= (mx/distance) * force * 3;
                            this.y -= (my/distance) * force * 3;
                        }
                    }
                    this.x += this.dx; this.y += this.dy;
                    this.draw();
                }
            }

            function initParticles() {
                particlesArray = [];
                resizeCanvas();
                let num = (canvas.height * canvas.width) / 15000;
                for (let i = 0; i < num; i++) {
                    let size = Math.random() * 2 + 0.5;
                    let x = Math.random() * canvas.width;
                    let y = Math.random() * canvas.height;
                    let dx = (Math.random() - 0.5) * 1.5;
                    let dy = (Math.random() - 0.5) * 1.5;
                    particlesArray.push(new Particle(x, y, dx, dy, size));
                }
            }
            
            function animateParticles() {
                requestAnimationFrame(animateParticles);
                ctx.clearRect(0,0,canvas.width, canvas.height);
                for (let i = 0; i < particlesArray.length; i++) {
                    particlesArray[i].update();
                }
                connectParticles();
            }

            function connectParticles() {
                for (let a = 0; a < particlesArray.length; a++) {
                    for (let b = a; b < particlesArray.length; b++) {
                        let dx = particlesArray[a].x - particlesArray[b].x;
                        let dy = particlesArray[a].y - particlesArray[b].y;
                        let dist = dx*dx + dy*dy;
                        if (dist < 12000) {
                            let opacity = 1 - (dist/12000);
                            ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'light' 
                                ? `rgba(0,0,0,${opacity * 0.15})` 
                                : `rgba(255,255,255,${opacity * 0.15})`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                            ctx.stroke();
                        }
                    }
                }
            }
            initParticles(); animateParticles();
        }

        
        
        
        
        // --- 7. CUSTOM CURSOR & UI SOUNDS ---
        const cursorDot = document.getElementById("cursor-dot");
        const cursorOutline = document.getElementById("cursor-outline");

        if(window.innerWidth > 768 && cursorDot && cursorOutline) {
            window.addEventListener("mousemove", function (e) {
                const posX = e.clientX;
                const posY = e.clientY;
                cursorDot.style.left = `${posX}px`;
                cursorDot.style.top = `${posY}px`;
                cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 300, fill: "forwards" });
            });

            const interactables = document.querySelectorAll('a, button, .btn, .project-card, .tech-category, input, textarea');
            interactables.forEach(el => {
                el.addEventListener('mouseenter', () => cursorOutline.classList.add('custom-cursor-hover'));
                el.addEventListener('mouseleave', () => cursorOutline.classList.remove('custom-cursor-hover'));
            });
        }

        // Web Audio API Synth for Premium UI Sounds
        let audioCtx;
        function initAudio() {
            if(!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }
        
        function playBeep(freq = 400, type = 'sine', duration = 0.05, vol = 0.02) {
            if(!audioCtx) return;
            if(audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        }

        // Initialize audio on first click anywhere (browser policy)
        document.body.addEventListener('click', initAudio, {once: true});

        // Theme switch sound
        const audioThemeBtn = document.querySelector('.theme-toggle');
        if(audioThemeBtn) {
            audioThemeBtn.addEventListener('click', () => {
                initAudio();
                playBeep(250, 'sine', 0.15, 0.05); // deep swoosh
            });
        }

        // Terminal typing sound
        const audioTermInput = document.getElementById('terminal-input');
        if(audioTermInput) {
            audioTermInput.addEventListener('keydown', (e) => {
                initAudio();
                if(e.key !== 'Enter') playBeep(800, 'square', 0.02, 0.005); // soft click
                else playBeep(300, 'square', 0.1, 0.02); // enter boop
            });
        }
        
        // Hover tick on nav and buttons
        document.querySelectorAll('.nav-links a, .btn').forEach(el => {
            el.addEventListener('mouseenter', () => {
                if(audioCtx) playBeep(1200, 'sine', 0.02, 0.01);
            });
        });

        // --- 6. PREMIUM PRELOADER ---
        window.addEventListener('load', () => {
            const bootScreen = document.getElementById('boot-screen');
            const loaderText = document.getElementById('loader-text');
            const loaderBar = document.getElementById('loader-bar');
            if(!bootScreen || !loaderText || !loaderBar) return;
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 20) + 10;
                if(progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        bootScreen.style.opacity = '0';
                        bootScreen.style.transform = 'translateY(-30px)';
                        setTimeout(() => bootScreen.style.display = 'none', 600);
                    }, 250);
                }
                loaderText.innerText = progress + '%';
                loaderBar.style.width = progress + '%';
            }, 50);
        });

        // --- 5. 3D TILT EFFECT (APPLE TV STYLE) ---
        const tiltElements = document.querySelectorAll('.project-card, .stat-item, .award-card, .cert-item');
        
        tiltElements.forEach(el => {
            // CSS'te geçişleri yumuşatmak için transition ekliyoruz
            el.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
            
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top;  
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Max dönüş açısı (örn: 8 derece)
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale3d(1.02, 1.02, 1.02)`;
            });
            
            el.addEventListener('mouseleave', () => {
                // Fare ayrıldığında eski konumuna yaylanarak döner
                el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease';
                el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)`;
                
                // Kısa bir süre sonra mousemove için hızlı transition'a geri dön
                setTimeout(() => {
                    el.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
                }, 400);
            });
        });

        // --- 4. TEXT SCRAMBLE EFFECT ---
        class TextScramble {
          constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#_X';
            this.update = this.update.bind(this);
          }
          setText(newText) {
            const oldText = this.el.innerText || '';
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
              const from = oldText[i] || '';
              const to = newText[i] || '';
              const start = Math.floor(Math.random() * 40);
              const end = start + Math.floor(Math.random() * 40);
              this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
          }
          update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
              let { from, to, start, end, char } = this.queue[i];
              if (this.frame >= end) {
                complete++;
                output += to;
              } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                  char = this.randomChar();
                  this.queue[i].char = char;
                }
                output += `<span style="color: var(--text-muted); font-family: var(--font-mono);">${char}</span>`;
              } else {
                output += from;
              }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
              this.resolve();
            } else {
              this.frameRequest = requestAnimationFrame(this.update);
              this.frame++;
            }
          }
          randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
          }
        }

        const scrambleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.dataset.scrambled === "false") {
                    const fx = new TextScramble(entry.target);
                    // Temporarily blank it out so it animates from empty or gibberish
                    entry.target.innerText = Array.from({length: entry.target.dataset.original.length}, () => '!').join('');
                    fx.setText(entry.target.dataset.original);
                    entry.target.dataset.scrambled = "true";
                }
            });
        }, { threshold: 1.0 });

        // Initialize scramblers for section headers (H2)
        setTimeout(() => {
            document.querySelectorAll('section > h2[data-i18n], .hero h1').forEach(el => {
                if(!el.closest('.hero') || el.tagName === 'H1') {
                    el.dataset.original = el.innerText;
                    el.dataset.scrambled = "false";
                    scrambleObserver.observe(el);
                }
            });
        }, 200); // Give time for i18n to set initial text

        // --- 3. TERMINAL EASTER EGGS ---

        // Theme Toggle Logic
        const themeBtn = document.getElementById('themeBtn');
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcons(newTheme);
        }
        
        function updateThemeIcons(theme) {
            if (!sunIcon || !moonIcon) return;
            if (theme === 'light') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
        
        // Init theme
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            window.addEventListener('DOMContentLoaded', () => updateThemeIcons('light'));
        }

        const i18n = {
            tr: {
                nav_about: "Hakkımda",
                nav_experience: "Deneyim",
                nav_projects: "Projeler",
                nav_contact: "İletişim",
                nav_education: "Eğitim",
                hero_title: "Mert Kutlukaya",
                hero_type_1: "> Full-Stack Developer",
                hero_type_2: "> Gömülü Sistemler Geliştiricisi",
                hero_type_3: "> Yazılım Geliştirici | Yapay Zeka & Otonom Sistemler",
                hero_desc: "Mersin Üniversitesi CTIS son sınıf öğrencisi. Gömülü sistemler, otonom araçlar, siber güvenlik ve yazılım geliştirme alanlarında uzmanlaşıyorum.",
                hero_btn_cv: "CV İndir",
                hero_btn_work: "Çalışmalarım",
                stat_exp: "Yıl Aktif Geliştirme",
                stat_proj: "Proje",
                stat_awards: "Ödül",
                stat_repos: "GitHub Reposu",
                about_p1: "Merhaba, ben Mehmet Mert Kutlukaya. Mersin Üniversitesi Bilişim Sistemleri ve Teknolojileri (CTIS) 4. sınıf öğrencisiyim. Tutkum, yazılımı donanımla buluşturan otonom sistemler ve gömülü mühendislik projeleri geliştirmektir.",
                about_p2: "Özellikle İnsansız Hava Aracı (İHA) yazılımları, uçuş kontrol kartı konfigürasyonları (Pixhawk), sensör füzyonu, PID kontrolü ve gömülü bilgisayarlı görü (OpenCV/Raspberry Pi) konularında derin teknik tecrübeye sahibim. Çalışmalarımla TEKNOFEST Uluslararası İHA yarışmasında finalist oldum.",
                about_p3: "Yazılım dünyasının savunma hattında da aktif bir rol alıyorum; SiberVatan Programı kapsamında Alesta Takımı ile CTF yarışmasında Türkiye 3.lüğü elde ettim. Aynı zamanda GDG (Google Developer Groups) Mersin ekibinin çekirdek organizatör üyelerinden biri olarak etkinlik planlama, konuşmacı koordinasyonu ve topluluk yönetimi gibi sorumluluklar üstlenmekteyim.",
                tech_stack_title: "Teknoloji Yığını (Tech Stack)",
                tech_cat_1: "Gömülü Sistemler & Donanım",
                tech_cat_2: "Yapay Zeka & Bilgisayarlı Görü",
                tech_cat_3: "Yazılım (Web & Mobil)",
                tech_cat_4: "DevOps & Araçlar",
                github_activity: "GitHub Aktivitesi",
                skills_title: "Yetenekler",
                skill_1: "Gömülü Sistemler / Donanım",
                skill_cyber: "Siber Güvenlik",
                skill_4: "Web Geliştirme",
                skill_5: "Mobil Geliştirme",
                exp1_date: "Haz 2026 - Eyl 2026",
                exp1_title: "Geliştirici Stajyeri",
                exp1_desc: "İHA (İnsansız Hava Aracı) sistemlerinin uçuş kontrol kartlarına (Pixhawk) entegrasyonu ve konfigürasyonu süreçlerinde aktif rol aldım.<br><br><ul style='margin-left: 1rem; margin-top: 0.5rem;'><li>Sensör telemetrisi ve PID kontrol algoritmalarının test edilip ince ayarlarının (tuning) yapılması.</li><li>Donanım/yazılım entegrasyon testlerinin yürütülmesi ve sistem hatalarının diyagnostiği.</li><li>Otonom uçuş dinamiklerinin sahada analiz edilmesi.</li></ul>",
                exp2_date: "Eyl 2022 - Şub 2024",
                exp2_title: "Oyun Geliştirici",
                exp2_desc: "Unity (C#) oyun motoru kullanarak mobil platformlar için hiper-basit (hypercasual) oyun mekanikleri tasarladım ve geliştirdim.<br><br><ul style='margin-left: 1rem; margin-top: 0.5rem;'><li>Oyun içi performans darbogazlarının tespit edilerek kod optimizasyonlarının yapılması.</li><li>Kalite Güvence (QA) süreçlerine liderlik edilmesi.</li><li>Oyun içi testlerin ve hata raporlamalarının yönetilmesi.</li></ul>",
                exp3_date: "Şub 2022 - Haz 2022",
                exp3_title: "QA / Oyun Test Uzmanı",
                exp3_desc: "Yayın öncesi (pre-release) oyun sürümleri üzerinde kapsamlı Kalite Güvence (QA) testleri yürüttüm.<br><br><ul style='margin-left: 1rem; margin-top: 0.5rem;'><li>Fonksiyonel ve performans testlerinin senaryolara uygun olarak gerçekleştirilmesi.</li><li>Oyun motorundaki hataların detaylı şekilde dökümante edilerek raporlanması.</li><li>Geliştirici ekiple koordineli çalışarak hata çözümlerinin doğrulanması.</li></ul>",
                feat_badge: "Öne Çıkan Ürün",
                feat_desc: "Yapay zeka destekli, tam teşekküllü fizik tabanlı İHA / Drone optimizasyon ve mühendislik platformu (SaaS).",
                feat_f1: "12 Mühendislik Modeli (Momentum Teorisi, Peukert Batarya Modeli vb.)",
                feat_f2: "236+ gerçek üretici donanım kütüphanesi (Motor, ESC, Pervane)",
                feat_f3: "Yapay zeka (AI) destekli maksimum uçuş süresi optimizasyonu",
                feat_f4: "Kapsamlı analiz raporları ve doğrudan ArduPilot .param dışa aktarma",
                filter_all: "Tümü",
                filter_embedded: "Gömülü",
                filter_web: "Web",
                filter_mobile: "Mobil",
                filter_ai: "Yapay Zeka",
                proj1_desc: "Python ve FastAPI kullanılarak geliştirilen, 12 farklı mühendislik modeli ve 236+ bileşen kütüphanesine sahip, yapay zeka destekli Drone optimizasyon ve mühendislik platformu.",
                proj2_title: "Otonom Drone",
                proj2_desc: "TEKNOFEST Uluslararası İHA Yarışması finalist projesi. Raspberry Pi ve Pixhawk altyapısıyla geliştirilen; otonom uçuş, PID kontrolü ve OpenCV ile hassas hedef tespiti yapabilen drone yazılımı.",
                proj3_desc: "STM32 ve CAN Bus mimarisi kullanılarak geliştirilen robotik kol projesi. Gerçek zamanlı görüntü işleme, hassas PID eklem kontrolü ve ters kinematik algoritmalarını içerir.",
                proj4_desc: "Flutter ve Dart kullanılarak, Clean Architecture ve Bloc durum yönetimi (state management) prensipleriyle tasarlanan, çapraz platform (cross-platform) veteriner kliniği uygulaması.",
                proj5_desc: "TÜBİTAK 2242 kapsamında geliştirilen temassız kestirimci bakım sistemi. Video tabanlı titreşim analizleri ve Makine Öğrenmesi (ML) algoritmaları kullanılarak %86.7 doğruluk oranına ulaşıldı.",
                proj6_title: "Oyun Geliştirme Portföyü",
                proj6_desc: "Mobil platformlar için Unity (C#) ile geliştirilen; bellek yönetimi, obje havuzlama (object pooling) ve hypercasual mekanik optimizasyonlarını içeren oyun projeleri koleksiyonu.",
                awards_title: "Ödüller & Sertifikalar",
                certs_title: "Sertifikalar",
                cert_capt_org: "Siber Güvenlik",
                edu_title: "Eğitim",
                edu1_date: "2023 - Devam Ediyor",
                edu1_title: "Bilişim Sistemleri ve Teknolojileri (CTIS)",
                edu1_school: "Mersin Üniversitesi — Erdemli UTİYO",
                edu1_desc: "Lisans (B.Sc.) — 4. Sınıf. Gömülü sistemler, yazılım mühendisliği, veri tabanı yönetimi ve bilgi güvenliği alanlarında kapsamlı akademik eğitim. Üniversite bünyesinde aktif olarak TEKNOFEST ve TÜBİTAK projelerine katılım sağlamaktayım.",
                contact_location_title: "Konum",
                contact_work_pref: "Uzaktan (Remote), Hibrit veya Ofis çalışmaya açığım.",
                contact_lang_title: "Dil Bilgisi",
                lang_tr: "Türkçe",
                lang_tr_level: "Ana Dil",
                lang_en: "İngilizce",
                lang_en_level: "C1 — İleri Düzey",
                award1: "TEKNOFEST Uluslararası İHA Finalisti",
                award2: "SiberVatan CTF 3.lük Ödülü",
                award3: "TEKNOFEST Sosyal İnovasyon Finalisti",
                contact_title: "İletişim",
                contact_desc: "Projeleriniz veya işbirliği için benimle iletişime geçebilirsiniz.",
                footer_text: "© 2026 Mert Kutlukaya. Tüm hakları saklıdır.",
                term_welcome: "Mert OS v2.0. 'help' yazarak komutları görebilirsiniz. (İpucu: 'doom' 😈)"
            },
            en: {
                nav_about: "About",
                nav_experience: "Experience",
                nav_projects: "Projects",
                nav_contact: "Contact",
                nav_education: "Education",
                hero_title: "Mert Kutlukaya",
                hero_type_1: "> Full-Stack Developer",
                hero_type_2: "> Embedded Systems Developer",
                hero_type_3: "> Software Developer | AI & Autonomous Systems",
                hero_desc: "CTIS senior at Mersin University. Specializing in embedded systems, autonomous vehicles, cybersecurity, and software development.",
                hero_btn_cv: "Download CV",
                hero_btn_work: "My Work",
                stat_exp: "Years Active Dev",
                stat_proj: "Projects",
                stat_awards: "Awards",
                stat_repos: "GitHub Repos",
                about_p1: "Hello, I'm Mehmet Mert Kutlukaya, a senior studying Computer Technology and Information Systems (CTIS) at Mersin University. My passion lies in developing autonomous systems and embedded engineering projects that bridge software and hardware.",
                about_p2: "I have deep technical expertise in UAV software, flight controller configurations (Pixhawk), sensor fusion, PID control, and embedded computer vision (OpenCV/Raspberry Pi). My work earned me a finalist position at the TEKNOFEST International UAV Competition.",
                about_p3: "I'm also actively involved in the cybersecurity realm, securing 3rd place in Turkey at the SiberVatan CTF competition with the Alesta Team. As a core organizer for GDG (Google Developer Groups) Mersin, I take on responsibilities including event planning, speaker coordination, and community management.",
                tech_stack_title: "Tech Stack",
                tech_cat_1: "Embedded Systems & Hardware",
                tech_cat_2: "AI & Computer Vision",
                tech_cat_3: "Software (Web & Mobile)",
                tech_cat_4: "DevOps & Tools",
                github_activity: "GitHub Activity",
                skills_title: "Skills",
                skill_1: "Embedded / Hardware",
                skill_4: "Web Development",
                skill_5: "Mobile Development",
                exp1_date: "Jun 2026 - Sep 2026",
                exp1_title: "Developer Intern",
                exp1_desc: "Played an active role in the integration and configuration of UAV systems with flight control boards (Pixhawk).<br><br><ul style='margin-left: 1rem; margin-top: 0.5rem;'><li>Tested and fine-tuned sensor telemetry and PID control algorithms.</li><li>Conducted hardware/software integration tests and diagnosed system faults.</li><li>Analyzed autonomous flight dynamics during field tests.</li></ul>",
                exp2_date: "Sep 2022 - Feb 2024",
                exp2_title: "Game Developer",
                exp2_desc: "Designed and developed hypercasual game mechanics for mobile platforms using the Unity (C#) game engine.<br><br><ul style='margin-left: 1rem; margin-top: 0.5rem;'><li>Identified in-game performance bottlenecks and implemented code optimizations.</li><li>Led Quality Assurance (QA) processes across the team.</li><li>Managed in-game testing and comprehensive bug reporting.</li></ul>",
                exp3_date: "Feb 2022 - Jun 2022",
                exp3_title: "QA / Game Tester",
                exp3_desc: "Conducted comprehensive Quality Assurance (QA) testing on pre-release game builds.<br><br><ul style='margin-left: 1rem; margin-top: 0.5rem;'><li>Executed functional and performance tests according to testing scenarios.</li><li>Documented and reported engine bugs and gameplay glitches in detail.</li><li>Collaborated with the developer team to verify bug fixes.</li></ul>",
                feat_badge: "Featured Product",
                feat_desc: "AI-powered, full-fledged physics-based UAV / Drone optimization and engineering platform (SaaS).",
                feat_f1: "12 Engineering Models (Momentum Theory, Peukert Battery Model, etc.)",
                feat_f2: "236+ real manufacturer hardware library (Motors, ESCs, Propellers)",
                feat_f3: "AI-powered maximum flight time optimization algorithm",
                feat_f4: "Comprehensive analysis reports and direct ArduPilot .param export",
                filter_all: "All",
                filter_embedded: "Embedded",
                filter_web: "Web",
                filter_mobile: "Mobile",
                filter_ai: "AI/ML",
                proj1_desc: "AI-powered full-stack Drone optimization and engineering platform, developed with Python and FastAPI, featuring 12 engineering models and a 236+ component library.",
                proj2_title: "Autonomous Drone",
                proj2_desc: "TEKNOFEST International UAV Finalist project. Autonomous drone software developed on Raspberry Pi and Pixhawk, featuring autonomous flight, PID control, and OpenCV target detection.",
                proj3_desc: "Rover robotic arm project developed using STM32 and CAN Bus architecture. Features real-time image processing, precise PID joint control, and inverse kinematics algorithms.",
                proj4_desc: "Cross-platform veterinary clinic application designed and developed from scratch using Flutter and Dart, implementing Clean Architecture and Bloc state management principles.",
                proj5_desc: "Contactless predictive maintenance system developed for TUBITAK 2242. Achieved 86.7% accuracy using video-based vibration analysis and Machine Learning (ML) algorithms.",
                proj6_title: "Game Dev Portfolio",
                proj6_desc: "Comprehensive collection of game projects developed for mobile platforms using Unity (C#), featuring memory management, object pooling, and hypercasual mechanics optimizations.",
                awards_title: "Awards & Certifications",
                certs_title: "Certifications",
                cert_capt_org: "Cybersecurity",
                edu_title: "Education",
                edu1_date: "2023 - Present",
                edu1_title: "Computer Technology & Information Systems (CTIS)",
                edu1_school: "Mersin University — Erdemli UTİYO",
                edu1_desc: "Bachelor of Science (B.Sc.) — Senior Year. Comprehensive academic training in embedded systems, software engineering, database management, and information security. Actively participating in TEKNOFEST and TUBITAK projects within the university.",
                contact_location_title: "Location",
                contact_work_pref: "Open to Remote, Hybrid, or On-site positions.",
                contact_lang_title: "Languages",
                lang_tr: "Turkish",
                lang_tr_level: "Native",
                lang_en: "English",
                lang_en_level: "C1 — Advanced",
                award1: "TEKNOFEST Int UAV Finalist",
                award2: "SiberVatan CTF 3rd Place",
                award3: "TEKNOFEST Social Innovation Finalist",
                contact_title: "Contact",
                contact_desc: "Feel free to reach out for projects or collaborations.",
                footer_text: "© 2026 Mert Kutlukaya. All rights reserved.",
                term_welcome: "Mert OS v2.0. Type 'help' to see available commands. (Hint: 'doom' 😈)"
            }
        };

        let currentLang = 'tr';

        function toggleLanguage() {
            currentLang = currentLang === 'tr' ? 'en' : 'tr';
            document.documentElement.lang = currentLang;
            
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (i18n[currentLang][key]) {
                    if (el.dataset.scrambled) {
                        el.dataset.original = i18n[currentLang][key];
                        const fx = new TextScramble(el);
                        fx.setText(el.dataset.original);
                    } else {
                        el.innerHTML = i18n[currentLang][key];
                    }
                }
            });
            
            document.getElementById('langBtn').innerText = currentLang === 'tr' ? 'TR / EN' : 'EN / TR';
        }

        
        // Typewriter Effect
        let typeIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeEl = document.getElementById('typewriter');

        function typeEffect() {
            if (!typeEl) return;
            const currentStrings = [
                i18n[currentLang].hero_type_1,
                i18n[currentLang].hero_type_2,
                i18n[currentLang].hero_type_3
            ];
            const currentText = currentStrings[typeIndex];
            
            if (isDeleting) {
                typeEl.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typeEl.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 30 : 80;
            
            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2500; // Bekleme saniyesi
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                typeIndex = (typeIndex + 1) % currentStrings.length;
                typeSpeed = 500;
            }
            
            setTimeout(typeEffect, typeSpeed);
        }
        setTimeout(typeEffect, 1000);

        // Reveal Animation
        function reveal() {
            const reveals = document.querySelectorAll(".reveal");
            for (let i = 0; i < reveals.length; i++) {
                const windowHeight = window.innerHeight;
                const elementTop = reveals[i].getBoundingClientRect().top;
                const elementVisible = 100;
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add("active");
                }
            }
        }
        window.addEventListener("scroll", reveal);
        setTimeout(reveal, 100);

        // Project Filtering
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                
                projectCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        // Terminal Logic
        const termBtn = document.getElementById('term-btn');
        const terminal = document.getElementById('terminal');
        const termInput = document.getElementById('term-input');
        const termBody = document.getElementById('term-body');
        
        let termOpen = false;

        termBtn.addEventListener('click', () => {
            termOpen = !termOpen;
            if (termOpen) {
                terminal.classList.add('open');
                setTimeout(() => termInput.focus(), 300);
                termBtn.innerHTML = '&#x2715;'; 
            } else {
                terminal.classList.remove('open');
                termBtn.innerHTML = '&gt;_';
            }
        });

        termInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const val = this.value.trim();
                if (val) {
                    printTerm(`<span class="term-prompt">guest@mert:~$</span> ${val}`);
                    processCommand(val.toLowerCase());
                }
                this.value = '';
            }
        });

        function printTerm(html) {
            const line = document.createElement('div');
            line.className = 'term-line';
            line.innerHTML = html;
            termBody.insertBefore(line, termInput.parentElement);
            termBody.scrollTop = termBody.scrollHeight;
        }

        function processCommand(cmd) {
            let res = "";
            const isTR = currentLang === 'tr';

            // --- GAMES LOGIC ---
            window.droneState = window.droneState || { active: false, alt: 0, bat: 100 };
            window.guessTarget = window.guessTarget || Math.floor(Math.random() * 100) + 1;
            const parts = cmd.split(' ');
            const baseCmd = parts[0];

            if(baseCmd === 'slot') {
                const emojis = ['🍒', '🔔', '💎', '7️⃣'];
                const r1 = emojis[Math.floor(Math.random()*emojis.length)];
                const r2 = emojis[Math.floor(Math.random()*emojis.length)];
                const r3 = emojis[Math.floor(Math.random()*emojis.length)];
                let msg = `[ ${r1} | ${r2} | ${r3} ] -> `;
                if(r1 === r2 && r2 === r3) msg += '<span style="color:#0f0">JACKPOT! 🎉</span>';
                else msg += '<span style="color:var(--text-muted)">KAYBETTİNİZ 💸</span>';
                printTerm(msg);
                return;
            }

            if(baseCmd === 'guess') {
                if(parts.length < 2) { printTerm("Kullanım: guess <1-100> (Örn: guess 45)"); return; }
                let g = parseInt(parts[1]);
                if(isNaN(g)) { printTerm("Lütfen sayı girin."); return; }
                if(g === window.guessTarget) {
                    printTerm(`<span style="color:#0f0">TEBRİKLER! Sayı ${window.guessTarget} idi. Yeni sayı tutuldu.</span>`);
                    window.guessTarget = Math.floor(Math.random() * 100) + 1;
                } else if(g < window.guessTarget) { printTerm("Daha BÜYÜK bir sayı...");
                } else { printTerm("Daha KÜÇÜK bir sayı..."); }
                return;
            }

            if(baseCmd === 'hack') {
                const target = parts[1] || 'SİSTEM';
                printTerm(`[${target}] hedefine sızılıyor...`);
                let p = 0;
                let hInt = setInterval(() => {
                    p += Math.floor(Math.random()*30) + 10;
                    if(p >= 100) {
                        p = 100;
                        clearInterval(hInt);
                        printTerm(`<span style="color:#0f0;font-weight:bold;">[${target}] ROOT ERİŞİMİ SAĞLANDI. VERİLER İNDİRİLİYOR...</span>`);
                    } else {
                        printTerm(`Bypass protocol ${p}% ...`);
                    }
                }, 500);
                return;
            }

            if(baseCmd === 'drone') {
                if(parts[1] === 'start') {
                    window.droneState = { active: true, alt: 0, bat: 100 };
                    printTerm("<span style='color:#0f0'>[DRONE] Motorlar çalıştı. İrtifa: 0m | Batarya: %100</span>");
                    printTerm("<span style='color:var(--text-muted)'>Komutlar: up 10, down 5, flip, land</span>");
                    return;
                }
                printTerm("Önce 'drone start' ile başlatın."); return;
            }
            if(window.droneState.active && ['up', 'down', 'flip', 'land'].includes(baseCmd)) {
                if(window.droneState.bat <= 0) {
                    printTerm("<span style='color:red'>[DRONE] Batarya bitti! Drone çakıldı 💥</span>");
                    window.droneState.active = false; return;
                }
                if(baseCmd === 'land') {
                    printTerm("<span style='color:#0f0'>[DRONE] Güvenli iniş yapıldı.</span>");
                    window.droneState.active = false; return;
                }
                if(baseCmd === 'flip') {
                    window.droneState.bat -= 15;
                    printTerm(`[DRONE] 360° Takla atıldı! 🔄 İrtifa: ${window.droneState.alt}m | Batarya: %${window.droneState.bat}`);
                    return;
                }
                let val = parseInt(parts[1]) || 10;
                if(baseCmd === 'up') window.droneState.alt += val;
                if(baseCmd === 'down') window.droneState.alt = Math.max(0, window.droneState.alt - val);
                window.droneState.bat -= 5;
                printTerm(`[DRONE] İrtifa: ${window.droneState.alt}m | Batarya: %${window.droneState.bat}`);
                return;
            }
            
            // 5. DOOM ETERNAL (WEB PORT - MS-DOS SEQUENCE)
            if(baseCmd === 'doom' || baseCmd === 'doom.exe') {
                printTerm("<span style='color:red; font-weight:bold;'>[CRITICAL] CEHENNEM KAPILARI AÇILIYOR... DOOM BAŞLATILIYOR!</span>");
                const dosLines = [
                    "C:\\GAMES\\DOOM> DOOM.EXE",
                    "DOOM Operating System v1.9",
                    "V_Init: allocate screens.",
                    "M_LoadDefaults: Load system defaults.",
                    "Z_Init: Init zone memory allocation daemon.",
                    "W_Init: Init WADfiles.",
                    "     adding doom1.wad",
                    "M_Init: Init miscellaneous info.",
                    "R_Init: Init DOOM refresh daemon - [",
                    "                     .................]",
                    "P_Init: Init Playloop state.",
                    "I_Init: Setting up machine state.",
                    "D_CheckNetGame: Checking network game status.",
                    "startskill 2  deathmatch: 0  startmap: 1  startepisode: 1",
                    "player 1 of 1 (1 nodes)",
                    "<span style='color:#0f0; font-weight:bold;'>SİSTEM HAZIR. GRAFİK ARAYÜZÜNE GEÇİLİYOR...</span>"
                ];
                
                let idx = 0;
                let dosInterval = setInterval(() => {
                    if(idx < dosLines.length) {
                        printTerm(`<span style="color:#d3d3d3; font-family:var(--font-mono);">${dosLines[idx]}</span>`);
                        idx++;
                    } else {
                        clearInterval(dosInterval);
                        setTimeout(() => {
                            const doomModal = document.createElement('div');
                            doomModal.id = 'doom-container';
                            doomModal.style.position = 'fixed';
                            doomModal.style.top = '0'; doomModal.style.left = '0';
                            doomModal.style.width = '100vw'; doomModal.style.height = '100vh';
                            doomModal.style.backgroundColor = '#000'; doomModal.style.zIndex = '9999999';
                            doomModal.style.display = 'flex'; doomModal.style.flexDirection = 'column';
                            doomModal.style.alignItems = 'center'; doomModal.style.justifyContent = 'center';
                            doomModal.innerHTML = "<div style='position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size:100% 2px, 3px 100%; pointer-events:none; z-index:10;'></div><div style='width:100%; text-align:right; padding:15px; position:absolute; top:0; z-index:20;'><button onclick=\"document.getElementById('doom-container').remove()\" style='background:#ff0000; color:white; border:2px solid #fff; padding:10px 25px; cursor:pointer; font-family:var(--font-mono); font-weight:bold; font-size:1.2rem; transition:transform 0.1s;'>[X] MS-DOS'A DÖN</button></div><iframe width='800' height='600' src='https://silentspacemarine.com/' frameborder='0' allowfullscreen style='border: 4px solid #333; border-radius: 5px; z-index:5; box-shadow: 0 0 50px rgba(255,0,0,0.5);'></iframe><div style='color:#0f0; font-family:var(--font-mono); margin-top:20px; z-index:5; text-align:center;'><h3>MS-DOS EMÜLATÖRÜ AKTİF</h3><p>Yön tuşları hareket, BOŞLUK (Space) ateş, CTRL etkileşim.<br><span style='color:white; font-weight:bold;'>(Fareyi serbest bırakıp ÇIKIŞ butonuna tıklamak için klavyeden <strong>ESC</strong> tuşuna basın)</span></p></div>";
                            document.body.appendChild(doomModal);
                        }, 800);
                    }
                }, 150); // fast ms-dos loading speed
                return;
            }

            // --- END GAMES LOGIC ---

            
            switch(cmd) {
                case 'sudo mert':
                case 'matrix':
                    const mx = setInterval(() => {
                        printTerm('<span style="color:#0f0;font-family:monospace;word-break:break-all;">' + Array.from({length:40}, () => String.fromCharCode(33+Math.random()*93)).join('') + '</span>');
                    }, 50);
                    setTimeout(() => { clearInterval(mx); printTerm('<span style="color:#0f0;">Matrix escape successful.</span>'); }, 1500);
                    return;
                case 'profile':
                    printTerm('<pre style="color:var(--text-main); font-size:10px; line-height:10px;">' +
' __  __           _   \n' +
'|  \\/  |         | |  \n' +
'| \\  / | ___ _ __| |_ \n' +
'| |\\/| |/ _ \\ "__| __|\n' +
'| |  | |  __/ |  | |_ \n' +
'|_|  |_|\\___|_|   \\__|\n' +
'</pre>');
                    return;
                case 'help':
                    res = isTR ? "Komutlar: help, whoami, skills, projects, clear, profile, matrix\nOyunlar: <span style='color:#ff003c; font-weight:bold; text-shadow:0 0 5px red;'>doom</span>, hack <hedef>, drone start, slot, guess <1-100>" : "Commands: help, whoami, skills, projects, clear, profile, matrix\nGames: <span style='color:#ff003c; font-weight:bold; text-shadow:0 0 5px red;'>doom</span>, hack <target>, drone start, slot, guess <1-100>";
                    break;
                    res = isTR ? 
                        "Komutlar: help, whoami, skills, projects, clear" : 
                        "Commands: help, whoami, skills, projects, clear";
                    break;
                case 'whoami':
                    res = "Mehmet Mert Kutlukaya - Embedded Systems & Autonomous UAV Developer";
                    break;
                case 'skills':
                    res = "Embedded/Hardware, Python/AI-ML, C/C++, Web Dev, Mobile, DevOps";
                    break;
                case 'projects':
                    res = "AeroForge DI, Autonomous Drone, Mars Rover, PetCare App, Visual Vibrometry, Game Dev Portfolio";
                    break;
                case 'clear':
                    const lines = termBody.querySelectorAll('.term-line');
                    lines.forEach(l => {
                        l.remove();
                    });
                    return; 
                default:
                    res = (isTR ? "Komut bulunamadı: " : "Command not found: ") + cmd;
            }
            if (res) {
                printTerm(`<span style="color: var(--text-muted);">${res}</span>`);
            }
        }

// --- 8. ANALYTICS TRACKING ---
console.log('[Analytics] Site ziyareti kaydedildi (Sayfa yüklendi).');
document.querySelectorAll('a, .btn, button').forEach(el => {
    el.addEventListener('click', (e) => {
        let name = el.innerText.trim();
        if(!name && el.getAttribute('aria-label')) name = el.getAttribute('aria-label');
        if(!name && el.id) name = el.id;
        if(name) {
            console.log('[Analytics] Etkileşim kaydedildi: Tıklandı ->', name.replace(/
/g, ' '));
        }
    });
});
