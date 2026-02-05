const chemicalModal = document.querySelector("#chemical-modal");
const openModalButtons = document.querySelectorAll("#open-add-modal, #add-first");
const closeModalButton = document.querySelector("#close-modal");
const chemicalForm = document.querySelector("#chemical-form");
const lookupButton = document.querySelector("#lookup");
const lookupStatus = document.querySelector("#lookup-status");
const inventoryBody = document.querySelector("#inventory-body");
const inventoryEmpty = document.querySelector("#inventory-empty");
const inventoryTable = document.querySelector("#inventory-table");
const searchInput = document.querySelector("#search");
const filterLocation = document.querySelector("#filter-location");

const STORAGE_KEY = "chemManagement.inventory";

const casReference = {
  "64-17-5": {
    name: "Ethanol",
    supplier: "Sigma Aldrich",
    sds: "https://www.sigmaaldrich.com/US/en/sds/sial/459836",
    nfpa: "2-3-0",
  },
  "67-64-1": {
    name: "Acetone",
    supplier: "Fisher Scientific",
    sds: "https://www.fishersci.com/store/msds?partNumber=A9494",
    nfpa: "1-3-0",
  },
  "7732-18-5": {
    name: "Water",
    supplier: "Spectrum Chemical",
    sds: "https://www.spectrumchemical.com/msds/water",
    nfpa: "0-0-0",
  },
};

const state = {
  inventory: loadInventory(),
};

function loadInventory() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse inventory", error);
    return [];
  }
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.inventory));
}

function openModal() {
  chemicalModal.showModal();
}

function closeModal() {
  chemicalModal.close();
  lookupStatus.textContent = "";
}

openModalButtons.forEach((button) => button.addEventListener("click", openModal));
closeModalButton.addEventListener("click", closeModal);

lookupButton.addEventListener("click", () => {
  const casInput = document.querySelector("#cas-input");
  const casValue = casInput.value.trim();
  const reference = casReference[casValue];

  if (!casValue) {
    lookupStatus.textContent = "Enter a CAS number to lookup.";
    return;
  }

  if (!reference) {
    lookupStatus.textContent = "No reference found. Please fill out details manually.";
    return;
  }

  document.querySelector("#name").value = reference.name;
  document.querySelector("#supplier").value = reference.supplier;
  document.querySelector("#sds").value = reference.sds;
  document.querySelector("#nfpa").value = reference.nfpa;
  lookupStatus.textContent = `Prefilled from ${reference.supplier}.`;
});

chemicalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(chemicalForm);
  const baseChemical = {
    cas: formData.get("cas")?.trim() || "",
    name: formData.get("name")?.trim() || "",
    location: formData.get("location")?.trim() || "",
    supplier: formData.get("supplier")?.trim() || "",
    sds: formData.get("sds")?.trim() || "",
    nfpa: formData.get("nfpa")?.trim() || "",
    orderDate: formData.get("orderDate") || "",
    expiration: formData.get("expiration") || "",
  };

  const bottleCount = Number.parseInt(formData.get("bottleCount"), 10) || 1;
  const group = ensureGroup(baseChemical);
  const nextChild = group.nextChild;

  for (let index = 0; index < bottleCount; index += 1) {
    const childNumber = nextChild + index;
    state.inventory.push({
      ...baseChemical,
      groupId: group.groupId,
      bottleId: `${group.groupId}-${String(childNumber).padStart(2, "0")}`,
      childNumber,
    });
  }

  group.nextChild += bottleCount;
  saveGroups(group);
  saveInventory();
  renderInventory();
  chemicalForm.reset();
  closeModal();
});

searchInput.addEventListener("input", renderInventory);
filterLocation.addEventListener("change", renderInventory);

function loadGroups() {
  const raw = localStorage.getItem("chemManagement.groups");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse groups", error);
    return [];
  }
}

function saveGroups(group) {
  const groups = loadGroups();
  const existingIndex = groups.findIndex((item) => item.key === group.key);
  if (existingIndex >= 0) {
    groups[existingIndex] = group;
  } else {
    groups.push(group);
  }
  localStorage.setItem("chemManagement.groups", JSON.stringify(groups));
}

function ensureGroup(baseChemical) {
  const groups = loadGroups();
  const key = `${baseChemical.name.toLowerCase()}::${baseChemical.cas.toLowerCase()}`;
  let group = groups.find((item) => item.key === key);
  if (!group) {
    const newGroupId = generateGroupId(groups.length + 1);
    group = {
      key,
      groupId: newGroupId,
      nextChild: 1,
    };
  }
  return group;
}

function generateGroupId(index) {
  return `CHEM-${String(index).padStart(4, "0")}`;
}

function renderInventory() {
  const query = searchInput.value.toLowerCase();
  const locationFilter = filterLocation.value;
  const filtered = state.inventory.filter((item) => {
    const matchesQuery =
      item.name.toLowerCase().includes(query) ||
      item.cas.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query);
    const matchesLocation = !locationFilter || item.location === locationFilter;
    return matchesQuery && matchesLocation;
  });

  inventoryBody.innerHTML = "";

  if (filtered.length === 0) {
    inventoryEmpty.classList.remove("hidden");
    inventoryTable.classList.add("hidden");
  } else {
    inventoryEmpty.classList.add("hidden");
    inventoryTable.classList.remove("hidden");
  }

  filtered.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.groupId}</td>
      <td>${item.bottleId}</td>
      <td>${item.name}</td>
      <td>${item.cas || "—"}</td>
      <td>${item.location}</td>
      <td>
        <div><strong>SDS:</strong> ${item.sds ? `<a href="${item.sds}" target="_blank" rel="noopener">Link</a>` : "—"}</div>
        <div><strong>NFPA:</strong> ${item.nfpa || "—"}</div>
      </td>
      <td>${item.orderDate || "—"}</td>
      <td>${item.expiration || "—"}</td>
    `;
    inventoryBody.appendChild(row);
  });

  populateLocationFilter();
}

function populateLocationFilter() {
  const locations = Array.from(new Set(state.inventory.map((item) => item.location)));
  const current = filterLocation.value;
  filterLocation.innerHTML = '<option value="">All Locations</option>';
  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    filterLocation.appendChild(option);
  });
  if (locations.includes(current)) {
    filterLocation.value = current;
  }
}

renderInventory();
