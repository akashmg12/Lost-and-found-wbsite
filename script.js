const BIN_ID = "YOUR_BIN_ID"; // replace with your bin ID
const API_KEY = "YOUR_SECRET_API_KEY"; // replace with your secret key
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Add new item
async function saveItem(type, name, desc, person, contact, imageData) {
    const items = await getItems(); // get existing items
    const newItem = {
        id: Date.now(),
        type,
        name,
        desc,
        person,
        contact,
        imageURL: imageData || ""
    };
    items.push(newItem);

    // Update bin
    await fetch(BIN_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": API_KEY
        },
        body: JSON.stringify({ items })
    });

    loadItems();
}

// Get all items
async function getItems() {
    const res = await fetch(BIN_URL, {
        headers: { "X-Master-Key": API_KEY }
    });
    const data = await res.json();
    return data.record.items;
}

// Load and display items
async function loadItems() {
    const itemsList = document.getElementById("itemsList");
    const items = await getItems();
    itemsList.innerHTML = "";

    if (items.length === 0) {
        itemsList.innerHTML = "<p>No lost or found items reported yet.</p>";
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("item-card");
        card.innerHTML = `
            <img src="${item.imageURL || 'https://via.placeholder.com/120'}" />
            <div>
                <h3>${item.name} (${item.type.toUpperCase()})</h3>
                <p>${item.desc}</p>
                <small>Reported by: <b>${item.person}</b></small><br>
                <button class="contact" onclick="alert('Contact: ${item.contact}')">Contact</button>
                <button class="returned-btn" onclick="deleteItem(${item.id})">Item Returned ✔</button>
            </div>
        `;
        itemsList.appendChild(card);
    });
}

// Delete item
async function deleteItem(id) {
    if(!confirm("Are you sure this item has been returned?")) return;
    const items = await getItems();
    const updated = items.filter(item => item.id !== id);
    await fetch(BIN_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": "691feab2d0ea881f40f5f105"
        },
        body: JSON.stringify({ items: updated })
    });
    loadItems();
}

// Handle forms
function handleForm(formId, type, nameId, descId, personId, contactId, imageId){
    const form = document.getElementById(formId);
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById(nameId).value;
        const desc = document.getElementById(descId).value;
        const person = document.getElementById(personId).value;
        const contact = document.getElementById(contactId).value;
        const imageFile = document.getElementById(imageId).files[0];

        if(imageFile){
            const reader = new FileReader();
            reader.onload = function(){ saveItem(type, name, desc, person, contact, reader.result); }
            reader.readAsDataURL(imageFile);
        } else {
            saveItem(type, name, desc, person, contact, "");
        }

        form.reset();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    handleForm('lostForm','lost','lostName','lostDesc','lostPerson','lostContact','lostImage');
    handleForm('foundForm','found','foundName','foundDesc','foundPerson','foundContact','foundImage');
    loadItems();
});
