function navigateTo(view) {
  window.location.hash = view;
  renderApp();
}

// Check Active Notifications
function checkLiveNotifications() {
  const banner = document.getElementById('notificationBanner');
  const liveMeeting = state.activeMeetings[0];

  if (liveMeeting && banner) {
    const course = state.courses.find(c => c.id === liveMeeting.courseId);
    banner.innerHTML = `
      <div class="notification-banner">
        <i class="fa-solid fa-bell fa-bounce"></i>
        <span><strong>OGEYSIIN:</strong> Xiisaddii <strong>${course?.title || ''}</strong> waa halkan HADDAN!</span>
        <button class="btn btn-primary" onclick="navigateTo('courses')">Ku Dhol Live Class</button>
      </div>
    `;
  } else if (banner) {
    banner.innerHTML = '';
  }
}

function renderNavActions() {
  const container = document.getElementById('navActions');
  if (!container) return;

  if (state.currentUser) {
    container.innerHTML = `
      <span style="margin-right: 10px; color: var(--text-muted);">
        ${state.currentUser.fullName} <span class="badge ${state.currentUser.role === 'admin' ? 'badge-live' : 'badge-offline'}">${state.currentUser.role.toUpperCase()}</span>
      </span>
      <button class="btn btn-primary" onclick="navigateTo('dashboard')">Dashboard</button>
      <button class="btn" style="background:#475569; color:white;" onclick="logoutUser()">Logout</button>
    `;
  } else {
    container.innerHTML = `
      <button class="btn btn-primary" onclick="navigateTo('login')">Login</button>
      <button class="btn" style="background:#334155; color:white;" onclick="navigateTo('register')">Register</button>
    `;
  }
}

function renderApp() {
  renderNavActions();
  checkLiveNotifications();
  const app = document.getElementById('app');
  const view = window.location.hash.replace('#', '') || 'home';

  if (view === 'home') app.innerHTML = renderHomeView();
  else if (view === 'courses') app.innerHTML = renderCoursesView();
  else if (view === 'contact') app.innerHTML = renderContactView();
  else if (view === 'login') app.innerHTML = renderLoginView();
  else if (view === 'register') app.innerHTML = renderRegisterView();
  else if (view === 'dashboard') {
    if (!state.currentUser) app.innerHTML = renderLoginView();
    else if (state.currentUser.role === 'admin') app.innerHTML = renderAdminDashboardView();
    else if (state.currentUser.role === 'teacher') app.innerHTML = renderTeacherDashboardView();
    else app.innerHTML = renderStudentDashboardView();
  }
}

