class ATM {
    constructor() {
      this.notes = {};
      this.currentCurrency = 'USD';
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
    }
  
    setCurrency(currency) {
      if (!this.notes[currency]) {
        throw new Error("Currency not supported.");
      }
      this.currentCurrency = currency;
    }
  
    addNotes(currency, denomination, count) {
      if (denomination !== 20 && denomination !== 50) {
        throw new Error("Only $20 and $50 notes are allowed.");
      }
  
      if (!this.notes[currency]) {
        this.notes[currency] = { "20": 0, "50": 0 };
      }
      this.notes[currency][denomination] += count;
    }
  
    getAvailableNotes(currency) {
      return this.notes[currency] || { "20": 0, "50": 0 };
    }
  
    dispense(amount) {
      const currencyNotes = this.notes[this.currentCurrency] || { "20": 0, "50": 0 };
  
      const originalNotes = { ...currencyNotes };
  
      const dispenseNotes = { "20": 0, "50": 0 };
      let remaining = amount;
  
      while (remaining >= 50 && currencyNotes["50"] > 0) {
        remaining -= 50;
        currencyNotes["50"]--;
        dispenseNotes["50"]++;
      }
  
      while (remaining >= 20 && currencyNotes["20"] > 0) {
        remaining -= 20;
        currencyNotes["20"]--;
        dispenseNotes["20"]++;
      }
  
      if (remaining === 0) {
        this.notes[this.currentCurrency] = currencyNotes;
        return dispenseNotes;
      } else {
        // Rollback if cannot dispense exact amount
        this.notes[this.currentCurrency] = originalNotes;
        throw new Error("Cannot dispense the requested amount with available notes.");
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
  
    <div id="output"></div>
  `;
  
  document.getElementById("currencySelect").addEventListener("change", (e) => {
    try {
      atm.setCurrency(e.target.value);
      showMessage(`Currency changed to ${e.target.value}`, "success");
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
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
  