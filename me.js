let currentUser = null;
let currentLeadId = null;

window.onload = function () {
    loadUser();
    fetchMEData();
    fetchDeals();
    const modal = document.getElementById('actionModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('show');
    }
};

function loadUser() {
    const user = localStorage.getItem("currentUser");

    if (!user) {
        showPopup("Session Expired", "Login again", false);
        setTimeout(() => {
            window.location.href = "mp.html";
        }, 1500);
        return;
    }

    currentUser = JSON.parse(user);

    document.getElementById("userName").textContent = currentUser.name;

    if (currentUser.prof_img) {
        document.getElementById("userAvatar").src = "/" + currentUser.prof_img;
    }
}

async function fetchMEData() {
    if (!currentUser || !currentUser.id) return;

    try {
        const res = await fetch(`/api/appointments/${currentUser.id}`);
        const data = await res.json();

        const container = document.getElementById("appointmentsContainer");

        if (!data.success || !data.data || data.data.length === 0) {
            container.innerHTML = `<p class="no-data">No Appointments Found</p>`;
            return;
        }

        let table = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Client</th>
                        <th>Contact</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.data.forEach(item => {
            const isNotInterested = item.lead_status === 'not_interested';
            const statusText = item.lead_status === 'not_interested' ? 'Not Interested' :
                             (item.lead_status === 'deal_closed' ? 'Deal Closed' : 'Active');

            table += `
                <tr onclick="openActionModal(${item.id}, '${(item.company_name || '').replace(/'/g, "\\'")}', '${(item.client_name || '').replace(/'/g, "\\'")}')"
                    class="${isNotInterested ? 'grayed-out' : ''}"
                    style="cursor: pointer;">
                    <td>${item.company_name || '-'}</td>
                    <td>${item.client_name || '-'}</td>
                    <td>${item.contact || '-'}</td>
                    <td>${item.app_date || '-'}</td>
                    <td>${item.app_time || '-'}</td>
                    <td><a href="${item.location || '-'}" target="_blank" style="color:lightskyblue; text-decoration:none;">View Location</a></td>
                    <td>
                        <span class="status ${item.lead_status || 'active'}">
                            ${statusText}
                        </span>
                    </td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        container.innerHTML = `<div class="table-wrapper">${table}</div>`;

    } catch (err) {
        console.error("Error fetching ME appointments:", err);
        document.getElementById("appointmentsContainer").innerHTML = `
            <p class="error">Error loading appointments. Please try again.</p>
        `;
    }
}

function showSection(sectionId) {
    if (sectionId === 'reports') {
        fetchReports();
    }

    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.sidebar li').forEach(li => {
        li.classList.remove('active');
    });

    const activeLi = Array.from(document.querySelectorAll('.sidebar li'))
        .find(li => li.getAttribute('onclick').includes(sectionId));

    if (activeLi) activeLi.classList.add('active');

    if (sectionId === 'deals') {
        fetchDeals();
    }
    if (sectionId === 'followups') {
        fetchFollowups();
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

    setTimeout(() => {
        popup.classList.add('hidden');
    }, 1500);
}

function openActionModal(leadId, company, client) {
    currentLeadId = leadId;
    document.getElementById('modalLeadTitle').textContent = company || client || "Client Action";
    document.getElementById('modalLeadInfo').textContent = `Company: ${company || '-'} | Client: ${client || '-'}`;
    document.getElementById('actionButtons').classList.remove('hidden');
    document.getElementById('followupForm').classList.add('hidden');
    document.getElementById('dealClosedForm').classList.add('hidden');
    const modal = document.getElementById('actionModal');
    modal.classList.remove('hidden');
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('actionModal');
    modal.classList.remove('show');
    modal.classList.add('hidden');
    currentLeadId = null;
}

function takeAction(action) {
    document.getElementById('followupForm').classList.add('hidden');
    document.getElementById('dealClosedForm').classList.add('hidden');
    document.getElementById('actionButtons').classList.add('hidden');

    if (action === 'not_interested') {
        const formData = new FormData();
        formData.append('action', 'not_interested');
        updateLeadAction(formData);
    } else if (action === 'followup') {
        document.getElementById('followupForm').classList.remove('hidden');
    } else if (action === 'deal_closed') {
        document.getElementById('dealClosedForm').classList.remove('hidden');
    }
}

async function saveFollowUp() {
    const follow_date = document.getElementById('followDate').value;
    const follow_time = document.getElementById('followTime').value;
    const reason = document.getElementById('followReason').value;

    const formData = new FormData();
    formData.append('action', 'followup');
    formData.append('follow_date', follow_date);
    formData.append('follow_time', follow_time);
    formData.append('reason', reason);

    await updateLeadAction(formData);
}

async function saveDealClosed() {
    const deal_amount = document.getElementById('dealAmount').value.trim();
    const payment_method = document.getElementById('paymentMethod').value;

    if (!deal_amount || !payment_method) {
        alert("Deal Amount aur Payment Method dono zaroori hain!");
        return;
    }

    const formData = new FormData();
    formData.append('action', 'deal_closed');
    formData.append('deal_amount', deal_amount);
    formData.append('payment_method', payment_method);
    formData.append('payment_notes', document.getElementById('paymentNotes').value || '');
    formData.append('closed_by', currentUser ? currentUser.id : '');

    const method = payment_method;

    if (method === 'Cash') {
        formData.append('received_by', document.getElementById('receivedBy')?.value || currentUser.name);
        const fileInput = document.getElementById('cashPhoto');
        if (fileInput && fileInput.files[0]) formData.append('paymentProof', fileInput.files[0]);
    } else if (method === 'Cheque') {
        formData.append('cheque_number', document.getElementById('chequeNumber')?.value || '');
        formData.append('cheque_date', document.getElementById('chequeDate')?.value || '');
        formData.append('bank_name', document.getElementById('bankName')?.value || '');
        formData.append('branch_name', document.getElementById('branchName')?.value || '');

        const fileInput = document.getElementById('chequePhoto');
        if (fileInput && fileInput.files[0]) formData.append('paymentProof', fileInput.files[0]);
    } else if (method === 'UPI / Net Banking') {
        formData.append('transaction_id', document.getElementById('transactionId')?.value || '');
        formData.append('payment_date', document.getElementById('upiDate')?.value || '');

        const fileInput = document.getElementById('upiScreenshot');
        if (fileInput && fileInput.files[0]) formData.append('paymentProof', fileInput.files[0]);
    } else if (method === 'Debit/Credit Card') {
        formData.append('transaction_id', document.getElementById('cardTransactionId')?.value || '');

        const fileInput = document.getElementById('cardScreenshot');
        if (fileInput && fileInput.files[0]) formData.append('paymentProof', fileInput.files[0]);
    }

    await updateLeadAction(formData);
}

async function updateLeadAction(data) {
    try {
        const res = await fetch(`/api/leads/${currentLeadId}/action`, {
            method: 'PUT',
            body: data
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Server Error Response:", text);
            throw new Error(`Server error: ${res.status}`);
        }

        const result = await res.json();

        if (result.success) {
            closeModal();
            showPopup('Success', 'Deal Closed successfully!', true);
            fetchMEData();
            fetchDeals();
            fetchFollowups();
        } else {
            showPopup('Error', result.message || 'Update failed', false);
        }
    } catch (err) {
        console.error("Update Error:", err);
        showPopup('Error', 'Something went wrong. Check console.', false);
    }
}

function showPaymentFields() {
    const method = document.getElementById('paymentMethod').value;
    const container = document.getElementById('dynamicPaymentFields');
    container.innerHTML = '';

    let html = '';

    if (method === 'Cash') {
        html = `
            <label>Cash Received By</label>
            <input type="text" id="receivedBy" value="${currentUser ? currentUser.name : 'ME'}" readonly>

            <label>Cash Receipt Photo <span class="required">*</span></label>
            <input type="file" id="cashPhoto" accept="image/*" capture="camera" required>
            <small>Take photo of cash receipt / handover proof</small>
        `;
    } else if (method === 'Cheque') {
        html = `
            <label>Cheque Number <span class="required">*</span></label>
            <input type="text" id="chequeNumber" placeholder="e.g. 12345678" required>

            <label>Cheque Date <span class="required">*</span></label>
            <input type="date" id="chequeDate" required>

            <label>Bank Name <span class="required">*</span></label>
            <input type="text" id="bankName" placeholder="e.g. HDFC Bank" required>

            <label>Branch (Optional)</label>
            <input type="text" id="branchName" placeholder="Branch name">

            <label>Cheque Photo <span class="required">*</span></label>
            <input type="file" id="chequePhoto" accept="image/*" capture="camera" required>
            <small>Front side of cheque ki photo lo</small>
        `;
    } else if (method === 'UPI / Net Banking') {
        html = `
            <label>Transaction ID / UTR Number <span class="required">*</span></label>
            <input type="text" id="transactionId" placeholder="UPI Ref No. ya Transaction ID" required>

            <label>Payment Date</label>
            <input type="date" id="upiDate" value="${new Date().toISOString().split('T')[0]}">

            <label>UPI App / Bank Name (Optional)</label>
            <input type="text" id="upiApp" placeholder="e.g. Google Pay, PhonePe, SBI">

            <label>Screenshot (Optional)</label>
            <input type="file" id="upiScreenshot" accept="image/*">
        `;
    } else if (method === 'Debit/Credit Card') {
        html = `
            <label>Transaction Reference / Approval Code</label>
            <input type="text" id="cardTransactionId" placeholder="Transaction ID">

            <label>Last 4 Digits of Card (Optional)</label>
            <input type="text" id="last4Digits" maxlength="4" placeholder="1234">

            <label>Card Type (Optional)</label>
            <select id="cardType">
                <option value="">Select</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Rupay">Rupay</option>
                <option value="Amex">American Express</option>
            </select>

            <label>Payment Screenshot (Optional)</label>
            <input type="file" id="cardScreenshot" accept="image/*">
        `;
    }

    container.innerHTML = html;
}

async function fetchDeals() {
    if (!currentUser || !currentUser.id) return;

    try {
        const res = await fetch(`/api/deals/${currentUser.id}`);
        const data = await res.json();

        const container = document.getElementById("dealsContainer");

        if (!data.success || !data.data || data.data.length === 0) {
            container.innerHTML = `<p class="no-data">No Deals Found</p>`;
            return;
        }

        let table = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Closed Date</th>
                        <th>Invoice</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.data.forEach((item) => {
            table += `
                <tr>
                    <td>${item.company_name || "-"}</td>
                    <td>${item.client_name || "-"}</td>
                    <td>₹${item.deal_amount || "0"}</td>
                    <td>${item.payment_method || "-"}</td>
                    <td>${item.closed_date || "-"}</td>
                    <td class="invoice-actions">
                        <button onclick="downloadInvoice(${item.id})" class="btn btn-invoice">
                            <i class="fas fa-download"></i>
                        </button>

                        <button onclick="shareWhatsApp('${item.contact}', ${item.id})" class="btn btn-whatsapp">
                            <i class="fab fa-whatsapp"></i>
                        </button>

                        <button onclick="shareGmail('${item.email}', ${item.id})" class="btn btn-gmail">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        container.innerHTML = `<div class="table-wrapper">${table}</div>`;
    } catch (err) {
        console.error("Deals fetch error:", err);
        document.getElementById("dealsContainer").innerHTML =
            `<p class="error">Error loading deals</p>`;
    }
}

function downloadInvoice(id) {
    window.open(`/api/invoice/${id}`, "_blank");
}

async function getInvoiceFile(id) {
    const res = await fetch(`/api/invoice/${id}`);
    const blob = await res.blob();

    return new File([blob], `invoice_${id}.pdf`, {
        type: "application/pdf",
    });
}

async function shareWhatsApp(phone, id) {
    const file = await getInvoiceFile(id);

    if (navigator.share) {
        await navigator.share({
            title: "Invoice",
            text: "Your invoice",
            files: [file]
        });
    } else {
        alert("Sharing not supported on this device");
    }
}

function shareGmail(email, id) {
    if (!email) {
        alert("Email not available");
        return;
    }

    const pdfUrl = `/api/invoice/${id}`;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `invoice_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
        const subject = "Invoice PDF";
        const body = "Hi,\n\nPlease find attached invoice.\n\n(Attach downloaded PDF)";

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.open(gmailUrl, "_blank");
    }, 800);
}

function logout() {
    showPopup('Logout', 'You have been logged out successfully.', true);

    setTimeout(() => {
        localStorage.removeItem('currentUser');
        window.location.replace("mp.html");
    }, 1500);
}

let reportChart = null;

async function fetchFollowups() {
    if (!currentUser || !currentUser.id) return;

    try {
        const res = await fetch(`/api/followups/${currentUser.id}`);
        const data = await res.json();

        const container = document.getElementById("followupsContainer");

        if (!data.success || !data.data || data.data.length === 0) {
            container.innerHTML = `<p class="no-data">No Followups Found</p>`;
            return;
        }

        let table = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Client</th>
                        <th>Contact</th>
                        <th>Follow Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.data.forEach(item => {
            table += `
                <tr>
                    <td>${item.company_name || '-'}</td>
                    <td>${item.client_name || '-'}</td>
                    <td>${item.contact || '-'}</td>
                    <td>${item.follow_date || '-'}</td>
                    <td>${item.follow_time || '-'}</td>
                    <td>${item.reason || '-'}</td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        container.innerHTML = `<div class="table-wrapper">${table}</div>`;

    } catch (err) {
        console.error("Followups fetch error:", err);
        document.getElementById("followupsContainer").innerHTML =
            `<p class="error">Error loading followups</p>`;
    }
}

async function fetchReports() {
    if (!currentUser || !currentUser.id) return;

    try {
        const resApp = await fetch(`/api/appointments/${currentUser.id}`);
        const dataApp = await resApp.json();

        const resFollow = await fetch(`/api/followups/${currentUser.id}`);
        const dataFollow = await resFollow.json();

        const resDeals = await fetch(`/api/deals/${currentUser.id}`);
        const dataDeals = await resDeals.json();

        const appointmentsCount = dataApp.success ? dataApp.data.length : 0;
        const followupsCount = dataFollow.success ? dataFollow.data.length : 0;
        const dealsCount = dataDeals.success ? dataDeals.data.length : 0;

        document.getElementById("totalAppointments").textContent = appointmentsCount;
        document.getElementById("totalFollowups").textContent = followupsCount;
        document.getElementById("totalDeals").textContent = dealsCount;

        const ctx = document.getElementById('reportChart').getContext('2d');

        if (reportChart) reportChart.destroy();

        reportChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Appointments', 'Follow Ups', 'Deals'],
                datasets: [{
                    data: [appointmentsCount, followupsCount, dealsCount],
                    backgroundColor: [
                        '#00c6ff',
                        '#ffcc00',
                        '#00e676'
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
        console.error("Reports Error:", err);
    }
}

