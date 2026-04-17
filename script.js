// 1. 대출 계산기 (Loan Calculator)
function calculateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const rate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
    const term = parseFloat(document.getElementById('loanTerm').value) * 12;

    if (!isNaN(amount) && !isNaN(rate) && !isNaN(term) && term > 0) {
        const x = Math.pow(1 + rate, term);
        const monthly = (amount * x * rate) / (x - 1);
        
        const formattedMonthly = Math.round(monthly).toLocaleString('ko-KR');
        
        document.getElementById('loanResult').innerHTML = 
            `예상 월 상환액: <span class="highlight"><strong>${formattedMonthly}</strong> 원</span>`;
    } else {
        alert("대출 원금, 이자율, 기간을 모두 정확히 입력해주세요.");
    }
}

// 2. 복리 계산기 (Compound Interest)
function calculateCompound() {
    const p = parseFloat(document.getElementById('principal').value);
    const pmt = parseFloat(document.getElementById('monthlyDeposit').value) || 0;
    const r = parseFloat(document.getElementById('growthRate').value) / 100 / 12;
    const n = parseFloat(document.getElementById('years').value) * 12;

    if (!isNaN(p) && !isNaN(r) && !isNaN(n) && n > 0) {
        let futureValue;
        if (r === 0) {
            futureValue = p + (pmt * n);
        } else {
            futureValue = p * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
        }

        const formattedValue = Math.round(futureValue).toLocaleString('ko-KR');
        
        document.getElementById('compoundResult').innerHTML = 
            `최종 예상 자산: <span class="highlight"><strong>${formattedValue}</strong> 원</span>`;
    } else {
        alert("투자 원금, 수익률, 기간을 올바르게 입력해주세요.");
    }
}

function showAmortization() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const rate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
    const term = parseFloat(document.getElementById('loanTerm').value) * 12;

    if (isNaN(amount) || isNaN(rate) || isNaN(term)) return;

    let balance = amount;
    let html = '<table style="width:100%; margin-top:20px; font-size:0.8rem; border-collapse:collapse;">';
    html += '<tr style="background:#eee;"><th>회차</th><th>원금상환</th><th>이자</th><th>잔액</th></tr>';

    const x = Math.pow(1 + rate, term);
    const monthly = (amount * x * rate) / (x - 1);

    for (let i = 1; i <= Math.min(term, 12); i++) { // 첫 12개월만 샘플로 노출
        const interest = balance * rate;
        const principal = monthly - interest;
        balance -= principal;
        html += `<tr><td>${i}회</td><td>${Math.round(principal).toLocaleString()}</td><td>${Math.round(interest).toLocaleString()}</td><td>${Math.round(balance).toLocaleString()}</td></tr>`;
    }
    html += '</table>';
    html += '<p style="font-size:0.7rem; color:blue; cursor:pointer;" onclick="showPremiumModal()">...나머지 전체 일정은 프리미엄 리포트에서 확인</p>';
    
    document.getElementById('loanResult').innerHTML += html;
}
