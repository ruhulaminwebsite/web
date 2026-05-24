const CONFIG = {
    backendURL: "https://script.google.com/macros/s/AKfycbxYhOqNbvO8Y3SHfk-nrvJv9S1CmkCzktB1YKbUbsnoT8nXJ1q7uGfm_c9NttBLPvCDew/exec"
};

let isLoggedIn = false;
let countdownInterval;

window.onload = function() {
    checkLoginStatus();
};

function setNotice(msg) {
    const noticeEl = document.getElementById('dynamicNotice');
    if(noticeEl) noticeEl.innerText = msg;
}

function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('proToolsUser'));
    if (user && user.isLoggedIn) {
        isLoggedIn = true;
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        
        const navBtn = document.getElementById('navAuthBtn');
        navBtn.innerHTML = `<i class="ph-bold ph-sign-out mr-1.5"></i> Log Out`;
        navBtn.classList.replace('bg-white', 'bg-red-500');
        navBtn.classList.replace('text-brandBg', 'text-white');
        navBtn.onclick = logout;

        document.getElementById('dashUserName').innerText = user.name || "Client";
        syncUserPlan(user);
    } else {
        setNotice("🚀 System Online: Please Login or Register and use your VIP code to unlock the Ultimate CPA Marketers Toolkit & Automation Bots.");
    }
}

function syncUserPlan(user) {
    const data = new URLSearchParams();
    data.append('action', 'check_status');
    data.append('email', user.email);
    
    fetch(CONFIG.backendURL, { method: 'POST', body: data })
    .then(res => res.json())
    .then(result => {
        if (result.result === 'success') {
            user.plan = result.plan;
            user.expiry = result.expiry || "";
            localStorage.setItem('proToolsUser', JSON.stringify(user));
            updateUIBasedOnPlan(user);
        } else {
            logout();
        }
    })
    .catch(err => {
        updateUIBasedOnPlan(user);
    });
}

function updateUIBasedOnPlan(user) {
    const plan = user.plan;
    const isPremium = (plan && plan !== 'Free');
    
    const vipCodeBox = document.getElementById('vipCodeBox');
    const timerBox = document.getElementById('countdownTimer');
    
    if (isPremium) {
        setNotice("Account Verified. All premium automation tools and bot software are now active.");
        vipCodeBox.classList.add('hidden');
        timerBox.classList.remove('hidden');
        
        startCountdown(user.expiry);
        
        // UNLOCK All UI Icons (Visual Change)
        const unlockClass = "ph-fill ph-check-circle absolute top-6 right-6 text-emerald-400 text-xl transition z-20";
        ['ua', 'email', 'validator', 'cpa', 'proxy', 'address', 'mix', 'upcoming', 'dl_clicker'].forEach(id => {
            const icon = document.getElementById(`lock_${id}`);
            if(icon) icon.className = unlockClass;
        });

    } else {
        setNotice("Access Restricted: Please enter your VIP activation code to enable tools and software.");
        vipCodeBox.classList.remove('hidden');
        timerBox.classList.add('hidden');
        
        clearInterval(countdownInterval);
        
        // LOCK All UI Icons
        const lockClass = "ph-fill ph-lock-key absolute top-6 right-6 text-slate-600 group-hover:text-red-500 transition text-xl z-20";
        ['ua', 'email', 'validator', 'cpa', 'proxy', 'address', 'mix', 'upcoming', 'dl_clicker'].forEach(id => {
            const icon = document.getElementById(`lock_${id}`);
            if(icon) icon.className = lockClass;
        });
    }
    
    let savedTab = localStorage.getItem('lastDashTab') || 'tools';
    switchDashTab(savedTab);
}

