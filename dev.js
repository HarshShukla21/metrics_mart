let currentUser = null;
let reportChart = null;
let devReportCounts = { assigned: 0, ongoing: 0, completed: 0 };

// 🔥 Live Search Filter Function
function filterTable(tableId, searchInputId) {
    const searchInput = document.getElementById(searchInputId).value.toLowerCase();
    const tableRows = document.querySelectorAll(`#${tableId} tr`);
    
    tableRows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(searchInput)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

window.onload = function () {
    loadUser();
};

function loadUser() {
    const user = localStorage.getItem("currentUser");

    if (!user) {
        showPopup("Session Expired", "Please login again", false);
        setTimeout(() => {
            window.location.href = "mp.html";
        }, 1500);
        return;
    }

    currentUser = JSON.parse(user);
    document.getElementById("userName").textContent = currentUser.name || "DEV";

    if (currentUser.prof_img) {
        document.getElementById("userAvatar").src = 
            "/" + currentUser.prof_img;
    }

    // User load hone ke baad hi data fetch karo
    fetchDEVProjects();
}

// 🔥 Dummy (baad me DB se connect karenge)
function fetchDEVData() {

    document.getElementById("assignedContainer").innerHTML = `
        <div class="card">
            <h3>No Assigned Projects</h3>
        </div>
    `;

    document.getElementById("ongoingContainer").innerHTML = `
        <div class="card">
            <h3>No Ongoing Projects</h3>
        </div>
    `;

    document.getElementById("completedContainer").innerHTML = `
        <div class="card">
            <h3>No Completed Projects</h3>
        </div>
    `;

    document.getElementById("totalAssigned").textContent = 0;
    document.getElementById("totalOngoing").textContent = 0;
    document.getElementById("totalCompleted").textContent = 0;
}

// Section switch
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));

    const activeLi = Array.from(document.querySelectorAll('.sidebar li'))
        .find(li => li.getAttribute('onclick').includes(sectionId));

    if (activeLi) activeLi.classList.add('active');

    if (sectionId === 'reports') {
        renderReportChart(devReportCounts.assigned, devReportCounts.ongoing, devReportCounts.completed);
    }
}

// Popup
function showPopup(title, message, isSuccess) {
    const popup = document.getElementById('popup');
    const icon = document.getElementById('popupIcon');
    const titleEl = document.getElementById('popupTitle');
    const msgEl = document.getElementById('popupMessage');

    titleEl.textContent = title;
    msgEl.textContent = message;

    // 🔥 ICON FIX
    if (isSuccess) {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#22d3ee';
    } else {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = '#ef4444';
    }

    popup.classList.remove('hidden');

    // 🔥 Auto close after 1.5 sec
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 1500);
}

// 🔥 UPDATED fetchDEVProjects() - dev.js mein yeh paste kar do