// TEACHER DASHBOARD VIEW (Supports ALL Courses & Google Meet Links & Screen Sharing)
function renderTeacherDashboardView() {
  const teacher = state.currentUser;

  return `
    <h2><i class="fa-solid fa-chalkboard-user"></i> Dashboard-ka Macallinka</h2>
    <p style="color: var(--text-muted); margin-bottom: 25px;">Khatarta Koorsooyinka, Screen Share, ama ku dhex dhejinta Google Meet Link</p>

    <div class="grid-cards">
      ${state.courses.map(course => {
        const activeMeeting = state.activeMeetings.find(m => m.courseId === course.id);

        return `
          <div class="card" style="border-top: 4px solid var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <i class="${course.icon} fa-2x" style="color:var(--primary);"></i>
              <span class="badge ${course.isLive ? 'badge-live' : 'badge-offline'}">
                ${course.isLive ? '🔴 LIVE NOW' : '⚪ OFFLINE'}
              </span>
            </div>

            <h3 style="margin-top:15px;">${course.title}</h3>${course.isLive ? `
              <div style="margin: 15px 0; background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 8px;">
                <p><strong>Status:</strong> Xiisaddu waa ay socotaa</p>
                <p><strong>Meeting ID:</strong> ${activeMeeting?.id}</p>
                ${activeMeeting?.type === 'external' ? `
                  <p><strong>External Link:</strong> <a href="${activeMeeting.externalLink}" target="_blank" style="color:var(--primary);">Bilaaw Meet</a></p>
                ` : `
                  <button class="btn btn-warning" style="margin-top:8px; width:100%;" onclick="startScreenShare()">
                    <i class="fa-solid fa-desktop"></i> Share Screen Now
                  </button>
                `}
              </div>
              <button class="btn btn-danger" style="width:100%;" onclick="endTeacherMeeting('${activeMeeting?.id}')">
                <i class="fa-solid fa-stop"></i> End Meeting
              </button>
            ` : `
              <div style="margin: 15px 0;">
                <label style="font-size:0.85rem; color:var(--text-muted);">Nooca Meeting-ka:</label>
                <select id="meetType-${course.id}" class="form-input" style="width:100%; margin-bottom:10px; padding:6px; background:var(--surface-card); color:white; border:none; border-radius:6px;" onchange="toggleLinkInput('${course.id}')">
                  <option value="external">Google Meet / Zoom Link</option>
                  <option value="screenshare">In-App Screen Sharing</option>
                </select>

                <div id="linkBox-${course.id}">
                  <input type="text" id="meetLink-${course.id}" placeholder="Soo dheji Link-ga (E.g. https://meet.google.com/abc-defg-hij)" style="width:100%; padding:8px; background:var(--bg-dark); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:6px;">
                </div>
              </div>

              <button class="btn btn-primary" style="width:100%;" onclick="startTeacherMeeting('${course.id}')">
                <i class="fa-solid fa-play"></i> Start Live Class
              </button>
            `}
          </div>
        `;
      }).join('')}
    </div>

    <!-- Active Screen Share Display Area -->
    <div style="margin-top: 30px;">
      <h3><i class="fa-solid fa-tv"></i> Live Screen Preview</h3>
      <video id="teacherScreenVideo" autoplay playsinline controls style="width:100%; max-height:500px; background:black; border-radius:12px; margin-top:10px;"></video>
    </div>
  `;
}

function toggleLinkInput(courseId) {
  const type = document.getElementById(`meetType-${courseId}`).value;
  const linkBox = document.getElementById(`linkBox-${courseId}`);
  if (type === 'external') {
    linkBox.style.display = 'block';
  } else {
    linkBox.style.display = 'none';
  }
}