function startCountdown(expiryTimestamp) {
    clearInterval(countdownInterval);
    const timerDiv = document.getElementById('countdownTimer');
    
    if (!expiryTimestamp) {
        timerDiv.className = "w-full";
        timerDiv.innerHTML = `<div class="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl text-emerald-400 font-bold text-sm flex items-center justify-center gap-2"><i class="ph-bold ph-infinity text-lg"></i> LIFETIME SYSTEM ACCESS</div>`;
        return;
    }

    function update() {
        const now = new Date().getTime();
        const distance = expiryTimestamp - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            timerDiv.innerHTML = '<div class="text-red-500 font-black text-center py-2 bg-red-500/10 rounded-xl border border-red-500/20">ACCESS EXPIRED</div>';
            const user = JSON.parse(localStorage.getItem('proToolsUser'));
            if(user.plan !== 'Free') syncUserPlan(user);
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        timerDiv.className = "flex flex-col gap-2";
        timerDiv.innerHTML = `
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">System Validity Remaining</label>
            <div class="flex items-center gap-3">
                <div class="bg-brandBg border border-white/10 px-4 py-2 rounded-xl text-center"><span class="text-2xl font-black text-white leading-none">${days}</span><span class="text-[9px] text-slate-500 font-bold block">DAYS</span></div>
                <div class="text-slate-600 font-bold text-2xl">:</div>
                <div class="bg-brandBg border border-white/10 px-4 py-2 rounded-xl text-center"><span class="text-2xl font-black text-white leading-none">${hours}</span><span class="text-[9px] text-slate-500 font-bold block">HOURS</span></div>
            </div>
        `;
    }
    
    update();
    countdownInterval = setInterval(update, 60000); 
}

function switchDashTab(tName) {
    localStorage.setItem('lastDashTab', tName);
    
    document.querySelectorAll('.dash-tab-content').forEach(e => e.classList.add('hidden'));
    document.querySelectorAll('[id^="tabBtn-"]').forEach(b => { 
        b.classList.remove('bg-emerald-500/10', 'border-emerald-500', 'text-white', 'shadow-xl'); 
        b.classList.add('bg-brandSurface', 'text-slate-400', 'border-white/5'); 
    });
    
    const contentBox = document.getElementById('tabContent-' + tName);
    if(contentBox) contentBox.classList.remove('hidden');
    
    const active = document.getElementById('tabBtn-' + tName);
    if(active) {
        active.classList.remove('bg-brandSurface', 'text-slate-400', 'border-white/5'); 
        active.classList.add('bg-emerald-500/10', 'border-emerald-500', 'text-white', 'shadow-xl'); 
    }
}

function openAuthModal() { 
    if(isLoggedIn) {
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        window.scrollTo(0,0);
        return;
    }
    document.getElementById('authModal').classList.remove('hidden'); 
    switchTab('login'); 
}

function closeAuthModal() { 
    document.getElementById('authModal').classList.add('hidden'); 
}

function switchTab(tab) { 
    const loginForm = document.getElementById('loginForm'); 
    const registerForm = document.getElementById('registerForm'); 
    const tabLogin = document.getElementById('tabLogin'); 
    const tabRegister = document.getElementById('tabRegister'); 
    
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    
    if (tab === 'login') { 
        loginForm.classList.remove('hidden'); 
        tabLogin.className = "flex-1 py-5 text-sm font-black text-emerald-400 border-b-2 border-emerald-500 bg-white/5 transition"; 
        tabRegister.className = "flex-1 py-5 text-sm font-black text-slate-500 hover:text-white transition"; 
    } else if (tab === 'register') { 
        registerForm.classList.remove('hidden'); 
        tabRegister.className = "flex-1 py-5 text-sm font-black text-emerald-400 border-b-2 border-emerald-500 bg-white/5 transition"; 
        tabLogin.className = "flex-1 py-5 text-sm font-black text-slate-500 hover:text-white transition"; 
    }
}

function togglePassword(inputId, icon) { 
    const input = document.getElementById(inputId); 
    if (input.type === "password") { 
        input.type = "text"; icon.classList.replace('ph-eye', 'ph-eye-slash'); 
    } else { 
        input.type = "password"; icon.classList.replace('ph-eye-slash', 'ph-eye'); 
    } 
}

function logout() { 
    localStorage.removeItem('proToolsUser'); 
    location.reload(); 
}

