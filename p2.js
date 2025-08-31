document.addEventListener("DOMContentLoaded", () => {
  // ====== VIEW HANDLING ======
  function showView(viewId) {
    document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
    const view = document.getElementById(viewId);
    if (view) {
      view.classList.remove("hidden");
    }
  }

  // ====== VOLUNTEER SECURITY ======
  const volunteerAccounts = [
    { email: "volunteer1@example.com", password: "vol123" },
    { email: "volunteer2@example.com", password: "vol456" },
    { email: "chaitanyapantula25@gmail.com", password: "cha12345" } // your test account
  ];
  const VOLUNTEER_CODE = "VOL-SECRET-2025";

  // ====== LOGIN / SIGNUP ======
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const logoutBtn = document.getElementById("logoutBtn");

  // --- LOGIN HANDLER ---
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const role = document.getElementById("role").value;

      if (!email || password.length < 4) {
        alert("Invalid login. Please try again.");
        return;
      }

      let savedName = email.split("@")[0]; // default name

      if (role === "volunteer") {
        const found = volunteerAccounts.find(
          acc => acc.email === email && acc.password === password
        );

        if (!found) {
          alert("Invalid volunteer credentials!");
          return;
        }

        const code = prompt("Enter volunteer access code:");
        if (code !== VOLUNTEER_CODE) {
          alert("Invalid access code!");
          return;
        }

        console.log("✅ Volunteer login success for:", email);
        savedName = found.email.split("@")[0];
      }

      // ✅ Save session (for both roles)
      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("userName", savedName);
      sessionStorage.setItem("role", role);

      // ✅ Redirect to main dashboard page
      window.location.href = "p1.html";
    });
  }

  // --- SIGNUP HANDLER ---
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value.trim();

      if (name && email && password.length >= 4) {
        localStorage.setItem("userName", name);
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("userName", name);
        sessionStorage.setItem("role", "user"); // Signup defaults to user

        // ✅ Redirect to main dashboard page
        window.location.href = "p1.html";
      } else {
        alert("Please fill all fields correctly.");
      }
    });
  }

  // --- LOGOUT HANDLER ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }

  // ====== INITIAL LOAD (for p1.html and login.html) ======
  if (sessionStorage.getItem("loggedIn") === "true") {
    const savedName = sessionStorage.getItem("userName") || "Attendee";
    const role = sessionStorage.getItem("role") || "user";
    updateDashboardGreeting(savedName, role);
    showView("dashboard");
  } else {
    // If on login.html → show login
    if (document.getElementById("login")) {
      showView("login");
    } else {
      // If on p1.html without session → force redirect to login
      window.location.href = "login.html";
    }
  }

  // ====== NAVIGATION BUTTONS ======
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-view");
      showView(targetView);
    });
  });

  // ====== UPDATE DASHBOARD GREETING ======
  function updateDashboardGreeting(name, role) {
    const userNameEl = document.getElementById("userName");
    const ticketUserEl = document.getElementById("ticketUser");

    let greetingRole = role === "volunteer" ? "Volunteer" : "User";

    if (userNameEl) userNameEl.textContent = `${greetingRole} ${name}`;
    if (ticketUserEl) ticketUserEl.textContent = name;
  }

  // ====== LOST & FOUND CHAT (persistent) ======
  const chatForm = document.getElementById("chatForm");
  const chatBox = document.getElementById("chatBox");
  const chatName = document.getElementById("chatName");
  const chatMessage = document.getElementById("chatMessage");
  const chatImage = document.getElementById("chatImage");

  function saveMessages(messages) {
    localStorage.setItem("lostFoundMessages", JSON.stringify(messages));
  }
  function loadMessages() {
    try {
      return JSON.parse(localStorage.getItem("lostFoundMessages") || "[]");
    } catch {
      return [];
    }
  }

  if (chatForm && chatBox && chatName && chatMessage && chatImage) {
    let messages = loadMessages();

    function renderMessages() {
      chatBox.innerHTML = "";
      messages.forEach((msg) => {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        msgDiv.innerHTML = `
          <div class="meta"><strong>${msg.name}</strong> • ${msg.time}</div>
          <div class="text">${msg.text}</div>
        `;
        if (msg.image) {
          const img = document.createElement("img");
          img.src = msg.image;
          msgDiv.appendChild(img);
        }
        chatBox.appendChild(msgDiv);
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    renderMessages();

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = chatName.value.trim();
      const text = chatMessage.value.trim();
      const file = chatImage.files[0];
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (!name || !text) return;

      let newMsg = { name, text, time, image: null };

      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          newMsg.image = event.target.result;
          messages.push(newMsg);
          saveMessages(messages);
          renderMessages();
        };
        reader.readAsDataURL(file);
      } else {
        messages.push(newMsg);
        saveMessages(messages);
        renderMessages();
      }

      chatMessage.value = "";
      chatImage.value = "";
    });
  }
});
