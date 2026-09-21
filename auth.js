let loginError = '';

function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function generateUniqueID() { return 'STD-' + Math.floor(1000 + Math.random() * 9000); }
function generatePassword() { return 'Pass-' + Math.floor(1000 + Math.random() * 9000); }

async function registerStudent(event) {
  event.preventDefault();

  const fullName = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();

  if (!isValidEmail(email)) {
    alert('Fadlan geli Email sax ah!');
    return;
  }

  const generatedId = generateUniqueID();
  const generatedPassword = generatePassword();

  const newStudent = {
    id: generatedId,
    role: 'student',
    fullName: fullName,
    email: email,
    phone: phone,
    password: generatedPassword,
    isBlocked: false,
    enrolledCourses: ["CRS-PY", "CRS-HTML", "CRS-CSS", "CRS-PPT", "CRS-WORD", "CRS-COMP"],
    joinedDate: new Date().toISOString().split('T')[0]
  };

  state.users.push(newStudent);
  state.currentUser = newStudent;
  saveState();

  alert(`Diiwaangelintu waaku guulaysatay!\n\nUser ID: ${generatedId}\nPassword: ${generatedPassword}`);
  navigateTo('dashboard');
}

function loginUser(event) {
  event.preventDefault();
  const userId = document.getElementById('loginUserId').value.trim();
  const pass = document.getElementById('loginPass').value.trim();

  let user = state.users.find(u => u.id === userId && u.password === pass);
  if (!user) {
    user = state.teachers.find(t => (t.id === userId || t.email === userId) && t.password === pass);
  }

  if (user) {
    if (user.isBlocked) {
      loginError = 'Akoonkaaga waa la Block gareeyay! La xiriir maamulka.';
      renderApp();
      return;
    }
    loginError = '';
    state.currentUser = user;
    saveState();
    navigateTo('dashboard');
  } else {
    loginError = 'User or password incorrect!';
    renderApp();
  }
}

function logoutUser() {
  state.currentUser = null;
  loginError = '';
  saveState();
  navigateTo('home');
}