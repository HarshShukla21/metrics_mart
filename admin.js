let currentUser = null;
let allTeamData = [];
let dealsLineChart = null;

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
    loadAdminData();
};

function loadUser() {
    const user = localStorage.getItem("currentUser");

    if (!user) {
        showPopup("Session Expired", "Login again", false);
        setTimeout(() => window.location.href = "mp.html", 1500);
        return;
    }

    currentUser = JSON.parse(user);

    document.getElementById("userName").textContent = currentUser.name;

    if (currentUser.prof_img) {
        document.getElementById("userAvatar").src =
            "/" + currentUser.prof_img;
    }
}

// Dummy data (baad me DB connect karenge)
function loadAdminData() {
    loadLeads();
    loadAppointments();
    loadFollowups();
    loadDeals();
    loadTeam();
    loadProjects();
}

// Section switch
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(id);
    if (section) section.classList.add('active');
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    const activeLi = Array.from(document.querySelectorAll('.sidebar li'))
        .find(li => li.getAttribute('onclick') && li.getAttribute('onclick').includes(`('${id}')`));
    if (activeLi) activeLi.classList.add('active');
    if (id === 'appointments') loadAppointments();
    if (id === 'followups') loadFollowups();
    if (id === 'deals') loadDeals();
    if (id === 'team') loadTeam();
    if (id === 'projects') loadProjects();
    if (id === 'reports') loadReports();
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

async function loadLeads() {
    const res = await fetch('/api/leads');
    const data = await res.json();

    const table = document.getElementById('leadsTable');
    table.innerHTML = '';

    data.data.forEach(lead => {
        table.innerHTML += `
            <tr>
                <td>${lead.id}</td>
                <td>${lead.company_name || '-'}</td>
                <td>${lead.client_name || '-'}</td>
                <td>${lead.contact || '-'}</td>
                <td>${lead.email || '-'}</td>
                <td>${lead.action_type || '-'}</td>
            </tr>
        `;
    });
}

async function loadAppointments() {
    const res = await fetch('/api/appointments');
    const data = await res.json();

    const table = document.getElementById('appointmentsTable');
    table.innerHTML = '';

    data.data.forEach(item => {
        table.innerHTML += `
            <tr>
                <td>${item.company_name}</td>
                <td>${item.client_name}</td>
                <td>${item.app_date}</td>
                <td>${item.app_time}</td>
                <td>${item.assign_emp}</td>
            </tr>
        `;
    });
}

async function loadFollowups() {
    const res = await fetch('/api/followups');
    const data = await res.json();

    const table = document.getElementById('followupsTable');
    table.innerHTML = '';

    data.data.forEach(item => {
        table.innerHTML += `
            <tr>
                <td>${item.company_name}</td>
                <td>${item.client_name}</td>
                <td>${item.follow_date}</td>
                <td>${item.follow_time}</td>
                <td>${item.reason}</td>
            </tr>
        `;
    });
}

async function loadDeals() {
    const res = await fetch('/api/leads');
    const data = await res.json();

    const table = document.getElementById('dealsTable');
    table.innerHTML = '';

    const deals = data.data.filter(d => d.lead_status === 'deal_closed');
    
    // Calculate counts
    let pendingCount = 0, receivedCount = 0, failedCount = 0;
    
    deals.forEach(item => {
        if (item.pay_stat === 'pending') pendingCount++;
        else if (item.pay_stat === 'received') receivedCount++;
        else if (item.pay_stat === 'failed') failedCount++;
        
        table.innerHTML += `
            <tr>
                <td>${item.company_name}</td>
                <td>${item.client_name}</td>
                <td>${item.deal_amount}</td>
                <td>${item.payment_method}</td>
                <td>
                    <select 
                        class="payment-status ${item.pay_stat || 'pending'}"
                        onchange="updatePaymentStatus(${item.id}, this.value, this)">       
                        
                        <option value="pending" ${item.pay_stat === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="received" ${item.pay_stat === 'received' ? 'selected' : ''}>Received</option>
                        <option value="failed" ${item.pay_stat === 'failed' ? 'selected' : ''}>Failed</option>
                        
                    </select>
                </td>
            </tr>
        `;
    });
    
    const total = pendingCount + receivedCount + failedCount;
    
    const pendingPercent = total ? (pendingCount / total) * 100 : 0;
    const receivedPercent = total ? (receivedCount / total) * 100 : 0;
    const failedPercent = total ? (failedCount / total) * 100 : 0;

    document.getElementById('pendingBar').style.width = pendingPercent + '%';
    document.getElementById('receivedBar').style.width = receivedPercent + '%';
    document.getElementById('failedBar').style.width = failedPercent + '%';

    document.getElementById('pendingLabel').textContent = `Pending: ${pendingCount}`;
    document.getElementById('receivedLabel').textContent = `Received: ${receivedCount}`;
    document.getElementById('failedLabel').textContent = `Failed: ${failedCount}`;

}

