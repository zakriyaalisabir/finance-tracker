const API = "https://<your-api-gateway-id>.execute-api.ap-southeast-1.amazonaws.com";

document.getElementById("txForm").onsubmit = async (e) => {
  e.preventDefault();
  const tx = {
    date: document.getElementById("date").value,
    account: document.getElementById("account").value,
    category: document.getElementById("category").value,
    amount: parseFloat(document.getElementById("amount").value),
    currency: document.getElementById("currency").value
  };
  await fetch(API + "/transactions", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(tx)
  });
  alert("Transaction saved!");
  document.getElementById("txForm").reset();
};

document.getElementById("subForm").onsubmit = async (e) => {
  e.preventDefault();
  const sub = {
    name: document.getElementById("subName").value,
    account: document.getElementById("subAccount").value,
    amount: parseFloat(document.getElementById("subAmount").value),
    frequency: document.getElementById("subFreq").value,
    currency: document.getElementById("subCurrency").value
  };
  await fetch(API + "/subscriptions", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(sub)
  });
  alert("Subscription saved!");
  document.getElementById("subForm").reset();
};

document.getElementById("nwForm").onsubmit = async (e) => {
  e.preventDefault();
  const nw = {
    assets: parseFloat(document.getElementById("assets").value),
    liabilities: parseFloat(document.getElementById("liabilities").value),
    netWorth: parseFloat(document.getElementById("assets").value) + parseFloat(document.getElementById("liabilities").value)
  };
  await fetch(API + "/networth", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(nw)
  });
  alert("Net worth snapshot saved!");
  document.getElementById("nwForm").reset();
};

async function loadSummary() {
  const res = await fetch(API + "/summary");
  const data = await res.json();
  document.getElementById("output").innerText = JSON.stringify(data,null,2);
}

async function loadBreakdown() {
  const month = prompt("Enter month (YYYY-MM):");
  if (month) {
    const res = await fetch(API + `/breakdown/${month}`);
    const data = await res.json();
    document.getElementById("output").innerText = JSON.stringify(data,null,2);
  }
}

async function loadSubscriptions() {
  const res = await fetch(API + "/subscriptions");
  const data = await res.json();
  document.getElementById("output").innerText = JSON.stringify(data,null,2);
}

async function loadNetWorth() {
  const res = await fetch(API + "/networth");
  const data = await res.json();
  document.getElementById("output").innerText = JSON.stringify(data,null,2);
}

async function postSubscriptions() {
  const res = await fetch(API + "/subscriptions/post", { method: "POST" });
  const data = await res.json();
  alert(`Posted: ${data.posted.join(", ")}`);
}
