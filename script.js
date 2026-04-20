let myChart = null;

function formatNumber(node) {
    let value = node.value.replace(/[^0-9]/g, "");
    node.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getRawNumber(id) {
    const val = document.getElementById(id).value;
    return parseFloat(val.replace(/,/g, "")) || 0;
}

// 대출 계산기 로직
function calculateLoan() {
    const amount = getRawNumber('loanAmount');
    const annualRate = parseFloat(document.getElementById('interestRate').value) / 100;
    const monthlyRate = annualRate / 12;
    const years = parseFloat(document.getElementById('loanTerm').value);
    const months = years * 12;
    const method = document.getElementById('repaymentMethod').value;

    if (amount > 0 && annualRate > 0 && months > 0) {
        document.getElementById('scheduleContainer').style.display = 'block';
        let balance = amount;
        let tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem; border:1px solid #ddd;">
            <tr style="background:#f8f9ff;"><th>회차</th><th>상환액</th><th>잔액</th></tr>`;

        for (let i = 1; i <= months; i++) {
            let interest = balance * monthlyRate;
            let principal = 0;
            let payment = 0;

            if (method === "level") {
                const x = Math.pow(1 + monthlyRate, months);
                payment = (amount * x * monthlyRate) / (x - 1);
                principal = payment - interest;
            } else {
                principal = amount / months;
                payment = principal + interest;
            }
            balance -= principal;
            if (i <= 6) {
                tableHtml += `<tr><td style="text-align:center;">${i}회</td><td style="text-align:right; padding:5px;">${Math.round(payment).toLocaleString()}원</td><td style="text-align:right; padding:5px;">${Math.max(0, Math.round(balance)).toLocaleString()}원</td></tr>`;
            }
        }
        tableHtml += `</table>`;
        document.getElementById('amortizationTable').innerHTML = tableHtml;
        document.getElementById('loanResult').innerHTML = `첫 회차 월 납입액: <span class="highlight">${Math.round(amount/months + amount*(annualRate/12)).toLocaleString()}원 (원금방식 기준 예시)</span>`;
    } else { alert("정보를 정확히 입력해주세요."); }
}

// 복리 계산기 PRO 로직
function calculateCompound() {
    const p = getRawNumber('principal');
    const pmt = getRawNumber('monthlyDeposit');
    const r = parseFloat(document.getElementById('growthRate').value) / 100 / 12;
    const n = parseFloat(document.getElementById('years').value) * 12;
    const taxRate = parseFloat(document.getElementById('taxRate').value) / 100;

    if (!isNaN(p) && !isNaN(r) && n > 0) {
        let labels = ["0년"];
        let data = [p];
        let balance = p;
        let totalDeposit = p;

        let tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem; border:1px solid #ddd;">
            <tr style="background:#f8f9ff;"><th>기간</th><th>원금합계</th><th>예상자산</th></tr>`;

        for (let i = 1; i <= n; i++) {
            balance = balance * (1 + r) + pmt;
            totalDeposit += pmt;
            if (i % 12 === 0 || i === n) {
                const year = Math.floor(i / 12);
                labels.push(`${year}년`);
                data.push(Math.round(balance));
                tableHtml += `<tr><td style="text-align:center;">${year}년차</td><td style="text-align:right; padding:5px;">${Math.round(totalDeposit).toLocaleString()}원</td><td style="text-align:right; padding:5px;">${Math.round(balance).toLocaleString()}원</td></tr>`;
            }
        }

        const profit = balance - totalDeposit;
        const tax = profit > 0 ? profit * taxRate : 0;
        const finalAmount = balance - tax;

        document.getElementById('compoundResult').innerHTML = `
            세전 자산: ${Math.round(balance).toLocaleString()}원<br>
            수익 세금: -${Math.round(tax).toLocaleString()}원<br>
            <strong>최종 세후 수령액: <span class="highlight">${Math.round(finalAmount).toLocaleString()}원</span></strong>
        `;

        document.getElementById('compoundTableContainer').style.display = 'block';
        document.getElementById('compoundYearlyTable').innerHTML = tableHtml + `</table>`;

        const ctx = document.getElementById('growthChart').getContext('2d');
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{ label: '자산 성장(세전)', data: data, borderColor: '#5d5dff', backgroundColor: 'rgba(93, 93, 255, 0.1)', fill: true, tension: 0.3 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    } else { alert("정보를 정확히 입력해주세요."); }
}

// AI Goal Path 로직
function calculateGoal() {
    const target = getRawNumber('targetAmount');
    const years = parseFloat(document.getElementById('goalYears').value);
    const r = (parseFloat(document.getElementById('growthRate').value) || 5) / 100 / 12;
    const n = years * 12;
    if (target > 0 && n > 0) {
        let need = (r === 0) ? target / n : target / (((Math.pow(1 + r, n)) - 1) / r);
        document.getElementById('goalResult').innerHTML = `매달 <span class="highlight">${Math.round(need).toLocaleString()} 원</span> 저축 필요`;
    } else { alert("정보를 입력해주세요."); }
}
