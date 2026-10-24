/* ===================================================================
   CHRISTIAN WEDDING INVITATION - CLIENT LOGIC
   Date: November 24, 2026
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const envelopeOverlay = document.getElementById('envelopeOverlay');
    const openInvitationBtn = document.getElementById('openInvitationBtn');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const musicLabel = document.getElementById('musicLabel');

    // Countdown elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // Calendar elements
    const addToCalendarBtn = document.getElementById('addToCalendarBtn');
    const calendarModal = document.getElementById('calendarModal');
    const closeCalendarModal = document.getElementById('closeCalendarModal');
    const googleCalLink = document.getElementById('googleCalLink');
    const appleIcsBtn = document.getElementById('appleIcsBtn');

    // RSVP elements
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpFeedback = document.getElementById('rsvpFeedback');
    const submitRsvpBtn = document.getElementById('submitRsvpBtn');

    // ===============================================================
    // 1. OPENING THE INVITATION & TRIGGERING MUSIC
    // ===============================================================
    let hasOpened = false;

    function openInvitation() {
        if (hasOpened) return;
        hasOpened = true;

        // Play the wedding music upon user gesture
        if (window.weddingAudio) {
            window.weddingAudio.start();
        }

        // Animate out the envelope overlay
        envelopeOverlay.classList.add('opened');

        // Update music button visual
        musicToggleBtn.classList.add('playing');
        musicLabel.textContent = 'Music: Playing';

        // Start petal particle canvas
        initPetalCanvas();
    }

    if (openInvitationBtn) {
        openInvitationBtn.addEventListener('click', openInvitation);
        openInvitationBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openInvitation();
            }
        });
    }

    // Audio listener
    if (window.weddingAudio) {
        window.weddingAudio.onStateChange = (isPlaying) => {
            if (isPlaying) {
                musicToggleBtn.classList.add('playing');
                musicLabel.textContent = 'Music: Playing';
            } else {
                musicToggleBtn.classList.remove('playing');
                musicLabel.textContent = 'Music: Paused';
            }
        };
    }

    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', () => {
            if (window.weddingAudio) {
                window.weddingAudio.toggle();
            }
        });
    }

    // ===============================================================
    // 2. WEDDING COUNTDOWN TIMER (NOVEMBER 24, 2026 at 10:30 AM)
    // ===============================================================
    const weddingDate = new Date('November 24, 2026 10:30:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = weddingDate - now;

        if (difference <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.textContent = days < 100 ? String(days).padStart(2, '0') : days;
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ===============================================================
    // 3. ADD TO CALENDAR (GOOGLE & APPLE/OUTLOOK ICS)
    // ===============================================================
    const eventDetails = {
        title: "Holy Matrimony of David & Sarah",
        description: "Together with their families, David & Sarah invite you to share in the joy of their Christian Holy Matrimony. 'Therefore what God has joined together, let no one separate.' - Mark 10:9",
        location: "St. Michael's Cathedral, Cathedral Crescent, Grace Valley",
        start: "20261124T050000Z", // 10:30 AM local approximate UTC
        end: "20261124T080000Z"
    };

    // Google Calendar Link
    if (googleCalLink) {
        const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.start}/${eventDetails.end}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`;
        googleCalLink.href = gcalUrl;
    }

    // Modal triggers
    if (addToCalendarBtn) {
        addToCalendarBtn.addEventListener('click', () => {
            calendarModal.style.display = 'flex';
        });
    }

    if (closeCalendarModal) {
        closeCalendarModal.addEventListener('click', () => {
            calendarModal.style.display = 'none';
        });
    }

    calendarModal.addEventListener('click', (e) => {
        if (e.target === calendarModal) {
            calendarModal.style.display = 'none';
        }
    });

    // Apple / Outlook .ics download
    if (appleIcsBtn) {
        appleIcsBtn.addEventListener('click', () => {
            const icsContent = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//David & Sarah Wedding//Christian Holy Matrimony//EN",
                "BEGIN:VEVENT",
                `SUMMARY:${eventDetails.title}`,
                `DESCRIPTION:${eventDetails.description}`,
                `LOCATION:${eventDetails.location}`,
                `DTSTART:${eventDetails.start}`,
                `DTEND:${eventDetails.end}`,
                "STATUS:CONFIRMED",
                "END:VEVENT",
                "END:VCALENDAR"
            ].join("\r\n");

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', 'David_and_Sarah_Wedding_Nov24_2026.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            calendarModal.style.display = 'none';
        });
    }

    // ===============================================================
    // 4. RSVP SUBMISSION (SIMPLE, DIGNIFIED, NO FOOD DETAILS)
    // ===============================================================
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('guestName').value.trim();
            const status = document.getElementById('attendanceStatus').value;
            const count = document.getElementById('guestCount').value;

            if (!name) return;

            submitRsvpBtn.disabled = true;
            submitRsvpBtn.textContent = 'Recording Blessings...';

            setTimeout(() => {
                rsvpFeedback.style.display = 'block';
                if (status === 'attending') {
                    rsvpFeedback.innerHTML = `
                        <strong>Thank you, ${escapeHtml(name)}!</strong><br>
                        We rejoice in your presence for ${count} guest(s). Your prayers and blessings mean the world to us.
                    `;
                } else {
                    rsvpFeedback.innerHTML = `
                        <strong>Thank you for letting us know, ${escapeHtml(name)}.</strong><br>
                        Though you cannot be with us in person, we cherish your loving prayers and warm blessings.
                    `;
                }

                submitRsvpBtn.style.display = 'none';
                rsvpForm.reset();
            }, 800);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===============================================================
    // 5. FLOATING WHITE ROSE PETALS & GOLDEN PARTICLES CANVAS
    // ===============================================================
    function initPetalCanvas() {
        const canvas = document.getElementById('petal-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const petals = [];
        const petalCount = 28;

        for (let i = 0; i < petalCount; i++) {
            petals.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                radius: 6 + Math.random() * 8,
                speedY: 0.8 + Math.random() * 1.4,
                speedX: (Math.random() - 0.5) * 0.8,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.02,
                opacity: 0.35 + Math.random() * 0.45,
                colorType: Math.random() > 0.4 ? 'petal' : 'gold'
            });
        }

        function drawPetal(p) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.beginPath();

            if (p.colorType === 'petal') {
                // Soft white / ivory rose petal
                ctx.fillStyle = `rgba(255, 250, 245, ${p.opacity})`;
                ctx.shadowColor = 'rgba(215, 185, 120, 0.25)';
                ctx.shadowBlur = 6;
                // Oval petal curvature
                ctx.ellipse(0, 0, p.radius, p.radius * 1.5, Math.PI / 4, 0, Math.PI * 2);
            } else {
                // Subtle golden stardust
                ctx.fillStyle = `rgba(225, 185, 95, ${p.opacity * 0.9})`;
                ctx.shadowColor = 'rgba(235, 195, 110, 0.5)';
                ctx.shadowBlur = 8;
                ctx.arc(0, 0, p.radius * 0.45, 0, Math.PI * 2);
            }

            ctx.fill();
            ctx.restore();
        }

        function animatePetals() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < petals.length; i++) {
                const p = petals[i];
                p.y += p.speedY;
                p.x += Math.sin(p.y * 0.008) * 0.8 + p.speedX;
                p.rotation += p.rotSpeed;

                if (p.y > height + 20) {
                    p.y = -20;
                    p.x = Math.random() * width;
                }
                if (p.x < -20) p.x = width + 20;
                if (p.x > width + 20) p.x = -20;

                drawPetal(p);
            }

            requestAnimationFrame(animatePetals);
        }

        animatePetals();
    }

});
