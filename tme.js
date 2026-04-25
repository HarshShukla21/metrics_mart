let currentUser = null;
let reportChart = null;

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

window.onload = function() {
    loadUserFromLocalStorage();
    fetchUserDataFromDB();
    loadLeads();
    loadReportsCounts();
};

function loadUserFromLocalStorage() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        showPopup('Session Expired', 'Please login again.', false);
        setTimeout(() => window.location.href = "mp.html", 1500);
        return;
    }

    currentUser = JSON.parse(userStr);
    
    document.getElementById('userName').textContent = currentUser.name || "TME User";
    document.getElementById('userRole').textContent = (currentUser.role || "TME").toUpperCase();

    if (currentUser.prof_img) {
        document.getElementById('userAvatar').src = currentUser.prof_img;
    }
}

async function fetchUserDataFromDB() {
    if (!currentUser || !currentUser.id) return;

    try {
        document.getElementById('leadsContainer').innerHTML = `
            <div class="report-card">
                <h3>No Leads Found</h3>
                <p>Currently no leads assigned to you.</p>
            </div>
        `;

        document.getElementById('totalLeads').textContent = "12";
        document.getElementById('totalAppointments').textContent = "5";
        document.getElementById('totalFollowed').textContent = "8";
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    const activeLi = Array.from(document.querySelectorAll('.sidebar li'))
                          .find(li => li.getAttribute('onclick').includes(sectionId));
    if (activeLi) activeLi.classList.add('active');

    if (sectionId === 'leads') {
        loadLeads();
    } else if (sectionId === 'appointments') {
        loadAppointments();
    } else if (sectionId === 'followed') {
        loadFollowedUp();
    } else if (sectionId === 'reports') {
        loadReportsCounts();     // ← Naya function call
    }
}

// Load Real Reports Counts
async function loadReportsCounts() {
    try {
        const res = await fetch("/api/reports/counts");
        const result = await res.json();

        let totalLeads = 0, totalAppointments = 0, totalFollowed = 0;

        if (result.success && result.data) {
            totalLeads = result.data.totalLeads || 0;
            totalAppointments = result.data.totalAppointments || 0;
            totalFollowed = result.data.totalFollowed || 0;
        }

        document.getElementById('totalLeads').textContent = totalLeads;
        document.getElementById('totalAppointments').textContent = totalAppointments;
        document.getElementById('totalFollowed').textContent = totalFollowed;

        // Create Doughnut Chart
        const ctx = document.getElementById('reportChart').getContext('2d');
        if (reportChart) reportChart.destroy();
        reportChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Total Leads', 'Appointments', 'Followed Up'],
                datasets: [{
                    data: [totalLeads, totalAppointments, totalFollowed],
                    backgroundColor: [
                        '#22d3ee',
                        '#eab308',
                        '#22c55e'
                    ],
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
        console.error("Error loading reports counts:", err);
        
        // Fallback (agar server down ho)
        document.getElementById('totalLeads').textContent = "0";
        document.getElementById('totalAppointments').textContent = "0";
        document.getElementById('totalFollowed').textContent = "0";
    }
}

// Load Appointments
async function loadAppointments() {
    const tbody = document.getElementById("appointmentsTableBody");
    const noData = document.getElementById("noAppointments");

    try {
        const res = await fetch("/api/appointments");
        const result = await res.json();

        if (!result.success || result.data.length === 0) {
            tbody.innerHTML = "";
            noData.classList.remove("hidden");
            return;
        }

        noData.classList.add("hidden");
        tbody.innerHTML = "";

        result.data.forEach((lead, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${lead.company_name}</strong></td>
                    <td>${lead.client_name}</td>
                    <td>${lead.contact}</td>
                    <td>${lead.app_date || '-'}</td>
                    <td>${lead.app_time || '-'}</td>
                    <td>${lead.assign_emp || '-'}</td>
                    <td class="actions">
                        <button onclick="viewLead(${lead.id})" class="btn-view"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:red;">Error loading appointments</td></tr>`;
    }
}

// Load Followed Up
async function loadFollowedUp() {
    const tbody = document.getElementById("followedTableBody");
    const noData = document.getElementById("noFollowed");

    try {
        const res = await fetch("/api/followups");
        const result = await res.json();

        if (!result.success || result.data.length === 0) {
            tbody.innerHTML = "";
            noData.classList.remove("hidden");
            return;
        }

        noData.classList.add("hidden");
        tbody.innerHTML = "";

        result.data.forEach((lead, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${lead.company_name}</strong></td>
                    <td>${lead.client_name}</td>
                    <td>${lead.contact}</td>
                    <td>${lead.city || '-'}</td>
                    <td>${lead.follow_date || '-'}</td>
                    <td>${lead.follow_time || '-'}</td>
                    <td>${lead.reason || '-'}</td>
                    <td class="actions">
                        <button onclick="convertToAppointment(${lead.id})" class="btn-appointment">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:red;">Error loading followed up leads</td></tr>`;
    }
}

function showPopup(title, message, isSuccess) {
    const popup = document.getElementById('popup');
    const icon = document.getElementById('popupIcon');
    const titleEl = document.getElementById('popupTitle');
    const msgEl = document.getElementById('popupMessage');

    titleEl.textContent = title;
    msgEl.textContent = message;

    if (isSuccess) {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#22d3ee';
    } else {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = '#ef4444';
    }

    popup.classList.remove('hidden');
}

function openLeadForm() {
    const modal = document.getElementById("leadModal");
    if (!modal) return;
    
    modal.classList.remove("hidden");
    modal.classList.add("show");
}

function closeLeadForm() {
    const modal = document.getElementById("leadModal");
    if (modal) {
        modal.classList.remove("show");
        modal.classList.add("hidden");
    }
    // Reset form sections to default
    const appointmentSection = document.getElementById("appointmentSection");
    const followupSection = document.getElementById("followupSection");
    appointmentSection.classList.remove("hidden");
    followupSection.classList.add("hidden");
    document.getElementById("actionType").value = "appointment";
}

function handleActionChange() {
    const action = document.getElementById("actionType").value;
    const appointmentSection = document.getElementById("appointmentSection");
    const followupSection = document.getElementById("followupSection");

    if (action === "appointment") {
        appointmentSection.classList.remove("hidden");
        followupSection.classList.add("hidden");
    } else if (action === "followup") {
        appointmentSection.classList.add("hidden");
        followupSection.classList.remove("hidden");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addLeadBtn");
    if (addBtn) {
        addBtn.addEventListener("click", openLeadForm);
    }

    const actionType = document.getElementById("actionType");
    if (actionType) {
        actionType.addEventListener("change", handleActionChange);
        actionType.dispatchEvent(new Event('change'));
    }
});

document.getElementById("leadForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const form = new FormData(this);

    const actionType = document.getElementById("actionType").value;
    const appointmentSection = document.getElementById("appointmentSection");
    const followupSection = document.getElementById("followupSection");

    const data = {
        company: form.get("company"),
        client: form.get("client"),
        contact: form.get("contact"),
        alt_contact: form.get("alt_contact"),
        telephone: form.get("telephone"),
        email: form.get("email"),
        gst_no: form.get("gst_no"),

        flat_no: form.get("flat_no"),
        building_name: form.get("building_name"),
        locality: form.get("locality"),
        city: form.get("city"),
        pincode: form.get("pincode"),
        state: form.get("state"),
        maps_lnk: form.get("maps_lnk"),

        source_lead: form.get("source_lead"),
        industry_type: form.get("industry_type"),

        web_type: form.getAll("web_type[]"),
        seo_type: form.getAll("seo_type[]"),
        smo_type: form.getAll("smo_type[]"),
        app_type: form.getAll("app_type[]"),
        erp_type: form.getAll("erp_type[]"),
        services: form.getAll("services[]"),

        service_notes: form.get("service_notes"),

        actionType: document.getElementById("actionType").value,

        app_date: form.get("app_date"),
        app_time: form.get("app_time"),
        assign_emp: form.get("assign_emp"),
        location: form.get("location"),

        follow_date: form.get("follow_date"),
        follow_time: form.get("follow_time"),
        reason: form.get("reason"),

        additional_notes: form.get("additional_notes")
    };

    try {
        const res = await fetch("/api/leads", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (result.success) {
            alert("Lead Saved ✅");
            document.getElementById("leadForm").reset();
            // Reset sections to default state
            appointmentSection.classList.remove("hidden");
            followupSection.classList.add("hidden");
            document.getElementById("actionType").value = "appointment";
            closeLeadForm();
            loadLeads(); // reload leads
        } else {
            alert("Error saving lead");
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});

async function loadLeads() {
    const tbody = document.getElementById("leadsTableBody");
    const noData = document.getElementById("noDataMessage");

    if (!tbody) return;

    try {
        const res = await fetch("/api/leads");
        const result = await res.json();

        if (!result.success || !result.data || result.data.length === 0) {
            tbody.innerHTML = "";
            noData.classList.remove("hidden");
            return;
        }

        noData.classList.add("hidden");
        tbody.innerHTML = "";

        result.data.forEach((lead, index) => {
            const createdDate = lead.created_at 
                ? new Date(lead.created_at).toLocaleDateString('en-IN') 
                : 'N/A';

            const row = `
    <tr>
        <td>${index + 1}</td>
        <td><strong>${lead.company_name || '-'}</strong></td>
        <td>${lead.client_name || '-'}</td>
        <td>${lead.contact || '-'}</td>
        <td>${lead.city || '-'}</td>
        <td>${lead.source_lead || '-'}</td>
        <td>
            <span class="status-badge ${lead.action_type === 'appointment' ? 'appointment' : 'followup'}">
                ${lead.action_type ? lead.action_type.toUpperCase() : 'APPOINTMENT'}
            </span>
        </td>
        <td>${createdDate}</td>
        <td class="actions">

            
            ${lead.action_type === 'followup' ? `
            <button onclick="convertToAppointment(${lead.id})" class="btn-appointment" title="Set Appointment">
                <i class="fas fa-calendar-plus"></i>Set
            </button>` : ''}
            
            <button onclick="editLead(${lead.id})" class="btn-edit" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
        </td>
    </tr>
`;
            tbody.innerHTML += row;
        });

    } catch (err) {
        console.error("Error loading leads:", err);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">Server error while loading leads</td></tr>`;
    }
}

function viewLead(id) {
    alert("View Lead ID: " + id + " (Feature coming soon)");
    // Baad mein modal mein full details dikhane ka plan
}

function editLead(id) {
    alert("Edit Lead ID: " + id + " (Feature coming soon)");
}


async function convertToAppointment(leadId) {
    try {
        const res = await fetch(`/api/leads/${leadId}`);
        const result = await res.json();
        if (result.success) {
            const lead = result.data;
            const locationValue = lead.maps_lnk || lead.location || '';
            document.getElementById("location").value = locationValue;
            document.getElementById("leadInfo").innerHTML = `
                <strong>${lead.company_name}</strong> - ${lead.client_name}
            `;
        }
    } catch (e) {
        console.error("Error fetching lead:", e);
    }
    document.getElementById("leadIdToUpdate").value = leadId;
    const modal = document.getElementById("appointmentModal");
    modal.classList.remove("hidden");
    modal.classList.add("show");
    document.getElementById("app_date").value = "";
    document.getElementById("app_time").value = "";
    loadAvailableEmployees();
}

// Close Modal
function closeAppointmentModal() {
    const modal = document.getElementById("appointmentModal");
    modal.classList.remove("show");
    modal.classList.add("hidden");
    document.getElementById("appointmentForm").reset();
}

// Form Submit - Update Lead to Appointment
document.getElementById("appointmentForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const leadId = document.getElementById("leadIdToUpdate").value;

    const updateData = {
        action_type: "appointment",
        app_date: document.getElementById("app_date").value,
        app_time: document.getElementById("app_time").value,
        assign_emp: document.getElementById("assign_emp").value,
        location: document.getElementById("location").value
    };

    try {
        const res = await fetch(`/api/leads/${leadId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });

        const result = await res.json();

        if (result.success) {
            alert("Appointment Set Successfully! ✅");
            closeAppointmentModal();
            loadLeads();        // Table refresh
        } else {
            alert("Failed to update: " + (result.message || ""));
        }
    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});

// Load Available ME Employees (avoid double booking)
async function loadAvailableEmployees() {
    const date = document.getElementById("app_date").value;
    const time = document.getElementById("app_time").value;
    const select = document.getElementById("assign_emp");

    // Clear previous options
    select.innerHTML = '<option value="">Select Employee</option>';

    // Agar date ya time nahi hai to abhi mat load karo
    if (!date || !time) return;

    try {
        const res = await fetch(`/api/available-employees?date=${date}&time=${time}`);
        const result = await res.json();

        if (result.success) {
            result.data.forEach(emp => {
                const option = document.createElement("option");
                option.value = emp.name;
                option.textContent = emp.name;
                select.appendChild(option);
            });

            if (result.data.length === 0) {
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "No employee available at this time";
                select.appendChild(option);
            }
        }
    } catch (err) {
        console.error("Error loading employees:", err);
    }
}

async function loadLeadEmployees() {
    const date = document.getElementById("lead_app_date").value;
    const time = document.getElementById("lead_app_time").value;
    const select = document.getElementById("lead_assign_emp");

    // reset dropdown
    select.innerHTML = '<option value="">Select Employee</option>';

    if (!date || !time) return;

    try {
        const res = await fetch(`/api/available-employees?date=${date}&time=${time}`);
        const result = await res.json();

        if (result.success) {
            result.data.forEach(emp => {
                const option = document.createElement("option");
                option.value = emp.name;
                option.textContent = emp.name;
                select.appendChild(option);
            });

            if (result.data.length === 0) {
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "No employee available";
                select.appendChild(option);
            }
        }
    } catch (err) {
        console.error("Error loading employees:", err);
    }
}

function generateMapLink() {
    const flat = document.querySelector('[name="flat_no"]').value || '';
    const building = document.querySelector('[name="building_name"]').value || '';
    const locality = document.querySelector('[name="locality"]').value || '';
    const city = document.querySelector('[name="city"]').value || '';
    const pincode = document.querySelector('[name="pincode"]').value || '';
    const state = document.querySelector('[name="state"]').value || '';
    const fullAddress = `${flat}, ${building}, ${locality}, ${city}, ${pincode}, ${state}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const mapLink = `https://www.google.com/maps?q=${encodedAddress}`;
    document.getElementById("maps_lnk").value = mapLink;
    document.getElementById("lead_location").value = mapLink;
}

function logout() {
    showPopup('Logout', 'You have been logged out successfully.', true);
    setTimeout(() => {
        localStorage.removeItem('currentUser');
        window.location.replace("mp.html");
    }, 1500);
}