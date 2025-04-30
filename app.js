// ATM Class
class ATM {
    constructor() {
      this.notes = { "20": 0, "50": 0 };
    }
  
    initialize(initialNotes) {
      this.notes = { ...initialNotes };
      this.renderStatus();
    }
  
    addNotes(denomination, count) {
      if (this.notes[denomination] !== undefined) {
        this.notes[denomination] += count;
        this.renderStatus();
      }
    }
  
    report() {
      return `Available Notes: $20 x ${this.notes["20"]}, $50 x ${this.notes["50"]}`;
    }
  
    dispense(amount) {
      let originalNotes = { ...this.notes };
      let success = false;
      let toDispense = { "50": 0, "20": 0 };
  
      // Try all possible number of $50s from high to low
      let maxFifties = Math.min(Math.floor(amount / 50), this.notes["50"]);
  
      for (let fifties = maxFifties; fifties >= 0; fifties--) {
        let remaining = amount - (fifties * 50);
        if (remaining % 20 === 0) {
          let twenties = remaining / 20;
          if (twenties <= this.notes["20"]) {
            // Found a valid combination
            toDispense["50"] = fifties;
            toDispense["20"] = twenties;
            success = true;
            break;
          }
        }
      }
  
      if (success) {
        this.notes["50"] -= toDispense["50"];
        this.notes["20"] -= toDispense["20"];
        this.renderStatus();
        alert(`Dispensed: $50 x ${toDispense["50"]}, $20 x ${toDispense["20"]}`);
      } else {
        alert("Error: Cannot dispense that amount with available notes.");
        this.notes = { ...originalNotes }; // rollback
      }
    }
  
    renderStatus() {
      const app = document.getElementById('app');
      app.innerHTML = `
        <h2>${this.report()}</h2>
        <br>
        <label>Withdraw Amount:</label>
        <input id="withdrawAmount" type="number" placeholder="e.g., 100" />
        <button onclick="withdraw()">Withdraw</button>
      `;
    }
  }
  
  // Initialize ATM
  const atm = new ATM();
  atm.initialize({ "20": 10, "50": 5 }); // Example: 10x$20 and 5x$50
  
  // Helper function called from HTML button
  function withdraw() {
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    atm.dispense(amount);
  }
  