async function loadTeam() {
    const res = await fetch('/api/admin/team-report');
    const result = await res.json();

    allTeamData = result.data || [];
    filterTeamByRole('all');   // default All tab
}

function filterTeamByRole(role) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-role') === role) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    const table = document.getElementById('teamTable');
    table.innerHTML = '';
    let filtered = allTeamData;
    if (role !== 'all') {
        filtered = allTeamData.filter(user => 
            user.role.toLowerCase() === role.toLowerCase()
        );
    }
    if (filtered.length === 0) {
        table.innerHTML = `<tr><td colspan="6" style="padding:30px;color:#64748b;text-align:center;">No users found for this role.</td></tr>`;
        return;
    }
    filtered.forEach(user => {
        table.innerHTML += `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.total_leads}</td>
                <td>${user.total_appointments}</td>
                <td>${user.total_followups}</td>
            </tr>
        `;
    });
}

let reportChart = null;

async function loadReports() {
    try {
        const [leadsRes, appsRes] = await Promise.all([
            fetch('/api/leads'),
            fetch('/api/appointments')
        ]);

        const [leadsData, appsData] = await Promise.all([leadsRes.json(), appsRes.json()]);

        const totalLeads = leadsData.success && leadsData.data ? leadsData.data.length : 0;
        const totalAppointments = appsData.success && appsData.data ? appsData.data.length : 0;
        const totalDeals = leadsData.success && leadsData.data ? leadsData.data.filter(item => item.lead_status === 'deal_closed').length : 0;

        document.getElementById('reportTotalLeads').textContent = totalLeads;
        document.getElementById('reportTotalAppointments').textContent = totalAppointments;
        document.getElementById('reportTotalDeals').textContent = totalDeals;

        const ctx = document.getElementById('reportChart').getContext('2d');
        if (reportChart) reportChart.destroy();
        reportChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Leads', 'Appointments', 'Deals'],
                datasets: [{
                    data: [totalLeads, totalAppointments, totalDeals],
                    backgroundColor: ['#22d3ee', '#eab308', '#22c55e'],
                    borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (err) {
        console.error('Error loading reports:', err);
    }
}

let teamCache = {};

async function loadProjects() {
    const table = document.getElementById('projectsTable');

    table.innerHTML = `
        <tr>
            <td colspan="10" style="padding:20px;text-align:center;color:#64748b;">
                Loading projects...
            </td>
        </tr>
    `;

    try {
        const res = await fetch('/api/projects');
        const result = await res.json();

        if (!result.success || !result.data) {
            throw new Error("Failed to load projects");
        }

        table.innerHTML = '';

        // 🔥 Check if service type has data
        const hasServiceType = (serviceTypeValue) => {
            if (!serviceTypeValue) return false;
            try {
                let parsed = serviceTypeValue;
                if (typeof parsed === 'string') {
                    parsed = JSON.parse(parsed);
                }
                if (typeof parsed === 'string') {
                    parsed = JSON.parse(parsed);
                }
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return true;
                }
                if (parsed && typeof parsed === 'string' && parsed.trim() !== '') {
                    return true;
                }
            } catch (e) {
                return typeof serviceTypeValue === 'string' && serviceTypeValue.trim() !== '';
            }
            return false;
        };

        // 🔥 dropdown function (only for services that exist)
        const getDropdown = async (serviceName, projectId) => {
            try {
                if (!teamCache[serviceName]) {
                    const res = await fetch(`/api/available-team?services=${serviceName}`);
                    const data = await res.json();
                    teamCache[serviceName] = data;
                }

                const data = teamCache[serviceName];

                let options = '<option value="">Select</option>';

                if (data && data.success && data.data && data.data.length > 0) {
                    data.data.forEach(user => {
                        options += `<option value="${user.id}">${user.name}</option>`;
                    });
                } else {
                    options += `<option value="">No match</option>`;
                }

                return `<select onchange="assignProject(${projectId}, this.value)">${options}</select>`;
            } catch (err) {
                console.error("Dropdown error:", err);
                return `<select><option>Error</option></select>`;
            }
        };

        for (const project of result.data) {

            // 🔥 ONLY SHOW DROPDOWNS IF SERVICE TYPE EXISTS
            const webDropdown = hasServiceType(project.web_type) ? await getDropdown('web', project.id) : '-';
            const seoDropdown = hasServiceType(project.seo_type) ? await getDropdown('seo', project.id) : '-';
            const smoDropdown = hasServiceType(project.smo_type) ? await getDropdown('smo', project.id) : '-';
            const adsDropdown = project.services && project.services.toLowerCase().includes('ads') ? await getDropdown('ads', project.id) : '-';
            const appDropdown = hasServiceType(project.app_type) ? await getDropdown('app', project.id) : '-';
            const erpDropdown = hasServiceType(project.erp_type) ? await getDropdown('erp', project.id) : '-';

            table.innerHTML += `
                <tr>
                    <td>${project.projectName || '-'}</td>
                    <td>${project.client || '-'}</td>
                    <td>${project.services || 'No services'}</td>
                    <td>${project.status || 'Ongoing'}</td>
                    <td>${webDropdown}</td>
                    <td>${seoDropdown}</td>
                    <td>${smoDropdown}</td>
                    <td>${adsDropdown}</td>
                    <td>${appDropdown}</td>
                    <td>${erpDropdown}</td>
                </tr>
            `;
        }

        if (result.data.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="10" style="padding:40px;text-align:center;color:#64748b;">
                        No projects found.
                    </td>
                </tr>
            `;
        }

    } catch (err) {
        console.error("Load Projects Error:", err);

        table.innerHTML = `
            <tr>
                <td colspan="10" style="color:red; padding:30px;text-align:center;">
                    Error loading projects.
                </td>
            </tr>
        `;
    }
}

async function assignProject(projectId, userId) {
    if (!userId) return;

    const res = await fetch('/api/assign-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, userId })
    });

    const data = await res.json();

    if (data.success) {
        alert("Assigned successfully");
        loadProjects(); // 🔥 refresh
    } else {
        alert(data.message);
    }
}

async function updatePaymentStatus(leadId, status, el) {
    try {
        const res = await fetch(`/api/payment-status/${leadId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pay_stat: status })
        });

        const data = await res.json();

        if (data.success) {
            // 🔥 color update instantly
            el.classList.remove('pending', 'recieved', 'failed');
            el.classList.add(status);

            showPopup("Updated", "Payment status updated", true);
            
            // Reload deals to update heatmap counts
            loadDeals();
        } else {
            showPopup("Error", data.message, false);
        }

    } catch (err) {
        console.error(err);
        showPopup("Error", "Server error", false);
    }
}

// Logout
function logout() {
    showPopup('Logout', 'You have been logged out successfully.', true);

    setTimeout(() => {
        localStorage.removeItem('currentUser');
        window.location.replace("mp.html");
    }, 1500);
}