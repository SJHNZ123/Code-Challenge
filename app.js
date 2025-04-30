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
      let toDispense = { "50": 0, "20": 0 };
      let remaining = amount;
  
      // Prefer $50 first
      while (remaining >= 50 && this.notes["50"] > 0) {
        remaining -= 50;
        this.notes["50"]--;
        toDispense["50"]++;
      }
  
      while (remaining >= 20 && this.notes["20"] > 0) {
        remaining -= 20;
        this.notes["20"]--;
        toDispense["20"]++;
      }
  
      if (remaining === 0) {
        this.renderStatus();
        alert(`Dispensed: $50 x ${toDispense["50"]}, $20 x ${toDispense["20"]}`);
      } else {
        alert("Error: Cannot dispense that amount with available notes.");
        this.notes = { ...originalNotes }; // Rollback
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
  
