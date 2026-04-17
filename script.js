let myChart = null;

// [추가] 실시간 콤마 포맷팅 함수
function formatNumber(node) {
    let value = node.value.replace(/[^0-9]/g, "");
    node.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// [추가] 계산을 위해 콤마를 제거하고 숫자로 변환하는 함수
function getRawNumber(id) {
    const val = document.getElementById(id).value;
    return parseFloat(val.replace(/,/g, "")) || 0;
}

// 1. 대출 계산기
function calculateLoan() {
    const amount = getRawNumber('loanAmount');
    const rate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
    const term = parseFloat(document.getElementById('loanTerm').value) * 12;

    if (amount > 0 && rate > 0 && term > 0) {
        const x = Math.pow(1 + rate, term);
        const monthly = (amount * x * rate) / (x - 1);
        const formatted = Math.round(monthly).toLocaleString('ko-KR');
        document.getElementById('loanResult').innerHTML = `예상 월 상환액: <span class="highlight">${formatted} 원</span>`;
    } else {
        alert("값을 정확히 입력해주세요.");
    }
}

// 2. 복리 계산기 + 차트
function calculateCompound() {
    const p = getRawNumber('principal');
    const pmt = getRawNumber('monthlyDeposit');
    const r = parseFloat(document.getElementById('growthRate').value) / 100 / 12;
    const n = parseFloat(document.getElementById('years').value) * 12;

    if (!isNaN(p) && !isNaN(r) && n > 0) {
        let labels = [];
        let data = [];
        let currentBalance = p;

        for (let i = 0; i <= n; i++) {
            if (i > 0) currentBalance = currentBalance * (1 + r) + pmt;
            if (i % 12 === 0 || i === n) {
                labels.push(`${Math.floor(i / 12)}년`);
                data.push(Math.round(currentBalance));
            }
        }

        const formattedValue = Math.round(currentBalance).toLocaleString('ko-KR');
        document.getElementById('compoundResult').innerHTML = `최종 예상 자산: <span class="highlight">${formattedValue} 원</span>`;

        const ctx = document.getElementById('growthChart').getContext('2d');
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '자산 성장 추이',
                    data: data,
                    borderColor: '#5d5dff',
                    backgroundColor: 'rgba(93, 93, 255, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { ticks: { callback: v => v.toLocaleString() + '원' } } }
            }
        });
    } else {
        alert("값을 정확히 입력해주세요.");
    }
}

// 3. 목표 자산 역산기
function calculateGoal() {
    const target = getRawNumber('targetAmount');
    const years = parseFloat(document.getElementById('goalYears').value);
    const annualRate = parseFloat(document.getElementById('growthRate').value) || 5;
    const r = annualRate / 100 / 12;
    const n = years * 12;

    if (target > 0 && n > 0) {
        let monthlyNeed = (r === 0) ? target / n : target / (((Math.pow(1 + r, n)) - 1) / r);
        const formatted = Math.round(monthlyNeed).toLocaleString('ko-KR');
        document.getElementById('goalResult').innerHTML = `매달 <span class="highlight">${formatted} 원</span>을 저축해야 합니다. (수익률 ${annualRate}% 기준)`;
    } else {
        alert("목표 금액과 기간을 입력해주세요.");
    }
}
