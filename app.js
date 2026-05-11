// ================= DATA =================
let markers = [];
let allCustomers = [];
let vehicleList = [];

let pheromone = {};
let polylines = [];

// ================= ACO PARAM =================
let alpha = 1;
let beta = 2;
let rho = 0.5;

// ================= ĐỊA CHỈ Kho =================
function getDepot() {

    let kho = document.querySelector("#khoList .card");

    if (!kho) {
        alert("Chưa có kho!");
        return null;
    }

    let inputs = kho.querySelectorAll("input");

    return {
        id: 0,
        name: "Kho",
        lat: parseFloat(inputs[1].value),
        lng: parseFloat(inputs[2].value)
    };
}

// ================= MAP =================
const map = L.map('map').setView([21.028, 105.834], 13);

// =================LẤY THÔNG TIN TỪ MAP =================
map.on("click", async function (e) {

    let lat = e.latlng.lat.toFixed(6);
    let lng = e.latlng.lng.toFixed(6);

    let address = "Không rõ";
    try {
        let res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        let data = await res.json();
        address = data.display_name || "Không rõ";
    } catch {
        console.log("Lỗi lấy địa chỉ");
    }

    if (!document.getElementById("khoTab").classList.contains("hidden")) {
        addKhoFromMap(lat, lng, address);
    }

    if (!document.getElementById("khachTab").classList.contains("hidden")) {
        addCustomerFromMap(lat, lng, address);
    }

});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(map);

// ================= TAB =================
function switchTab(e, tab) {

    document.getElementById("khoTab").classList.add("hidden");
    document.getElementById("khachTab").classList.add("hidden");
    document.getElementById("xeTab").classList.add("hidden");

    document.getElementById(tab + "Tab").classList.remove("hidden");

    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
}

// ================= ADD KHO =================
let khoCount = 0;

function addKho() {

    khoCount++;

    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
    <button onclick="removeItem(this)">🗑</button>
    <h3>Kho ${khoCount}</h3>

    <label>Vĩ độ</label>
    <input value="21.0">

    <label>Kinh độ</label>
    <input value="105.8">

    <label>Sức chứa</label>
    <input value="1000">
`;

    document.getElementById("khoList").appendChild(div);
}

// ================= THÊM KHO TỪ MAP =================
function addKhoFromMap(lat, lng, address) {

    khoCount++;

    let div = document.createElement("div");
    div.className = "card";

    // tạo marker trước
    let marker = L.marker([lat, lng], {
        icon: L.icon({ iconUrl: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" })
    }).addTo(map).bindPopup("Kho");

    // gắn marker vào div
    div.marker = marker;

    div.innerHTML = `
    <button onclick="removeItem(this)">🗑</button>
    <h3>Kho ${khoCount}</h3>

    <label>Địa chỉ</label>
    <input value="${address}">

    <label>Vĩ độ</label>
    <input value="${lat}">

    <label>Kinh độ</label>
    <input value="${lng}">

    <label>Sức chứa</label>
    <input value="1000">
    `;

    document.getElementById("khoList").appendChild(div);
}

// ================= ADD CUSTOMER =================
let customerCount = 0;

function addCustomer() {

    customerCount++;

    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
    <button onclick="removeItem(this)">🗑</button>
    <h3>Khách hàng ${customerCount}</h3>

    <label>Tên khách</label>
    <input value="KH ${customerCount}">

    <label>Vĩ độ</label>
    <input value="21.0">

    <label>Kinh độ</label>
    <input value="105.8">

    <label>Nhu cầu</label>
    <input value="10">
`;

    document.getElementById("customerList").appendChild(div);
}

