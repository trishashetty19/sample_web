// Toggle the display of the form when "Add New Student" is clicked
document.getElementById('add-student-btn').addEventListener('click', () => {
    document.getElementById('student-form').classList.toggle('hidden');
});

// Add a new student on form submission
document.getElementById('submit-student-btn').addEventListener('click', async () => {
    const name = document.getElementById('student-name').value;
    const usn = document.getElementById('student-usn').value;

    if (name && usn) {
        // Send new student data to the server
        await fetch('/addStudent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, usn })
        });

        // Reset form and hide it
        document.getElementById('student-name').value = '';
        document.getElementById('student-usn').value = '';
        document.getElementById('student-form').classList.add('hidden');

        // Add the student to the table directly
        addStudentToTable({ name, usn });
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
        <td><input type="checkbox"></td>
        <td><button class="delete-btn" onclick="deleteStudent('${student.usn}')">Delete</button></td>
    `;
    studentList.appendChild(row);
}

// Load students from the server and display them
async function loadStudents() {
    const response = await fetch('/students');
    const students = await response.json();
    const studentList = document.getElementById('student-list');
    studentList.innerHTML = '';

    students.forEach(student => {
        addStudentToTable(student);
    });
}

// Delete a student and refresh the list
async function deleteStudent(usn) {
    await fetch(`/deleteStudent/${usn}`, { method: 'DELETE' });
    loadStudents();
}

// Load students on page load
window.onload = loadStudents;