async function fetchDEVProjects() {
    if (!currentUser || !currentUser.id) {
        console.error("User ID not found in currentUser");
        showPopup("Error", "User session invalid", false);
        return;
    }

    console.log("Fetching projects for DEV ID:", currentUser.id);

    try {
        const res = await fetch(`/api/dev/projects/${currentUser.id}`);
        const result = await res.json();

        console.log("🔥 DEV Projects API Response:", result);

        const assignedContainer = document.getElementById("assignedContainer");
        const ongoingContainer = document.getElementById("ongoingContainer");
        const completedContainer = document.getElementById("completedContainer");

        // Clear previous content
        assignedContainer.innerHTML = '';
        ongoingContainer.innerHTML = '';
        completedContainer.innerHTML = '';

        let assignedCount = 0;
        let ongoingCount = 0;
        let completedCount = 0;

        // 🔥 NEW RESPONSE STRUCTURE HANDLE (assigned, ongoing, completed arrays)
        // 🔥 IMPROVED RESPONSE HANDLING
        if (result.success) {
            let allProjects = [];

            // Case 1: Agar backend assigned/ongoing/completed arrays bhej raha hai
            if (result.assigned || result.ongoing || result.completed) {
                allProjects = [
                    ...(result.assigned || []),
                    ...(result.ongoing || []),
                    ...(result.completed || [])
                ];
            } 
            // Case 2: Agar backend data array bhej raha hai (purana style)
            else if (result.data && Array.isArray(result.data)) {
                allProjects = result.data;
            }

            // Ab categorize karo
            const assigned = allProjects.filter(p => 
                (p.status || '').toLowerCase() === 'assigned'
            );
            const ongoing = allProjects.filter(p => 
                (p.status || '').toLowerCase() === 'ongoing'
            );
            const completed = allProjects.filter(p => 
                (p.status || '').toLowerCase() === 'completed'
            );

            // Assigned Section
            if (assigned.length > 0) {
                assigned.forEach(project => {
                    assignedContainer.innerHTML += createProjectCard(project, 'assigned');
                });
            } else {
                assignedContainer.innerHTML = `<div class="card"><h3>No Assigned Projects</h3></div>`;
            }

            // Ongoing Section
            if (ongoing.length > 0) {
                ongoing.forEach(project => {
                    ongoingContainer.innerHTML += createProjectCard(project, 'ongoing');
                });
            } else {
                ongoingContainer.innerHTML = `<div class="card"><h3>No Ongoing Projects</h3></div>`;
            }

            // Completed Section
            if (completed.length > 0) {
                completed.forEach(project => {
                    completedContainer.innerHTML += createProjectCard(project, 'completed');
                });
            } else {
                completedContainer.innerHTML = `<div class="card"><h3>No Completed Projects</h3></div>`;
            }

            // Update counts
            assignedCount = assigned.length;
            ongoingCount = ongoing.length;
            completedCount = completed.length;

            document.getElementById("totalAssigned").textContent = assignedCount;
            document.getElementById("totalOngoing").textContent = ongoingCount;
            document.getElementById("totalCompleted").textContent = completedCount;

            devReportCounts.assigned = assignedCount;
            devReportCounts.ongoing = ongoingCount;
            devReportCounts.completed = completedCount;
            renderReportChart(assignedCount, ongoingCount, completedCount);
        } else {
            // Agar success false ho
            const errorHTML = `<div class="card"><h3>Error loading projects</h3></div>`;
            assignedContainer.innerHTML = errorHTML;
            ongoingContainer.innerHTML = errorHTML;
            completedContainer.innerHTML = errorHTML;
        }

    } catch (err) {
        console.error("DEV Projects Fetch Error:", err);
        showPopup("Error", "Failed to load projects. Check console.", false);
    }
}

// 🔥 Helper function to create card (reusable)
function createProjectCard(project, status) {
    return `
        <div class="card">
            <h3>${project.projectName || project.company_name || 'Untitled Project'}</h3>
            <p><b>Client:</b> ${project.client || project.client_name || 'N/A'}</p>
            <p><b>Services:</b> ${project.services || 'Multiple Services'}</p>
            <p><b>Status:</b> <span class="status ${status}">${status.toUpperCase()}</span></p>
        </div>
    `;
}

function renderReportChart(assignedCount, ongoingCount, completedCount) {
    const ctx = document.getElementById('reportChart');
    if (!ctx) return;

    const data = [assignedCount, ongoingCount, completedCount];

    if (reportChart) {
        reportChart.data.datasets[0].data = data;
        reportChart.update();
        return;
    }

    reportChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Assigned', 'Ongoing', 'Completed'],
            datasets: [{
                label: 'DEV Performance',
                data,
                backgroundColor: ['#22d3ee', '#f59e0b', '#10b981'],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 16,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.label}: ${context.parsed}`
                    }
                }
            }
        }
    });
}

function logout() {
    showPopup('Logout', 'You have been logged out successfully.', true);

    setTimeout(() => {
        localStorage.removeItem('currentUser');
        window.location.replace("mp.html");
    }, 1500);
}