// ================= THÊM KHÁCH TỪ MAP =================
function addCustomerFromMap(lat, lng, address) {

    customerCount++;

    let div = document.createElement("div");
    div.className = "card";

    let marker = L.marker([lat, lng], {
        icon: L.icon({ iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" })
    }).addTo(map).bindPopup("Khách");

    div.marker = marker;

    div.innerHTML = `
    <button onclick="removeItem(this)">🗑</button>
    <h3>Khách ${customerCount}</h3>

    <label>Tên khách</label>
    <input value="${address}">

    <label>Vĩ độ</label>
    <input value="${lat}">

    <label>Kinh độ</label>
    <input value="${lng}">

    <label>Nhu cầu</label>
    <input value="10">
    `;

    document.getElementById("customerList").appendChild(div);
}

// ================= ADD VEHICLE =================
let vehicleCount = 0;

function addVehicle() {

    vehicleCount++;

    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
    <button onclick="removeItem(this)">🗑</button>
    <h3>Xe ${vehicleCount}</h3>

    <label>Tên xe</label>
    <input value="Xe ${vehicleCount}">

    <label>Tải trọng</label>
    <input value="30">
`;

    document.getElementById("vehicleListUI").appendChild(div);
}

// ================= GET DATA =================
function getCustomers() {

    allCustomers = [];

    document.querySelectorAll("#customerList .card").forEach((c, i) => {

        let inputs = c.querySelectorAll("input");

        allCustomers.push({
            id: i + 1,
            name: inputs[0].value,
            lat: parseFloat(inputs[1].value),
            lng: parseFloat(inputs[2].value),
            demand: parseFloat(inputs[3].value)
        });
    });
}

function getVehicles() {

    vehicleList = [];

    document.querySelectorAll("#vehicleListUI .card").forEach((c, i) => {

        let inputs = c.querySelectorAll("input");

        vehicleList.push({
            id: i,
            name: inputs[0].value,
            capacity: parseFloat(inputs[1].value)
        });
    });
}

// ================= DIST =================
function dist(a, b) {
    return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

// ================= INIT =================
function init() {
    pheromone = {};

    allCustomers.forEach(i => {
        allCustomers.forEach(j => {
            pheromone[i.id + "-" + j.id] = 1;
        });
    });
}

// ================= SELECT =================
function selectNext(current, list) {

    let probs = [];
    let sum = 0;

    list.forEach(c => {
        let tau = pheromone[current.id + "-" + c.id] || 1;
        let eta = 1 / dist(current, c);

        let p = Math.pow(tau, alpha) * Math.pow(eta, beta);

        probs.push({ c, p });
        sum += p;
    });

    let r = Math.random() * sum;

    for (let o of probs) {
        r -= o.p;
        if (r <= 0) return o.c;
    }

    return probs[0].c;
}

// ================= BUILD =================
function build() {

    let routes = [];
    let unvisited = [...allCustomers];

    for (let v = 0; v < vehicleList.length; v++) {

        let Q = vehicleList[v].capacity;

        let depot = getDepot();
        if (!depot) return [];

        let route = [{ ...depot, arrival: 0, load: 0 }];
        let current = depot;
        let load = 0;
        let time = 0;

        while (unvisited.length) {

            let feasible = unvisited.filter(c => {
                return load + c.demand <= Q;
            });

            if (!feasible.length) break;

            let next = selectNext(current, feasible);

            let d = dist(current, next);
            time += d;
            load += next.demand;

            route.push({ ...next, arrival: time, load });

            current = next;
            unvisited = unvisited.filter(x => x.id !== next.id);
        }

        route.push({ ...depot, arrival: time, load });
        routes.push(route);
    }

    return routes;
}

// ================= COST =================
function cost(routes) {

    let total = 0;

    routes.forEach(r => {
        for (let i = 0; i < r.length - 1; i++) {
            total += dist(r[i], r[i + 1]);
        }
    });

    return total;
}

// ================= UPDATE =================
function update(routes, c) {

    for (let key in pheromone) {
        pheromone[key] *= (1 - rho);
    }

    routes.forEach(r => {
        for (let i = 0; i < r.length - 1; i++) {

            let key = r[i].id + "-" + r[i + 1].id;

            pheromone[key] = (pheromone[key] || 1) + 1 / c;
        }
    });
}

// ================= DRAW =================
function draw(routes) {

    // ===== CLEAR =====
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    polylines.forEach(p => map.removeLayer(p));
    polylines = [];

    const colors = ["#38bdf8", "#f97316", "#22c55e", "#eab308", "#a855f7"];

    routes.forEach((r, i) => {

        let latlngs = [];
        let seen = new Set();
        r.forEach(p => {

            latlngs.push([p.lat, p.lng]);

            let key = p.lat + "," + p.lng;
            if (seen.has(key)) return;
            seen.add(key);

            let name = p.id === 0 ? "Kho" : "KH " + p.id;

            let marker = L.marker([p.lat, p.lng], {
                icon: L.icon({
                    iconUrl: p.id === 0
                        ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                        : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                })
            })
                .addTo(map)
                .bindTooltip(name, { direction: "top" });

            markers.push(marker);
        });

        let line = L.polyline(latlngs, {
            color: colors[i % colors.length],
            weight: 4
        }).addTo(map);

        polylines.push(line);
    });
}

// ================= TABLE =================
function showTable(routes) {

    let tbody = document.getElementById("resultTable");
    tbody.innerHTML = "";

    routes.forEach((r, i) => {

        let orders = r.length - 2;
        let time = r[r.length - 1].arrival.toFixed(1);
        let load = r[r.length - 1].load;

        let pathArr = r.map(p => {
            if (p.id === 0) return "Kho";
            return "KH" + p.id;
        });

        let mid = Math.ceil(pathArr.length / 2);

        let line1 = pathArr.slice(0, mid).join(" → ");
        let line2 = pathArr.slice(mid).join(" → ");

        let pathText = line2
            ? line1 + "<br>" + line2
            : line1;

        tbody.innerHTML += `
        <tr>
            <td>Xe ${i + 1}</td>
            <td>${orders}</td>
            <td>${time}</td>
            <td>${load}</td>
            <td>${pathText}</td>
        </tr>
        `;
    });
}

// ================= STATS =================
function formatTime(t) {
    let h = Math.floor(t);
    let m = Math.round((t - h) * 60);
    return `${h}h ${m}m`;
}

function updateStats(routes) {

    let totalVehicles = routes.length;
    let totalOrders = 0;
    let totalTime = 0;

    routes.forEach(r => {
        totalOrders += r.length - 2;
        totalTime += r[r.length - 1].arrival;
    });

    document.getElementById("totalVehicles").innerText = totalVehicles;
    document.getElementById("totalOrders").innerText = totalOrders;
    document.getElementById("totalTime").innerText = formatTime(totalTime);
}

// ================= MAIN =================
async function runACO() {

    getCustomers();
    getVehicles();

    let depot = getDepot();
    if (!depot) return;
    map.setView([depot.lat, depot.lng], 12);

    if (vehicleList.length === 0) {
    alert("Chưa có xe!");
    return;}

    if (allCustomers.length === 0) {
        alert("Chưa có khách!");
        return;
    }

    alpha = parseFloat(document.getElementById("alpha").value) || 1;
    beta = parseFloat(document.getElementById("beta").value) || 2;
    rho = parseFloat(document.getElementById("rho").value) || 0.5;

    init();

    let best = null;
    let bestCost = Infinity;

    for (let i = 0; i < 30; i++) {

        let routes = build();
        let c = cost(routes);

        if (c < bestCost) {
            bestCost = c;
            best = routes;
        }

        update(routes, c);
    }

    if (!best) {
        alert("Không tìm được lời giải!");
        return;
    }

    polylines.forEach(l => map.removeLayer(l));
    polylines = [];

    draw(best);
    showTable(best);
    updateStats(best);
}

// ================= TỰ ĐỘNG TẠO KHÁCH HÀNG =================
function autoGenerateCustomers(n = 10) {

    for (let i = 0; i < n; i++) {

        let lat = 21.0 + Math.random() * 0.2;
        let lng = 105.8 + Math.random() * 0.2;

        addCustomerFromMap(
            lat.toFixed(6),
            lng.toFixed(6),
            "Khách random " + (customerCount + 1)
        );
    }
}

// ================= TỰ ĐỘNG CHIA KHO =================
function splitDepot() {

    let khoCards = document.querySelectorAll("#khoList .card");

    if (khoCards.length < 2) {
        alert("Cần ít nhất 2 kho!");
        return;
    }

    alert("Đã chia khách theo kho gần nhất (demo)");
}

// ================= TỰ ĐỘNG CHIA XE =================
function splitVehicles() {

    getCustomers();
    getVehicles();

    if (vehicleList.length === 0) {
        alert("Chưa có xe!");
        return;
    }

    let perVehicle = Math.ceil(allCustomers.length / vehicleList.length);

    alert("Mỗi xe khoảng " + perVehicle + " khách (chia đơn giản)");
}

// ================= RESET =================
function resetAll() {

    // 1. Xóa UI
    document.getElementById("khoList").innerHTML = "";
    document.getElementById("customerList").innerHTML = "";
    document.getElementById("vehicleListUI").innerHTML = "";
    document.getElementById("resultTable").innerHTML = "";

    // 2. Reset stats
    document.getElementById("totalVehicles").innerText = 0;
    document.getElementById("totalOrders").innerText = 0;
    document.getElementById("totalTime").innerText = "0h 0m";

    // 3. Reset data
    allCustomers = [];
    vehicleList = [];

    khoCount = 0;
    customerCount = 0;
    vehicleCount = 0;

    // 4. Xóa route trên map
    polylines.forEach(l => map.removeLayer(l));
    polylines = [];

    // 5. Xóa marker (giữ lại base map)
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    alert("Đã reset!");
}
function removeItem(btn) {

    let card = btn.parentElement;

    // nếu có marker → xóa map
    if (card.marker) {
        map.removeLayer(card.marker);
    }

    card.remove();
}

// ================= EXPORT =================
function exportCSV() {

    let rows = [["Xe", "Số đơn", "Thời gian", "Tải", "Route"]];

    document.querySelectorAll("#resultTable tr").forEach(tr => {
        let cols = tr.querySelectorAll("td");

        let row = [];
        cols.forEach(td => row.push(td.innerText.replace(/\n/g, " ")));

        rows.push(row);
    });

    let csv = rows.map(r => r.join(",")).join("\n");

    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "vrp_result.csv";
    a.click();
}