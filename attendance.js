// Meeting and Screen Share Operations
let localScreenStream = null;

function generateMeetingId() {
  return 'MTG-' + Math.floor(100000 + Math.random() * 900000);
}

// 1. Start Meeting (External Link OR Screen Share)
function startTeacherMeeting(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;

  const meetingType = document.getElementById(`meetType-${courseId}`).value;
  const externalLink = document.getElementById(`meetLink-${courseId}`).value.trim();

  if (meetingType === 'external' && !externalLink) {
    alert('Fadlan soogeliyo Link-ga Google Meet ama Zoom!');
    return;
  }

  const meetingId = generateMeetingId();
  const newMeeting = {
    id: meetingId,
    courseId: courseId,
    teacherId: state.currentUser.id,
    type: meetingType, // 'screenshare' or 'external'
    externalLink: externalLink || null,
    startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    attendees: []
  };

  state.activeMeetings.push(newMeeting);
  course.isLive = true;
  course.activeMeetingId = meetingId;

  saveState();
  renderApp();
  alert(`Xiisadda ${course.title} Wey Bilaabate fadlan waqtiga ilaali.!!`);
}

// 2. End Meeting
function endTeacherMeeting(meetingId) {
  const meeting = state.activeMeetings.find(m => m.id === meetingId);
  if (meeting) {
    const course = state.courses.find(c => c.id === meeting.courseId);
    if (course) {
      course.isLive = false;
      course.activeMeetingId = null;
    }
    state.activeMeetings = state.activeMeetings.filter(m => m.id !== meetingId);
    
    // Stop screen sharing stream if active
    if (localScreenStream) {
      localScreenStream.getTracks().forEach(track => track.stop());
      localScreenStream = null;
    }

    saveState();
    renderApp();
    alert('Xiisaddii Way dhamaate Mahadsanid!');
  }
}

// 3. Screen Sharing Trigger for Teacher
async function startScreenShare() {
  try {
    localScreenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    const videoElement = document.getElementById('teacherScreenVideo');
    if (videoElement) {
      videoElement.srcObject = localScreenStream;
    }
  } catch (err) {
    alert('Lama bilaabi karo Screen Sharing: ' + err.message);
  }
}

// 4. Student Attendance Registration
function recordAttendance(meetingId, studentId) {
  const meeting = state.activeMeetings.find(m => m.id === meetingId);
  if (!meeting) return;

  const exists = state.attendance.some(a => a.meetingId === meetingId && a.studentId === studentId);
  if (!exists) {
    state.attendance.push({
      id: 'ATT-' + Date.now(),
      meetingId: meetingId,
      studentId: studentId,
      courseId: meeting.courseId,
      date: new Date().toISOString().split('T')[0],
      status: 'Present'
    });
    saveState();
  }
}

function getStudentStats(studentId) {
  const records = state.attendance.filter(a => a.studentId === studentId);
  const present = records.filter(a => a.status === 'Present').length;
  const late = records.filter(a => a.status === 'Late').length;
  const absent = records.filter(a => a.status === 'Absent').length;
  const total = records.length;
  const percentage = total > 0 ? Math.round(((present + late) / total) * 100) + '%' : '0%';

  return { total, present, late, absent, percentage };
}