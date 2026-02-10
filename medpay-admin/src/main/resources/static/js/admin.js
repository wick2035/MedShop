// Admin JS utilities
const API_BASE = '/api/v1';

function getToken() {
    return localStorage.getItem('medpay_token');
}

function apiCall(url, method, body) {
    const options = {
        method: method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    return fetch(API_BASE + url, options).then(r => r.json());
}

function approveRefund(refundId) {
    if (!confirm('确认批准此退款？')) return;
    apiCall('/refunds/' + refundId + '/approve', 'PUT', {comment: '管理员批准'})
        .then(() => location.reload());
}

function rejectRefund(refundId) {
    const reason = prompt('请输入拒绝原因：');
    if (!reason) return;
    apiCall('/refunds/' + refundId + '/reject', 'PUT', {comment: reason})
        .then(() => location.reload());
}

function triggerReconciliation() {
    const date = prompt('输入对账日期 (YYYY-MM-DD):', new Date(Date.now() - 86400000).toISOString().slice(0, 10));
    if (!date) return;
    apiCall('/reconciliation/trigger', 'POST', {
        reconciliationDate: date,
        channel: 'MOCK'
    }).then(() => location.reload());
}

function searchOrders() {
    // Client-side search placeholder
    alert('请通过API搜索订单');
}

function loadReport() {
    // Chart.js report placeholder
    const ctx = document.getElementById('reportChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '收入 (元)',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#0d6efd',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(13, 110, 253, 0.1)'
                }]
            }
        });
    }
}

function exportCsv() {
    const hospitalId = document.getElementById('reportHospitalId').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    if (!hospitalId || !startDate || !endDate) {
        alert('请填写完整的查询条件');
        return;
    }
    window.location.href = API_BASE + '/reports/export/csv?hospitalId=' + hospitalId
        + '&startDate=' + startDate + '&endDate=' + endDate;
}

// Auto-init dashboard chart
document.addEventListener('DOMContentLoaded', function() {
    const revenueChart = document.getElementById('revenueChart');
    if (revenueChart) {
        new Chart(revenueChart, {
            type: 'bar',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [{
                    label: '月收入',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#0d6efd'
                }]
            },
            options: { responsive: true }
        });
    }
});

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        })
        .then(r => r.json())
        .then(data => {
            if (data.code === 0 && data.data) {
                localStorage.setItem('medpay_token', data.data.accessToken);
                window.location.href = '/admin/dashboard';
            } else {
                alert(data.message || '登录失败');
            }
        })
        .catch(() => alert('登录失败'));
    });
}
