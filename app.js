class ATM {
    constructor() {
      this.notes = {}; // { "USD": { "20": count, "50": count }, ... }
      this.threshold = 3;
      this.currentCurrency = "USD"; // Default currency
    }
  
    initialize(initialNotes) {
      this.notes = { ...initialNotes };
      this.renderStatus();
    }
  
    setCurrency(currency) {
      this.currentCurrency = currency;
      this.renderStatus();
    }
  
    addNotes(currency, denomination, count) {
      if (this.notes[currency] && this.notes[currency][denomination] !== undefined) {
        this.notes[currency][denomination] += count;
        this.renderStatus();
      }
    }
  
    report() {
      const currencyNotes = this.notes[this.currentCurrency];
      let reportStrings = [];
      for (let denom in currencyNotes) {
        reportStrings.push(`${this.currentCurrency} ${denom} x ${currencyNotes[denom]}`);
      }
      return reportStrings.join(", ");
    }
  
    dispense(amount) {
      let originalNotes = JSON.parse(JSON.stringify(this.notes));
      let success = false;
      let toDispense = {};
  
      const currencyNotes = this.notes[this.currentCurrency];
      let denominations = [50, 20]; // Only allow 50 and 20, highest first
  
      function findCombination(amountLeft, index, dispenseSoFar) {
        if (amountLeft === 0) return dispenseSoFar;
        if (index >= denominations.length) return null;
  
        let denom = denominations[index];
        let maxNotes = Math.min(Math.floor(amountLeft / denom), currencyNotes[denom]);
  
        for (let i = maxNotes; i >= 0; i--) {
          let nextDispense = { ...dispenseSoFar };
          if (i > 0) nextDispense[denom] = i;
          let result = findCombination(amountLeft - (i * denom), index + 1, nextDispense);
          if (result) return result;
        }
        return null;
      }
  
      let result = findCombination(amount, 0, {});
  
      if (result) {
        for (let denom in result) {
          currencyNotes[denom] -= result[denom];
        }
        success = true;
        this.renderStatus();
        let dispensedNotes = Object.entries(result)
          .map(([d, c]) => `${this.currentCurrency} ${d} x ${c}`)
          .join(", ");
        alert(`Dispensed: ${dispensedNotes}`);
      } else {
        alert("Error: Cannot dispense that amount with available notes.");
        this.notes = originalNotes; // rollback
      }
    }
  
    renderStatus() {
      const app = document.getElementById('app');
      let warning = this.getThresholdWarnings();
  
      const currencyOptions = Object.keys(this.notes)
        .map(c => `<option value="${c}" ${c === this.currentCurrency ? "selected" : ""}>${c}</option>`)
        .join("");
  
      app.innerHTML = `
        <h2>${this.report()}</h2>
        ${warning}
        <br><br>
        <label>Select Currency:</label>
        <select id="currencySelect" onchange="changeCurrency()">
          ${currencyOptions}
        </select>
        <br><br>
        <label>Withdraw Amount:</label>
        <input id="withdrawAmount" type="number" placeholder="e.g., 100" />
        <button onclick="withdraw()">Withdraw</button>
      `;
    }
  
    getThresholdWarnings() {
      let warnings = [];
      const currencyNotes = this.notes[this.currentCurrency];
      for (let denom in currencyNotes) {
        if (currencyNotes[denom] < this.threshold) {
          warnings.push(`⚠️ Low on ${this.currentCurrency} ${denom} notes!`);
        }
      }
      if (warnings.length > 0) {
        return `<div style="color: red; margin-top: 10px;">${warnings.join("<br>")}</div>`;
      } else {
        return "";
      }
    }
  }
  
  // Initialize ATM
  const atm = new ATM();
  atm.initialize({
    "USD": { "$20": 10, "$50": 5 },
    "EUR": { "$20": 10, "$50": 5 },
    "GBP": { "$20": 10, "$50": 5 }
  });
  
  // Helper functions
  function withdraw() {
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    atm.dispense(amount);
  }
  
  function changeCurrency() {
    const currency = document.getElementById('currencySelect').value;
    atm.setCurrency(currency);
  }
  