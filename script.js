/**
 * 1. 대출 계산기 (Loan Calculator)
 * 원리금 균등 상환 방식 공식 적용
 */
function calculateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const rate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
    const term = parseFloat(document.getElementById('loanTerm').value) * 12;

    if (!isNaN(amount) && !isNaN(rate) && !isNaN(term) && term > 0) {
        const x = Math.pow(1 + rate, term);
        const monthly = (amount * x * rate) / (x - 1);
        
        // 정수 반올림 후 한국식 콤마 포맷팅 적용
        const formattedMonthly = Math.round(monthly).toLocaleString('ko-KR');
        
        document.getElementById('loanResult').innerHTML = 
            `예상 월 상환액: <span class="highlight"><strong>${formattedMonthly}</strong> 원</span>`;
    } else {
        alert("대출 원금, 이자율, 기간을 모두 정확히 입력해주세요.");
    }
}

/**
 * 2. 복리 계산기 (Compound Interest)
 * 월 복리 및 월 적립액 합산 공식 적용
 */
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
            // 초기 투자금 복리 + 매월 적립액 복리 합산 공식
            futureValue = p * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
        }

        const formattedValue = Math.round(futureValue).toLocaleString('ko-KR');
        
        document.getElementById('compoundResult').innerHTML = 
            `최종 예상 자산: <span class="highlight"><strong>${formattedValue}</strong> 원</span>`;
    } else {
        alert("투자 원금, 수익률, 기간을 올바르게 입력해주세요.");
    }
}
