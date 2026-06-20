function calculateMortgage() {
    const principal = parseFloat(document.getElementById('loan-amount').value);
    const annualRate = parseFloat(document.getElementById('interest-rate').value);
    const years = parseInt(document.getElementById('loan-term').value);

    if (!principal || !annualRate || !years) {
        showToast('Please fill in all fields', 'warning');
        return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;

    let monthlyPayment;
    if (monthlyRate === 0) {
        monthlyPayment = principal / numPayments;
    } else {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    const resultEl = document.getElementById('mortgage-result');
    document.getElementById('monthly-payment').textContent = formatPrice(monthlyPayment);
    resultEl.style.display = 'block';
}
