let transactions = [];
let myChart;
let dbVersion;
let db;

const request = indexedDB.open('budgetOffline', dbVersion || 1);

request.onupgradeneeded = (event) => {
  // const { oldVersion } = event;
  // const newVersion = event.newVersion || db.version;

  db = event.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('budgetOffline', {autoIncrement: true});
  }
};

request.onerror = (event) => {
  console.log(event.target.errorCode);
};


const checkDataBase = () => {
  console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
  let transaction = db.transaction(['budgetOffline'], 'readwrite');
  let budgetStore = transaction.objectStore('budgetOffline');
  const allTransactions = budgetStore.getAll();

  allTransactions.onsuccess = () => {
    if (allTransactions.result.length > 0) {
      fetch('api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(allTransactions.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
      .then((response) => response.json())
      .then((res) => {
        if (res.length !== 0) {
          transaction = db.transaction(['budgetOffline'], 'readwrite');
          store = transaction.objectStore('budgetOffline');
          store.clear();
        }
      })
    }
  }
};

request.onsuccess = (event) => {
  db = event.target.result;
  if (navigator.onLine) {
    checkDataBase();
  }
}


fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // save db data on global variable
    transactions = data;
    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
      data: {
        labels,
        datasets: [{
            label: "Total Over Time",
            fill: true,
            backgroundColor: "#6666ff",
            data
        }]
    }
  });
}

function sendTransaction(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();
  
  // also send to server
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
  .then(response => {    
    return response.json();
  })
  .then(data => {
    if (data.errors) {
      errorEl.textContent = "Missing Information";
    }
    else {
      // clear form
      nameEl.value = "";
      amountEl.value = "";
    }
  })
  .catch(err => {
    // fetch failed, so save in indexed db
    saveRecord(transaction);

    // clear form
    nameEl.value = "";
    amountEl.value = "";
  });
}

function saveRecord (transactions) {
  
  let transaction = db.transaction(['budgetOffline'], 'readwrite');
  let budgetStore = transaction.objectStore('budgetOffline');
  budgetStore.add(transactions);

};
document.querySelector("#add-btn").onclick = function() {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  sendTransaction(false);
};
