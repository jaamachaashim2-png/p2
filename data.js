// Global Application State (Storage in LocalStorage)
const defaultState = {
  currentUser: null,
  users: [
    {
      id: "STD-1001",
      role: "student",
      fullName: "Maxamed Cali",
      email: "maxamed@gmail.com",
      phone: "+252615111111",
      password: "Pass-1001",
      isBlocked: false,
      enrolledCourses: ["CRS-PY", "CRS-HTML", "CRS-CSS", "CRS-PPT", "CRS-WORD", "CRS-COMP"],
      joinedDate: "2026-08-01"
    }
  ],
  teachers: [
    {
      id: "TCH-2001",
      role: "teacher",
      fullName: "Eng. Jaamac Haashim",
      email: "jaamac@gmail.com",
      phone: "+252611007174",
      password: "Pass-2001",
      assignedCourses: ["CRS-PY", "CRS-HTML", "CRS-CSS", "CRS-PPT", "CRS-WORD", "CRS-COMP"]
    }
  ],
  courses: [
    { id: "CRS-PY", title: "Python Programming", icon: "fa-brands fa-python", isLive: false, activeMeetingId: null },
    { id: "CRS-HTML", title: "HTML5 Web Design", icon: "fa-brands fa-html5", isLive: false, activeMeetingId: null },
    { id: "CRS-CSS", title: "CSS3 & Modern Styling", icon: "fa-brands fa-css3-alt", isLive: false, activeMeetingId: null },
    { id: "CRS-PPT", title: "Microsoft PowerPoint", icon: "fa-solid fa-file-powerpoint", isLive: false, activeMeetingId: null },
    { id: "CRS-WORD", title: "Microsoft Word", icon: "fa-solid fa-file-word", isLive: false, activeMeetingId: null },
    { id: "CRS-COMP", title: "Computer Basics & IT", icon: "fa-solid fa-laptop-code", isLive: false, activeMeetingId: null }
  ],
  activeMeetings: [],
  attendance: []
};

function loadState() {
  const saved = localStorage.getItem('hashimi_lms_state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return defaultState;
    }
  }
  return defaultState;
}

let state = loadState();

function saveState() {
  localStorage.setItem('hashimi_lms_state', JSON.stringify(state));
}