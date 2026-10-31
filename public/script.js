document.addEventListener('DOMContentLoaded', function () {

    // ===== LANDING PAGE SCRIPTS =====

    // 1. ROI Calculator
    const initialModalInput = document.getElementById('initialModal');
    const monthlyInput = document.getElementById('monthlyInvestment');
    const yearsInput = document.getElementById('investmentYears');
    const returnInput = document.getElementById('expectedReturn');
    const valInitial = document.getElementById('valInitial');
    const valMonthly = document.getElementById('valMonthly');
    const valYears = document.getElementById('valYears');
    const valReturn = document.getElementById('valReturn');
    const finalResult = document.getElementById('finalResult');
    const ctx = document.getElementById('roiChart').getContext('2d');
    let roiChart;

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
    }

    function calculateROI() {
        const P = parseFloat(initialModalInput.value);
        const PMT = parseFloat(monthlyInput.value);
        const t = parseInt(yearsInput.value);
        const r = parseFloat(returnInput.value) / 100;
        const n = 12;

        valInitial.textContent = formatRupiah(P);
        valMonthly.textContent = formatRupiah(PMT);
        valYears.textContent = t + ' Tahun';
        valReturn.textContent = returnInput.value + '%';

        let labels = [], principalData = [], totalBalanceData = [];

        for (let year = 1; year <= t; year++) {
            labels.push('Thn ' + year);
            let investedPrincipal = P + (PMT * 12 * year);
            principalData.push(investedPrincipal);
            let totalFV = P * Math.pow(1 + r / n, n * year);
            let futureValueOfSeries = PMT * ((Math.pow(1 + r / n, n * year) - 1) / (r / n));
            totalBalanceData.push(Math.round(totalFV + futureValueOfSeries));
        }

        finalResult.textContent = formatRupiah(totalBalanceData[totalBalanceData.length - 1]);

        if (roiChart) roiChart.destroy();
        roiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Total Hasil (Investasi + Bunga)', data: totalBalanceData, borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: true, tension: 0.3 },
                    { label: 'Total Modal Disetor', data: principalData, borderColor: '#3B82F6', backgroundColor: 'transparent', borderDash: [5, 5], tension: 0.3 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#94A3B8' } } },
                scales: {
                    x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    }

    initialModalInput.addEventListener('input', calculateROI);
    monthlyInput.addEventListener('input', calculateROI);
    yearsInput.addEventListener('input', calculateROI);
    returnInput.addEventListener('input', calculateROI);
    calculateROI();

    // 2. FAQ Accordion
    document.querySelectorAll('.faq-item').forEach(function(item) {
        item.querySelector('.faq-question').addEventListener('click', function() {
            var isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('active'); });
            if (!isActive) item.classList.add('active');
        });
    });

    // 3. Lead Form
    var leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('fullName').value;
            alert('Terima kasih, ' + name + '! Tim Financial Advisor TopInvest Solution akan segera menghubungi Anda melalui WhatsApp.');
            leadForm.reset();
        });
    }

    // ===== FLOATING AI CHATBOT WIDGET =====

    var chatWidget = document.getElementById('chat-widget');
    var chatPanel = document.getElementById('chat-panel');
    var toggleBtn = document.getElementById('chat-toggle-btn');
    var closeBtn = document.getElementById('chat-close-btn');
    var iconOpen = document.getElementById('chat-icon-open');
    var iconClose = document.getElementById('chat-icon-close');
    var chatBox = document.getElementById('chat-box');
    var chatForm = document.getElementById('chat-form');
    var userInput = document.getElementById('user-input');
    var sendBtn = document.getElementById('send-btn');

    var conversation = [];
    var isOpen = false;

    function openChat() {
        isOpen = true;
        chatPanel.classList.add('open');
        iconOpen.style.display = 'none';
        iconClose.style.display = 'block';
        userInput.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function closeChat() {
        isOpen = false;
        chatPanel.classList.remove('open');
        iconOpen.style.display = 'block';
        iconClose.style.display = 'none';
    }

    toggleBtn.addEventListener('click', function() {
        if (isOpen) closeChat(); else openChat();
    });
    closeBtn.addEventListener('click', closeChat);

    function escapeHTML(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function appendMessage(role, html, isHtml) {
        var row = document.createElement('div');
        row.className = 'chat-msg ' + role;
        var bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        if (isHtml) {
            bubble.innerHTML = html;
        } else {
            bubble.innerHTML = escapeHTML(html);
        }
        row.appendChild(bubble);
        chatBox.appendChild(row);
        chatBox.scrollTop = chatBox.scrollHeight;
        return bubble;
    }

    function showTyping() {
        var row = document.createElement('div');
        row.className = 'chat-msg bot';
        row.id = 'typing-row';
        var bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        row.appendChild(bubble);
        chatBox.appendChild(row);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function removeTyping() {
        var el = document.getElementById('typing-row');
        if (el) el.remove();
    }

    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        var userMessage = userInput.value.trim();
        if (!userMessage) return;

        conversation.push({ role: 'user', text: userMessage });
        appendMessage('user', userMessage, false);
        userInput.value = '';
        userInput.disabled = true;
        sendBtn.disabled = true;
        showTyping();

        try {
            var response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversation: conversation })
            });

            removeTyping();

            if (!response.ok) throw new Error('Server error ' + response.status);

            var data = await response.json();
            var reply = data.result || 'Maaf, tidak ada respons dari server.';
            conversation.push({ role: 'bot', text: reply });
            appendMessage('bot', escapeHTML(reply), false);
        } catch (err) {
            removeTyping();
            appendMessage('bot', 'Maaf, terjadi kesalahan. Coba lagi sebentar ya. 🙏', true);
            console.error('Chat error:', err);
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();
        }
    });
});