// Student Courses & Meeting Join Logic
function renderCoursesView() {
  return `
    <h2>Available Live Courses</h2>
    <div class="grid-cards">
      ${state.courses.map(course => {
        const meeting = state.activeMeetings.find(m => m.courseId === course.id);

        return `
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <i class="${course.icon} fa-2x" style="color:var(--primary);"></i>
              <span class="badge ${course.isLive ? 'badge-live' : 'badge-offline'}">
                ${course.isLive ? '🟢 LIVE NOW' : '⚪ OFFLINE'}
              </span>
            </div>
            <h3 style="margin-top:15px;">${course.title}</h3>${course.isLive ? `
              <div style="margin-top:15px;">
                ${meeting?.type === 'external' ? `
                  <a href="${meeting.externalLink}" target="_blank" class="btn btn-primary" style="width:100%; text-align:center;" onclick="recordAttendance('${meeting.id}', '${state.currentUser?.id}')">
                    <i class="fa-solid fa-video"></i> Join Google Meet Class
                  </a>
                ` : `
                  <button class="btn btn-primary" style="width:100%;" onclick="alert('Ku biritaanka Screen Share-ka ee In-App-ka ah'); recordAttendance('${meeting.id}', '${state.currentUser?.id}')">
                    <i class="fa-solid fa-desktop"></i> View Live Screen
                  </button>
                `}
              </div>
            ` : `
              <button class="btn btn-disabled" style="width:100%; margin-top:15px;" disabled>⚪ Xiisad Ma Jiro</button>
            `}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Views Remaining
function renderHomeView() {
  return `
    <div style="text-align: center; padding: 40px 20px;">
      <h1>Welcome to Hashimi Platform</h1>
      <p style="color: var(--text-muted); margin: 15px 0;">Nidaamka Waxbarashada Tooska Ah</p>
      <button class="btn btn-primary" onclick="navigateTo('courses')"> Boqo Koorsooyinka Live-ka Ah</button>
    </div>
    ${renderCoursesView()}
  `;
}

function renderContactView() {
  return `
    <div class="card" style="max-width: 500px; margin: 40px auto; text-align: center;">
      <h2>WhatsApp Support</h2>
      <p style="margin: 20px 0;">+252 61 100 7174</p>
      <a href="https://wa.me/252611007174" target="_blank" class="btn" style="background:#25d366; color:white;">WhatsApp ka la xiriir</a>
    </div>
  `;
}

function renderLoginView() {
  return `
    <div class="card" style="max-width:400px; margin:40px auto;">
      <h3>Platform Login</h3>
      ${loginError ? `<div style="background:rgba(239, 68, 68, 0.2); color:red; padding:10px; border-radius:6px; margin-top:10px;">${loginError}</div>` : ''}
      <form onsubmit="loginUser(event)">
        <div class="form-group" style="margin-top:15px;">
          <label>User ID / Email</label>
          <input type="text" id="loginUserId" required style="width:100%; padding:8px; margin-top:5px; background:var(--bg-dark); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:6px;">
        </div>
        <div class="form-group" style="margin-top:15px;">
          <label>Password</label>
          <input type="password" id="loginPass" required style="width:100%; padding:8px; margin-top:5px; background:var(--bg-dark); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:6px;">
        </div>
        <button class="btn btn-primary" style="width:100%; margin-top:20px;">Login</button>
      </form>
    </div>
  `;
}

function renderRegisterView() {
  return `
    <div class="card" style="max-width:500px; margin:40px auto;">
      <h3>Arday Diiwaangelin Cusub</h3>
      <form onsubmit="registerStudent(event)">
        <div class="form-group" style="margin-top:15px;">
          <label>Magaca oo Dhamaystiran</label>
          <input type="text" id="regName" required style="width:100%; padding:8px; margin-top:5px; background:var(--bg-dark); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:6px;">
        </div>
        <div class="form-group" style="margin-top:15px;">
          <label>Email</label>
          <input type="email" id="regEmail" required style="width:100%; padding:8px; margin-top:5px; background:var(--bg-dark); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:6px;">
        </div>
        <div class="form-group" style="margin-top:15px;">
          <label>Phone Number</label>
          <input type="text" id="regPhone" required style="width:100%; padding:8px; margin-top:5px; background:var(--bg-dark); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:6px;">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:20px;">Sameyso Akoon</button>
      </form>
    </div>
  `;
}

function renderStudentDashboardView() {
  const student = state.currentUser;
  const stats = getStudentStats(student.id);

  return `
    <h2>Student Dashboard</h2>
    <p style="color:var(--text-muted);">Soo dhawoow, <strong>${student.fullName}</strong> (ID: ${student.id})</p>

    <div class="grid-cards" style="margin-top:20px;">
      <div class="card"><h4>Attendance Rate</h4><h2>${stats.percentage}</h2></div>
      <div class="card"><h4>Present</h4><h2>${stats.present}</h2></div>
      <div class="card"><h4>Absent</h4><h2>${stats.absent}</h2></div>
    </div>
  `;
}

function renderAdminDashboardView() {
  const students = state.users.filter(u => u.role === 'student');

  return `
    <h2>Admin Dashboard Panel</h2>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(std => `
            <tr>
              <td>${std.id}</td>
              <td>${std.fullName}</td>
              <td>${std.email}</td>
              <td><span class="badge ${std.isBlocked ? 'badge-blocked' : 'badge-live'}">${std.isBlocked ? 'Blocked' : 'Active'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

window.addEventListener('hashchange', renderApp);
window.addEventListener('DOMContentLoaded', renderApp);