class ATM {
    constructor() {
      this.notes = {};
      this.currentCurrency = 'USD';
      this.threshold = 3;  // Threshold for low cash warning
    }
  
    initialize(notesByCurrency) {
      for (const currency in notesByCurrency) {
        const notes = notesByCurrency[currency];
        this.notes[currency] = { "20": 0, "50": 0 };
  
        for (const denomination in notes) {
          const denomNum = parseInt(denomination);
          if (denomNum !== 20 && denomNum !== 50) {
            throw new Error(`Only $20 and $50 notes are allowed for ${currency}.`);
          }
          this.notes[currency][denomination] = notes[denomination];
        }
      }
      this.checkLowCash();  // Ensure we check for low cash after initialization
    }
  
    setCurrency(currency) {
      if (!this.notes[currency]) {
        throw new Error("Currency not supported.");
      }
      this.currentCurrency = currency;
      this.checkLowCash(); // Check if low on cash when currency is set
    }
  
    addNotes(currency, denomination, count) {
      if (denomination !== 20 && denomination !== 50) {
        throw new Error("Only $20 and $50 notes are allowed.");
      }
  
      if (!this.notes[currency]) {
        this.notes[currency] = { "20": 0, "50": 0 };
      }
      this.notes[currency][denomination] += count;
      this.checkLowCash(); // Check if low on cash after adding notes
    }
  
    getAvailableNotes(currency) {
      return this.notes[currency] || { "20": 0, "50": 0 };
    }
  
    dispense(amount) {
      const currencyNotes = this.notes[this.currentCurrency] || { "20": 0, "50": 0 };
      const originalNotes = { ...currencyNotes };
      const dispenseNotes = { "20": 0, "50": 0 };
      let remaining = amount;
  
      let maxFifties = Math.min(Math.floor(remaining / 50), currencyNotes["50"]);
  
      for (let fifties = maxFifties; fifties >= 0; fifties--) {
        let remainingAfterFifties = remaining - (fifties * 50);
  
        if (remainingAfterFifties % 20 === 0) {
          let twentiesNeeded = remainingAfterFifties / 20;
  
          if (twentiesNeeded <= currencyNotes["20"]) {
            // SUCCESS
            currencyNotes["50"] -= fifties;
            currencyNotes["20"] -= twentiesNeeded;
            dispenseNotes["50"] = fifties;
            dispenseNotes["20"] = twentiesNeeded;
  
            this.notes[this.currentCurrency] = currencyNotes;
            this.checkLowCash(); // Check low cash after dispensing
            return dispenseNotes;
          }
        }
      }
  
      // No valid combination
      this.notes[this.currentCurrency] = originalNotes;
      this.checkLowCash(); // Check low cash if failed to dispense
      throw new Error("Cannot dispense the requested amount with available notes.");
    }
  
    checkLowCash() {
      const available = this.getAvailableNotes(this.currentCurrency);
      if (available["20"] < this.threshold || available["50"] < this.threshold) {
        showMessage(`Warning: Low cash! Less than ${this.threshold} notes of one denomination. Please restock.`, "warning");
      }
    }
  }
  
  // Utility Functions
  function showMessage(message, type = "success") {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = `<div class="${type}">${message}</div>`;
  
    setTimeout(() => {
      messagesDiv.innerHTML = "";
    }, 3000);
  }
  
  function updateAvailableCashDisplay() {
    const available = atm.getAvailableNotes(atm.currentCurrency);
    const total =
      available["20"] * 20 +
      available["50"] * 50;
  
    document.getElementById("cashAvailable").innerHTML = `
      <strong>Available Notes for ${atm.currentCurrency}:</strong><br>
      $50 x ${available["50"]} | $20 x ${available["20"]}<br>
      <strong>Total Cash:</strong> $${total}
    `;
  }
  
  // Setup UI
  const atm = new ATM();
  atm.initialize({
    "USD": { "20": 10, "50": 5 },
    "EUR": { "20": 8, "50": 6 },
    "GBP": { "20": 7, "50": 4 }
  });
  
  const appDiv = document.getElementById("app");
  appDiv.innerHTML = `
    <select id="currencySelect">
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
      <option value="GBP">GBP</option>
    </select>
  
    <input type="number" id="withdrawAmount" placeholder="Enter amount to withdraw" />
    <button id="withdrawButton">Withdraw</button>
  
    <div id="cashAvailable" style="margin-top: 20px; font-weight: bold;"></div>
  
    <h3 style="margin-top: 30px;">Deposit Notes</h3>
    <select id="noteType">
      <option value="20">$20</option>
      <option value="50">$50</option>
    </select>
    <input type="number" id="noteCount" placeholder="Number of notes" />
    <button id="addNotesButton">Add Notes</button>
  
    <div id="output"></div>
    <div id="messages"></div>
  `;
  
  updateAvailableCashDisplay();
  
  document.getElementById("currencySelect").addEventListener("change", (e) => {
    try {
      atm.setCurrency(e.target.value);
      showMessage(`Currency changed to ${e.target.value}`, "success");
      updateAvailableCashDisplay();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
  
  document.getElementById("withdrawButton").addEventListener("click", () => {
    const amount = parseInt(document.getElementById("withdrawAmount").value);
    if (isNaN(amount)) {
      showMessage("Please enter a valid amount.", "error");
      return;
    }
  
    try {
      const notes = atm.dispense(amount);
      const parts = [];
      if (notes["50"] > 0) parts.push(`$50 x ${notes["50"]}`);
      if (notes["20"] > 0) parts.push(`$20 x ${notes["20"]}`);
      
      document.getElementById("output").innerHTML = `<p>Dispensed: ${parts.join(", ")}</p>`;
      showMessage("Withdrawal successful!", "success");
      document.getElementById("withdrawAmount").value = "";
      updateAvailableCashDisplay();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
  
  document.getElementById("addNotesButton").addEventListener("click", () => {
    const denomination = parseInt(document.getElementById("noteType").value);
    const count = parseInt(document.getElementById("noteCount").value);
  
    if (isNaN(count) || count <= 0) {
      showMessage("Please enter a valid number of notes.", "error");
      return;
    }
  
    try {
      atm.addNotes(atm.currentCurrency, denomination, count);
      showMessage(`Added ${count} x $${denomination} notes to ${atm.currentCurrency}`, "success");
      document.getElementById("noteCount").value = "";
      updateAvailableCashDisplay();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
  