function handleAuth(event, action) { 
    event.preventDefault(); 
    const form = event.target; 
    const formData = new FormData(form); 
    const msgDiv = document.getElementById('authMessage'); 
    const btn = form.querySelector('button[type="submit"]'); 
    const originalText = btn.innerText; 
    
    btn.innerHTML = `Processing...`; 
    btn.disabled = true; 
    msgDiv.classList.add('hidden'); 
    
    const data = new URLSearchParams(); 
    data.append('action', action); 
    for (const pair of formData) data.append(pair[0], pair[1]); 
    
    fetch(CONFIG.backendURL, { method: 'POST', body: data })
    .then(res => res.json())
    .then(result => { 
        msgDiv.classList.remove('hidden'); 
        if (result.result === 'success') { 
            msgDiv.className = "px-8 pb-8 text-center text-sm font-bold text-emerald-400 bg-emerald-500/5 pt-4"; 
            msgDiv.innerText = result.message; 
            
            if (action === 'login') { 
                const userData = { isLoggedIn: true, name: result.userData.name, email: result.userData.email, plan: result.userData.plan, expiry: result.userData.expiry }; 
                localStorage.setItem('proToolsUser', JSON.stringify(userData)); 
                setTimeout(() => { closeAuthModal(); location.reload(); }, 1000); 
            } else if (action === 'register') { 
                form.reset(); 
                setTimeout(() => { switchTab('login'); msgDiv.innerText = "Identity Created! Please Login."; }, 2000); 
            }
        } else { 
            msgDiv.className = "px-8 pb-8 text-center text-sm font-bold text-red-400 bg-red-500/5 pt-4"; 
            msgDiv.innerText = result.message; 
        } 
    })
    .catch(err => { 
        msgDiv.classList.remove('hidden');
        msgDiv.className = "px-8 pb-8 text-center text-sm font-bold text-red-400";
        msgDiv.innerText = "System Connectivity Error. Try again."; 
    })
    .finally(() => { 
        btn.innerText = originalText; 
        btn.disabled = false; 
    }); 
}

function checkAccess(urlOrAction) { 
    const user = JSON.parse(localStorage.getItem('proToolsUser')); 
    if (!user || !user.isLoggedIn) { 
        openAuthModal(); 
        return; 
    } 
    
    if (!user.plan || user.plan === 'Free') { 
        // Force scroll to VIP input if trying to access tools without plan
        document.getElementById('vipCodeBox').scrollIntoView({behavior:'smooth'});
        alert("🔒 Access Denied: Please enter a VIP code to unlock this feature.");
    } else { 
        if (urlOrAction === 'dl_clicker') {
            window.open("https://drive.google.com/file/d/1xab3lwinRthis9Cn_-1NZMaOvBX7vcOE/view?usp=sharing", '_blank');
        } else {
            window.location.href = urlOrAction;
        }
    } 
}

function applyVipFromDash() {
    executeRedeem('dashVipInput');
}

function executeRedeem(inputId) {
    const codeInput = document.getElementById(inputId);
    const code = codeInput.value.trim();
    const user = JSON.parse(localStorage.getItem('proToolsUser'));
    
    if (!user || !user.isLoggedIn) { openAuthModal(); return; }
    if (!code) { alert("⚠️ Please enter a VIP access code!"); return; }
    
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerHTML = `Verifying...`;
    btn.disabled = true;

    const data = new URLSearchParams();
    data.append('action', 'redeem');
    data.append('email', user.email);
    data.append('code', code);
    
    fetch(CONFIG.backendURL, { method: 'POST', body: data })
    .then(res => res.json())
    .then(result => {
        if (result.result === 'success') {
            alert(`✅ System Unlocked Successfully!`);
            user.plan = result.newPlan;
            user.expiry = result.newExpiry;
            localStorage.setItem('proToolsUser', JSON.stringify(user));
            location.reload();
        } else { 
            alert("❌ Error: " + result.message); 
        }
    })
    .catch(err => { alert("❌ Verification Server Offline."); })
    .finally(() => {
        btn.innerText = originalText;
        btn.disabled = false;
    });
}
function verifyVipCode() {
  const code = document.getElementById('vipInput').value;
  const url = "https://script.google.com/macros/s/AKfycbwEsHsQfSGxUvKMG4fgbkzAcloaWOWmyReD_qrzYWCjzdxS8o-OWmyTUsHXMTy_qj4Z/exec"; 

  fetch(url + "?action=verifyCode&code=" + code)
  .then(res => res.json())
  .then(data => {
    if(data.status === 'success') {
      alert("Success! Your " + data.days + " days access is activated.");
      // এরপর ইউজারকে ড্যাশবোর্ডে রিডাইরেক্ট করুন
    } else {
      alert(data.message);
    }
  });
}