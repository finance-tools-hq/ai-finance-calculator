let myChart = null;

// 실시간 콤마 포맷팅
function formatNumber(node) {
    let value = node.value.replace(/[^0-9]/g, "");
    node.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 콤마 제거 후 숫자 변환
function getRawNumber(id) {
    const val = document.getElementById(id).value;
    return parseFloat(val.replace(/,/g, "")) || 0;
}

// 1. 대출 계산기 로직
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
            <tr style="background:#f8f9ff;"><th>회차</th><th>납입금</th><th>잔액</th></tr>`;

        let firstPay = 0;

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
            if (i === 1) firstPay = payment;

            if (i <= 6) {
                tableHtml += `<tr><td style="text-align:center;">${i}회</td><td style="text-align:right; padding:5px;">${Math.round(payment).toLocaleString()}원</td><td style="text-align:right; padding:5px;">${Math.max(0, Math.round(balance)).toLocaleString()}원</td></tr>`;
            }
        }
        tableHtml += `</table>`;
        document.getElementById('amortizationTable').innerHTML = tableHtml;
        document.getElementById('loanResult').innerHTML = `첫 회차 월 상환액: <span class="highlight">${Math.round(firstPay).toLocaleString()}원</span>`;
    } else { alert("정보를 정확히 입력해주세요."); }
}

// 2. 복리 계산기 PRO 로직
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
            세전 자산: ${Math.round(balance).toLocaleString()}원 / 
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

// 3. 목표 역산 로직
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

// 4. 중도상환수수료 계산 로직
function calculatePrepayFee() {
    const amount = getRawNumber('prepayAmount'); // 상환액
    const feeRate = parseFloat(document.getElementById('prepayFeeRate').value) / 100; // 수수료율
    const totalYears = parseFloat(document.getElementById('totalLoanTerm').value); // 대출기간
    const remainDays = parseFloat(document.getElementById('remainingDays').value); // 남은일수
    
    const totalDays = totalYears * 365; // 전체 일수 계산

    if (amount > 0 && feeRate > 0 && totalYears > 0 && remainDays >= 0) {
        // 중도상환수수료 산식 (슬라이딩 방식 적용)
        // 공식: 중도상환금액 * 수수료율 * (남은일수 / 전체일수)
        const fee = amount * feeRate * (remainDays / totalDays);
        
        const formattedFee = Math.round(fee).toLocaleString('ko-KR');
        const formattedAmount = Math.round(amount).toLocaleString('ko-KR');

        document.getElementById('prepayResult').innerHTML = `
            ${formattedAmount}원 상환 시 예상 수수료: <br>
            <span class="highlight" style="font-size: 1.3rem;">${formattedFee} 원</span>
            <p style="font-size: 0.8rem; color: #888; margin-top: 5px;">
                (남은 기간 ${remainDays}일 / 전체 기간 ${totalDays}일 기준)
            </p>
        `;
    } else {
        alert("수수료 정보를 정확히 입력해주세요. 남은 기간이 전체 기간보다 클 수 없습니다.");
    }
}
