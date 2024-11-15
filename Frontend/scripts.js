// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDMSfYRTtwERSHM49J9iG_PcRkuHQcszXs",
    authDomain: "sample-90729.firebaseapp.com",
    projectId: "sample-90729",
    storageBucket: "sample-90729.firebaseapp.com",
    messagingSenderId: "135742149337",
    appId: "1:135742149337:web:12f910eae9ddeac9f524c8",
    measurementId: "G-E237GFKB0B"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

// Add a new student on form submission
document.getElementById('submit-student-btn').addEventListener('click', async () => {
    const name = document.getElementById('student-name').value;
    const usn = document.getElementById('student-usn').value;

    if (name && usn) {
        // Send new student data to the server (existing functionality)
        await fetch('http://localhost:3000/addStudent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, usn, present: false })
        });

        // Also add the student to Firebase Firestore
        const studentRef = await db.collection('students').add({
            name: name,
            usn: usn,
            present: false,
            addedOn: firebase.firestore.FieldValue.serverTimestamp() // Timestamp for reference
        });

        // Reset form fields
        document.getElementById('student-name').value = '';
        document.getElementById('student-usn').value = '';

        // Add the student to the table directly
        addStudentToTable({ id: studentRef.id, name, usn, present: false });
    } else {
        alert("Please fill out both fields.");
    }
});

// Function to add a student to the table directly
function addStudentToTable(student) {
    const studentList = document.getElementById('student-list');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${student.name}</td>
        <td>${student.usn}</td>
        <td><input type="checkbox" ${student.present ? 'checked' : ''} onchange="updateAttendance('${student.id}', this.checked)"></td>
        <td><button class="delete-btn" onclick="deleteStudent('${student.id}', this)">Delete</button></td>
    `;
    studentList.appendChild(row);
}

// Load students from Firebase and display them
async function loadStudents() {
    const querySnapshot = await db.collection('students').get();
    const studentList = document.getElementById('student-list');
    studentList.innerHTML = '';

    querySnapshot.forEach(doc => {
        const student = doc.data();
        addStudentToTable({
            id: doc.id,
            name: student.name,
            usn: student.usn,
            present: student.present
        });
    });
}

// Delete a student and remove the row directly (with Firebase sync)
async function deleteStudent(id, button) {
    // Remove from Firebase Firestore
    await db.collection('students').doc(id).delete();

    // Remove the row from the table directly (existing functionality)
    const row = button.parentElement.parentElement;
    row.remove();

    // Optionally, you can also delete from the server (if needed)
    await fetch(`http://localhost:3000/deleteStudent/${id}`, { method: 'DELETE' });
}

// Update student attendance in Firebase (with Firestore sync)
async function updateAttendance(id, isPresent) {
    // Update the attendance in Firestore
    await db.collection('students').doc(id).update({
        present: isPresent
    });

    // Also update attendance on the server (if needed)
    await fetch('http://localhost:3000/addStudent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn: id, present: isPresent })
    });
}

// Load students on page load
window.onload = loadStudents;
