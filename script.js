let isEditingSupplier = false;
let editingSupplierId = null;


let suppliers = []; //
fetch('http://localhost:3000/api/suppliers')
  .then(res => res.json())
  .then(data => {
    console.log('Danh sách nhà cung cấp:', data);
    // Sau đó render ra bảng giao diện
  });
 
  
  async function fetchSuppliers() {
    const response = await fetch('http://localhost:3000/api/suppliers');
    const data = await response.json();
  
    suppliers = data; // ✅ Gán lại biến toàn cục
  
    const supplierList = document.getElementById('suppliers-body');
    supplierList.innerHTML = '';
  
    data.forEach(supplier => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${supplier.MANCC}</td>
        <td>${supplier.TENNCC}</td>
        <td>${supplier.DIACHI}</td>
        <td>${supplier.SDT}</td>
        <td>${supplier.EMAIL}</td>
        <td class="action-icons">
          <i class="fas fa-eye" onclick="showSupplierDetailModal('${supplier.MANCC}')"></i>
          <i class="fas fa-pen" onclick="showEditSupplierModal('${supplier.MANCC}')"></i>
          <i class="fas fa-trash" onclick="deleteSupplier('${supplier.MANCC}')"></i>
        </td>
      `;
      supplierList.appendChild(row);
    });
  }
  
  
window.onload = fetchSuppliers; // Gọi hàm khi trang được tải
document.addEventListener("DOMContentLoaded", fetchSuppliers);

// ===== PHẦN CHUNG: Đăng nhập, giao diện, reset mật khẩu =====

function updateUsernameDisplays() {
  const username = localStorage.getItem("savedUsername") || "người dùng"
  const displays = document.querySelectorAll("[id^='username-display']")

  displays.forEach((display) => {
    display.textContent = username
  })
}
window.addEventListener("DOMContentLoaded", () => {
  // chặn zoom bằng Ctrl + cuộn chuột
  document.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault()
      }
    },
    { passive: false },
  )

  // chặn Ctrl + + / - / =
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "-" || e.key === "=")) {
      e.preventDefault()
    }
  })

  // Initialize sidebar toggles for all sections
  initializeSidebarToggles()

  // Update username displays in all sections
  updateUsernameDisplays()

  // Set up forgot password link
  const forgotLink = document.getElementById("forgot-link")
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault()
      document.querySelector(".login-box").style.display = "none"
      document.querySelector(".reset-box").style.display = "flex"
    })
  }

  // Set up code input handling for verification
  setupCodeInputs()

  // Set up search input handling for Enter key
  setupSearchInputs()
})

function setupSearchInputs() {
  // Thiết lập xử lý phím Enter cho các ô tìm kiếm
  const searchInputs = [
    { id: "searchInput", handler: filterMaterials },
    { id: "searchSupplierInput", handler: filterSuppliers },
    { id: "searchOrderInput", handler: filterOrders },
    { id: "searchWarehouseInput", handler: filterWarehouse },
  ]

  searchInputs.forEach(({ id, handler }) => {
    const input = document.getElementById(id)
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          handler()
        }
      })
    }
  })
}

function setupCodeInputs() {
  const verifyBox = document.querySelector(".verify-box")
  if (verifyBox) {
    const inputs = verifyBox.querySelectorAll(".code-box")
    if (inputs.length > 0) {
      inputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
          const val = e.target.value
          if (!/^\d$/.test(val)) {
            e.target.value = "" // Chỉ nhận số
          } else if (index < inputs.length - 1) {
            inputs[index + 1].focus() // Tự động focus ô tiếp theo
          }
        })

        input.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight" && index < inputs.length - 1) {
            inputs[index + 1].focus()
          }
          if (e.key === "ArrowLeft" && index > 0) {
            inputs[index - 1].focus()
          }
          if (e.key === "Backspace" && !e.target.value && index > 0) {
            inputs[index - 1].focus()
          }
          if (e.key === "Enter") {
            document.querySelector(".verify-btn").click()
          }
        })
      })
    }
  }
}
function initializeSidebarToggles() {
  const toggleButtons = document.querySelectorAll(".sidebar-toggle")
  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const buttonId = this.id;
      const sectionId = this.id.replace("sidebar-toggle-", "")
      const sidebar = document.getElementById(sectionId ? `sidebar-${sectionId}` : "sidebar")
      const sidebarId = `sidebar-${sectionId}`;
      if (sidebar) {
                // Toggle class 'collapsed' trên ĐÚNG sidebar này
                sidebar.classList.toggle("collapsed");

                // Toggle icon trên ĐÚNG nút bấm này
                const icon = this.querySelector("i");
                if (icon) {
                    icon.classList.toggle("fa-bars");
                    icon.classList.toggle("fa-chevron-right");
                }

                // Xử lý cho mobile nếu cần (toggle class 'active' để hiện/ẩn overlay)
                if (window.innerWidth <= 768) {
                    sidebar.classList.toggle("active");
                }
            } else {
                console.error(`Sidebar với ID "${sidebarId}" không tìm thấy cho nút "${buttonId}"`);
            }
        });
  })
  // ✅ Đặt autoCollapseSidebar bên trong initializeSidebarToggles
  function autoCollapseSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
  
    if (window.innerWidth < 768) {
      sidebar.classList.add("collapsed");
    } else {
      sidebar.classList.remove("collapsed");
    }
  }
  

  // Gọi ngay khi khởi động
  autoCollapseSidebar()

  // Gọi khi resize

window.addEventListener("resize", autoCollapseSidebar)
autoCollapseSidebar() // Gọi lần đầu khi tải trang

}


function login() {
  const username = document.getElementById("username").value.trim()
  const password = document.getElementById("password").value.trim()
  const remember = document.getElementById("remember").checked
  const errorDiv = document.getElementById("login-error")

  // Kiểm tra nếu thiếu tên hoặc mật khẩu
  if (!username || !password) {
    errorDiv.textContent = "Vui lòng nhập tên đăng nhập và mật khẩu!"
    errorDiv.style.display = "block"
    return
  }
  // Kiểm tra tài khoản
  if (username === "admin" && password === "123456") {
    localStorage.setItem("savedUsername", username) // ✅ lưu lại tên
    if (remember) {
      localStorage.setItem("savedPassword", password)
    } else {
      localStorage.removeItem("savedPassword")
    }
    navigateTo("home")
  
    console.log("Login successful, sidebar should show");
  } else {
    errorDiv.innerText = "Sai tên đăng nhập hoặc mật khẩu!"
    errorDiv.style.display = "block"
  }
}


function backToLogin() {
  // Ẩn các box còn lại
  document.querySelector(".reset-box").style.display = "none";
  document.querySelector(".verify-box").style.display = "none";

  // Hiện lại box đăng nhập
  const loginBox = document.querySelector(".login-box");
  loginBox.style.display = "flex";

  // Reset lại nội dung và vị trí input
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";

  document.getElementById("reset-email").value = "";
  document.getElementById("reset-feedback").style.display = "none";
  document.getElementById("reset-error").style.display = "none"

  // Cố định lại vị trí nếu cần (nếu layout bị lệch)
  loginBox.style.top = "55%";
  loginBox.style.right = "8%";
  loginBox.style.transform = "translateY(-50%)";
  document.getElementById('username').value = '';
document.getElementById('password').value = '';
const errorMessage = document.querySelector('.error-message');
if (errorMessage) errorMessage.remove();

}
function sendReset() {
  const email = document.getElementById("reset-email").value.trim()
  const feedback = document.getElementById("reset-error")

  if (!email) {
    feedback.innerText = "Vui lòng nhập email!"
    feedback.style.display = "block"
    return
  }

  feedback.style.display = "none"

  // 👉 Gán mã xác thực giả định
  const code = "123456"
  localStorage.setItem("verificationCode", code) // Lưu vào localStorage

  // Chuyển sang giao diện xác nhận
  document.querySelector(".reset-box").style.display = "none"
  document.querySelector(".verify-box").style.display = "flex"

  const desc = document.getElementById("verify-desc")
  desc.innerHTML = `Một mã xác nhận đã được gửi đến địa chỉ email <strong style="color:#00e1ff">${email}</strong>. Vui lòng nhập mã vào ô bên dưới.`

  // Focus vào ô đầu tiên
  setTimeout(() => {
    const inputs = document.querySelectorAll(".code-box")
    if (inputs.length > 0) {
      inputs[0].focus()
    }
  }, 100)
}

function backToReset() {
  document.querySelector(".verify-box").style.display = "none"
  document.querySelector(".reset-box").style.display = "flex"
}

function verifyCode() {
  const code = Array.from(document.querySelectorAll(".code-box"))
    .map((input) => input.value)
    .join("")
  if (code === "123456") {
    document.querySelector(".verify-box").style.display = "none"
    document.querySelector(".newpass-box").style.display = "flex" // hiện bảng mới
  } else {
    alert("Mã xác nhận không đúng!")
  }
}

function submitNewPassword() {
  const newPass = document.getElementById("new-password").value.trim()
  const confirmPass = document.getElementById("confirm-password").value.trim()

  if (!newPass || !confirmPass) {
    alert("Vui lòng nhập đầy đủ mật khẩu!")
    return
  }

  if (newPass !== confirmPass) {
    alert("Mật khẩu xác nhận không khớp!")
    return
  }

  // ✅ Lưu mật khẩu nếu muốn (tuỳ chọn)
  localStorage.setItem("savedPassword", newPass) // hoặc lưu vào session/local

  document.querySelector(".newpass-box").style.display = "none"
  document.querySelector(".login-box").style.display = "flex"

  // ✅ Đặt đoạn này ở đây
  const errorDiv = document.getElementById("login-error")
  if (errorDiv) errorDiv.style.display = "none"

  alert("Mật khẩu đã được cập nhật thành công!")
  // Focus lại vào ô tên đăng nhập
  document.getElementById("username").focus()
}

function logout() {
  localStorage.removeItem("savedUsername")
  localStorage.removeItem("savedPassword")
  navigateTo("login")
}
/*document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;
  const menuLinks = document.querySelectorAll(".sidebar ul li a");

  menuLinks.forEach(link => {
    if (link.href.includes(currentPath)) {
      link.classList.add("active");
    }
  });
});*/
// ===== PHẦN VẬT TƯ: Quản lý vật tư =====

// --- materials page ---
let currentEditingIndex = null; // Chỉ số của vật tư đang chỉnh sửa

const API_MATERIAL = "http://localhost:3000/api/material"
async function fetchMaterials() {
  const res = await fetch(API_MATERIAL)
  const data = await res.json()
  console.log("Dữ liệu vật tư:", data)  // Debugging: Kiểm tra dữ liệu
  material = data; 
  const tbody = document.getElementById('materials-body')
  tbody.innerHTML = ''  // Clear previous rows
  data.forEach((item) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${item.MAVT}</td>
      <td>${item.TENVT}</td>
      <td>${item.DONVI}</td>
      <td>${item.DONGIA}</td>
      <td class="action-icons">
        <i class="fas fa-eye" onclick="showMaterialDetail('${item.MAVT}')"></i>
        <i class="fas fa-pen" onclick="showEditModal('${item.MAVT}')"></i>
        <i class="fas fa-trash" onclick="deleteMaterial('${item.MAVT}')"></i>
      </td>
    `
    tbody.appendChild(tr)
  })
  populateMaterialSelect(); // ✅ gọi ở đây
}
document.addEventListener("DOMContentLoaded", () => {
  fetchMaterials();
});
async function showMaterialDetail(mavt) {
  const mat = material.find(m => m.MAVT === mavt);
  if (!mat) return alert("Không tìm thấy vật tư!");

  document.getElementById("modal-title").textContent = "Chi tiết vật tư";

  await populateSupplierAndWarehouseSelect(mat.MANCC, mat.MAKH);

  document.getElementById("MAVT").value = mat.MAVT;
  document.getElementById("TENVT").value = mat.TENVT;
  document.getElementById("MOTA").value = mat.MOTA;
  document.getElementById("DONVI").value = mat.DONVI;
  document.getElementById("DONGIA").value = mat.DONGIA;
  document.getElementById("MANCC").value = mat.MANCC;
  document.getElementById("MAKH").value = mat.MAKH;

  // Khóa input
  document.querySelectorAll('#modal input, #modal select').forEach(el => el.setAttribute('disabled', true));

  // Ẩn nút lưu
  document.getElementById("save-btn").style.display = "none";

  document.getElementById("modal").style.display = "block";
}


async function showEditModal(mavt) {
  const mat = material.find(m => m.MAVT === mavt);
  if (!mat) return alert("Không tìm thấy vật tư!");

  document.getElementById("modal-title").textContent = "Chỉnh sửa vật tư";

  await populateSupplierAndWarehouseSelect(mat.MANCC, mat.MAKH);

  document.getElementById("MAVT").value = mat.MAVT;
  document.getElementById("TENVT").value = mat.TENVT;
  document.getElementById("MOTA").value = mat.MOTA;
  document.getElementById("DONVI").value = mat.DONVI;
  document.getElementById("DONGIA").value = mat.DONGIA;
  document.getElementById("MANCC").value = mat.MANCC;
  document.getElementById("MAKH").value = mat.MAKH;

  // Mở khóa để sửa
  document.querySelectorAll('#modal input, #modal select').forEach(el => el.removeAttribute('disabled'));
  document.getElementById("MAVT").setAttribute("readonly", true); // Không sửa mã

  // Hiện nút lưu
  document.getElementById("save-btn").style.display = "inline-block";

  document.getElementById("modal").style.display = "block";
}




function closeDetailModal() {
  document.getElementById('detail-modal').style.display = 'none';
}
function renderMaterials() {
  const tbody = document.querySelector("#materials-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";  // Xóa bảng hiện tại

  material.forEach((material) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${material.MAVT}</td>
      <td>${material.TENVT}</td>
      <td>${material.DONVI}</td>
      <td>${material.DONGIA}</td>
      <td>
        <button onclick="showEditModal('${material.MAVT}')">✏️</button>
        <button onclick="deleteMaterial('${material.MAVT}')">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteMaterial(mavt) {
  if (!confirm(`Bạn có chắc chắn muốn xóa vật tư ${mavt}?`)) return;

  try {
   const res = await fetch(`http://localhost:3000/api/material/${mavt}`, { method: "DELETE" });
if (!res.ok) throw new Error("Lỗi khi xóa vật tư");

    // Xóa khỏi local array
    const index = material.findIndex(m => m.MAVT === mavt);
    if (index !== -1) material.splice(index, 1);

    // Xóa dòng tương ứng trên DOM
    const rows = document.querySelectorAll("#materials-table tbody tr");
    for (let row of rows) {
      if (row.children[0].textContent === mavt) {
        row.remove();
        break;
      }
    }
  } catch (err) {
    console.error("❌ Lỗi khi xóa vật tư:", err);
    alert("Xóa vật tư thất bại.");
  }
}


function showAddModal() {
  document.getElementById("modal-title").textContent = "Thêm vật tư"
  document.getElementById("MAVT").value = ""
  document.getElementById("MOTA").value = ""
  document.getElementById("DONVI").value = ""
  document.getElementById("DONGIA").value = ""
  document.getElementById("MAVT").readOnly = false
  editingIndex = null
  document.getElementById("modal").style.display = "block"
  populateSupplierAndWarehouseSelect()

}


// Kiểm tra sự tồn tại của MAVT
function isMaterialExist(mavt) {
  return material.some(material => material.MAVT === mavt);
}
function updateMaterialRow(mat) {
  const rows = document.querySelectorAll("#materials-table tbody tr");
  for (let row of rows) {
    if (row.children[0].textContent === mat.MAVT) {
      row.children[1].textContent = mat.TENVT;
      row.children[2].textContent = mat.DONVI;
      row.children[3].textContent = mat.DONGIA;
      break;
    }
  }
}

async function saveMaterial() {
  const mavt = document.getElementById("MAVT").value.trim();
  const tenvt = document.getElementById("TENVT").value.trim();
  const mota = document.getElementById("MOTA").value.trim();
  const donvi = document.getElementById("DONVI").value.trim();
  const dongia = parseFloat(document.getElementById("DONGIA").value);
  const mancc = document.getElementById("MANCC").value;
  const makh = document.getElementById("MAKH").value;

  if (!mavt || !tenvt || !donvi || isNaN(dongia)) {
    alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
    return;
  }

  const payload = {
    MAVT: mavt,
    TENVT: tenvt,
    MOTA: mota,
    DONVI: donvi,
    DONGIA: dongia,
    MANCC: mancc,
    MAKH: makh,
  };

  try {
    let method = "POST";
    let url = "http://localhost:3000/api/material";

    if (isMaterialExist(mavt)) {
      method = "PUT";
      url = `http://localhost:3000/api/material/${mavt}`;
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const message = await res.text();
    alert(message);

    await fetchMaterials(); // load lại bảng vật tư
    closeModal();           // đóng modal
  } catch (err) {
    console.error("❌ Lỗi khi lưu vật tư:", err);
    alert("Không thể lưu vật tư. Vui lòng kiểm tra lại!");
  }
}



async function populateSupplierAndWarehouseSelect(selectedNCC = "", selectedKH = "") {
  const supplierSelect = document.getElementById("MANCC");
  const warehouseSelect = document.getElementById("MAKH");

  const resSup = await fetch("http://localhost:3000/api/suppliers");
  const suppliers = await resSup.json();
  supplierSelect.innerHTML = '<option value="">-- Chọn nhà cung cấp --</option>';
  suppliers.forEach(s => {
    supplierSelect.innerHTML += `<option value="${s.MANCC}" ${s.MANCC === selectedNCC ? "selected" : ""}>${s.MANCC} - ${s.TENNCC}</option>`;
  });

  const resKho = await fetch("http://localhost:3000/api/warehouse");
  const warehouses = await resKho.json();
  warehouseSelect.innerHTML = '<option value="">-- Chọn kho hàng --</option>';
  warehouses.forEach(k => {
    warehouseSelect.innerHTML += `<option value="${k.MAKH}" ${k.MAKH === selectedKH ? "selected" : ""}>${k.MAKH} - ${k.VITRI}</option>`;
  });
}





function closeModal() {
  document.getElementById("modal").style.display = "none"
}

function renderTable() {
  material = data; // ← 
  const tbody = document.getElementById('materials-body');
  tbody.innerHTML = '';
  data.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.MAVT}</td>
      <td>${item.TENVT}</td>
      <td>${item.DONVI}</td>
      <td>${item.DONGIA}</td>
      <td class="action-icons">
        <i class="fas fa-eye" onclick="showMaterialDetail('${item.MAVT}')"></i>
        <i class="fas fa-pen" onclick="showEditModal('${item.MAVT}')"></i>
        <i class="fas fa-trash" onclick="deleteMaterial('${item.MAVT}')"></i>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterMaterials() {
  const keyword = document.getElementById("searchInput").value.toLowerCase()
  const rows = document.querySelectorAll("#materials-body tr")

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase()
    row.style.display = text.includes(keyword) ? "" : "none"
  })
}

function formatCurrency(number) {
  return Number.parseInt(number).toLocaleString("vi-VN") + "đ"
}
function closeEditModal() {
  document.getElementById("edit-modal").style.display = "none";
}
function closeDetailModal() {
  document.getElementById("detail-modal").style.display = "none";
}

// ===== PHẦN ĐƠN HÀNG: Quản lý đơn hàng =====
// Dữ liệu mẫu cho đơn hàng
let orders = [];

let editingOrderId = null;
editingOrderId = MADH;

let selectedMaterial = [];

const API_URL = "http://localhost:3000/api/order"
// Lấy danh sách đơn hàng từ backend
async function fetchOrders() {
  try {
    const res = await fetch(API_URL)
    const data = await res.json()
    orders = data
    renderOrders()
  } catch (err) {
    console.error("Lỗi khi lấy đơn hàng:", err)
  }
}


function showAddOrderModal() {
  document.getElementById("modal-order-title").textContent = "Thêm đơn hàng"
  document.getElementById("MADH").value = ""
  document.getElementById("NGAYDAT").value = ""
  document.getElementById("TRANGTHAIDH").value = "Đang xử lý"
  document.getElementById("TONGTIEN").value = 0
  editingOrderId = null
  document.getElementById("modal-order").style.display = "block"
}
async function showEditOrderModal(index) {
  const MADH = orders[index].MADH; // ✅ FIX
  console.log("🟡 Mã đơn hàng đang gọi API:",MADH); // 🐞 DEBUG
  try {
    const res = await fetch(`http://localhost:3000/api/order/detail/${MADH}`);
    const order = await res.json();

    document.getElementById("modal-order-title").textContent = "Sửa đơn hàng";
    document.getElementById("MADH").value = order.MADH;
    document.getElementById("NGAYDAT").value = order.NGAYDAT?.slice(0, 10);
    document.getElementById("TRANGTHAIDH").value = order.TRANGTHAIDH;
    document.getElementById("TONGTIEN").value = order.TONGTIEN;

    editingOrderId = order.MADH;
    selectedMaterial = order.items.map(item => ({
      materialCode: item.materialCode,
      quantity: item.quantity,
      price: item.price
    }));

renderSelectedMaterials();
calculateTotalPrice();
    document.getElementById("modal-order").style.display = "block";
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", err);
    alert("Không thể tải dữ liệu chi tiết.");
  }
}



function renderOrders() {
  const body = document.getElementById("orders-body");
  body.innerHTML = "";

  orders.forEach((order, index) => {
    const row = `
      <tr>
        <td>${order.MADH}</td>
        <td>${order.NGAYDAT?.slice(0, 10)}</td>
        <td>${order.TRANGTHAIDH}</td>
        <td>${formatCurrency(order.TONGTIEN)}</td>
        <td class="action-icons">
        <i class="fas fa-eye" onclick="showOrderHistory(${index})" title="Xem chi tiết"></i>
        <i class="fas fa-pen" onclick="showEditOrderModal(${index})" title="Chỉnh sửa"></i>
        <i class="fas fa-trash" onclick="deleteOrder('${order.MADH}')" title="Xoá"></i>
      </td>

      </tr>
    `
    body.innerHTML += row
  });
}

function renderVatTuTable(vatTuList) {
  const tableBody = document.querySelector('#vattu-table tbody');
  tableBody.innerHTML = ''; // clear bảng cũ

  if (!vatTuList || vatTuList.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">Không có vật tư nào.</td></tr>';
    return;
  }

  vatTuList.forEach(vt => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${vt.tenVatTu}</td>
      <td>${vt.donVi}</td>
      <td>${vt.soLuong}</td>
      <td>${vt.ghiChu || ''}</td>
    `;
    tableBody.appendChild(row);
  });
}
function showOrderDetail(data) {
  document.getElementById('order-detail-modal').style.display = 'flex';

  // Hiển thị các thông tin cơ bản khác nếu cần...

  // Render danh sách vật tư đã chọn
  renderVatTuTable(data.vatTuList); // Mảng vật tư của đơn hàng
}

async function showOrderHistory(index) {
  const orderId = orders[index]?.MADH;
  if (!orderId) return alert("Không tìm thấy đơn hàng!");

  try {
    const res = await fetch(`http://localhost:3000/api/order/detail/${orderId}`); // ✅ gọi API mới
    const order = await res.json();

    createOrderDetailModal(); // tạo modal nếu chưa có

    let totalAmount = 0;
    let itemsHtml = "";

    const items = order.items || [];

    items.forEach((item) => {
      const matchedMaterial = material?.find((m) => m.MAVT === item.materialCode); // ✅ Đổi tên
      const materialName = matchedMaterial ? matchedMaterial.TENVT : "Không xác định";
      const subtotal = item.quantity * item.price;
      totalAmount += subtotal;

      itemsHtml += `
        <tr>
          <td>${item.materialCode}</td>
          <td>${materialName}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.price)}</td>
          <td>${formatCurrency(subtotal)}</td>
        </tr>
      `;
    });

    const modalBody = document.getElementById("order-detail-modal-body");
    modalBody.innerHTML = `
      <p><strong>Mã đơn hàng:</strong> ${order.MADH}</p>
      <p><strong>Ngày đặt:</strong> ${order.NGAYDAT?.slice(0, 10)}</p>
      <p><strong>Trạng thái:</strong> ${order.TRANGTHAIDH}</p>
      <p><strong>Tổng tiền:</strong> ${formatCurrency(order.TONGTIEN)}</p>

      <h4 style="margin-top: 10px;">Danh sách vật tư:</h4>
      <div style="overflow-x: auto;">
        <table class="selected-materials-table">
          <thead>
            <tr>
              <th>Mã vật tư</th>
              <th>Tên vật tư</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right; font-weight: bold;">Tổng cộng:</td>
              <td style="font-weight: bold;">${formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    document.getElementById("order-detail-modal").style.display = "flex";
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", err);
    alert("Không thể tải dữ liệu đơn hàng.");
  }
}


function createOrderDetailModal() {
  const modal = document.getElementById("order-detail-modal");

  // Nếu modal đã có nhưng thiếu phần body => thêm body vào
  if (modal && !document.getElementById("order-detail-modal-body")) {
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 800px;">
        <div class="detail-modal-header">
          <h3 class="detail-modal-title">Chi tiết đơn hàng</h3>
          <button class="detail-modal-close" onclick="closeOrderDetailModal()">×</button>
        </div>
        <div class="detail-modal-body" id="order-detail-modal-body">
          <!-- Nội dung sẽ được thêm vào động -->
        </div>
        <div class="detail-modal-footer" style="text-align: right; margin-top: 20px;">
          <button onclick="printOrderDetail()">In đơn hàng</button>
          <button onclick="closeOrderDetailModal()">Đóng</button>
        </div>
      </div>
    `;
    return;
  }

  // Nếu modal chưa tồn tại thì tạo mới hoàn toàn
  if (!modal) {
    const newModal = document.createElement("div");
    newModal.id = "order-detail-modal";
    newModal.className = "modal";
    newModal.style.display = "none";
    document.body.appendChild(newModal);
    createOrderDetailModal(); // gọi lại để render nội dung
  }
}


function closeOrderDetailModal() {
  const modal = document.getElementById("order-detail-modal")
  if (modal) {
    modal.style.display = "none"
  }
}

function printOrderDetail() {
  alert("Đang in đơn hàng...")
}
function calculateTotalPrice() {
  let total = 0;
  for (let item of selectedMaterial) {
    if (!isNaN(item.quantity) && !isNaN(item.price)) {
      total += item.quantity * item.price;
    }
    ;
  }

  // Nếu có ô input tổng tiền:
  const totalInput = document.getElementById("TONGTIEN");
  if (totalInput) {
    totalInput.value = total.toFixed(2);
  }

  // Nếu hiển thị tổng tiền ở một chỗ khác (ví dụ trong bảng):
  const totalText = document.getElementById("displayTotal");
  if (totalText) {
    totalText.innerText = total.toLocaleString() + " đ";
  }
}

function addMaterialToOrder() {
  const materialSelect = document.getElementById("order-material");
  const quantityInput = document.getElementById("order-quantity");

  const materialCode = materialSelect.value;
  const quantity = Number.parseInt(quantityInput.value);

  if (!materialCode || !quantity || quantity <= 0) {
    alert("Vui lòng chọn vật tư và nhập số lượng hợp lệ");
    return;
  }

  const mat = material.find((m) => m.MAVT === materialCode); // ✅ Fix
  if (!mat) {
    alert("Vật tư không tồn tại");
    return;
  }

  const existingIndex = selectedMaterial.findIndex((item) => item.materialCode === materialCode);
  if (existingIndex >= 0) {
    selectedMaterial[existingIndex].quantity += quantity;
  } else {
    selectedMaterial.push({
      materialCode,
      quantity,
      price: mat.DONGIA,
    });
    renderSelectedMaterials(); // ✅ Hiển thị lại danh sách
    calculateTotalPrice();     // ✅ Tính lại tổng tiền
  }

  renderSelectedMaterials();

  quantityInput.value = "1";
}

function removeMaterialFromOrder(index) {
  selectedMaterial.splice(index, 1);
  renderSelectedMaterials();   // ✅ cập nhật hiển thị
  calculateTotalPrice();       // ✅ cập nhật tổng tiền
}
function updateQuantity(index, newValue) {
  selectedMaterial[index].quantity = parseInt(newValue) || 0;
  calculateTotalPrice(); // Tính lại tổng tiền ngay
}



function renderSelectedMaterials() {
  const container = document.getElementById("selected-materials")
  if (!container) return

  if (selectedMaterial.length === 0) {
    container.innerHTML = "<p>Chưa có vật tư nào được chọn</p>"
    return
  }

  let totalAmount = 0
  let html = `
    <table class="selected-materials-table">
      <thead>
        <tr>
          <th>Mã vật tư</th>
          <th>Tên vật tư</th>
          <th>Số lượng</th>
          <th>Đơn giá</th>
          <th>Thành tiền</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
  `

  selectedMaterial.forEach((item, index) => {
    const mat = material.find((m) => m.MAVT === item.materialCode);
const materialName = mat ? mat.TENVT : "Không xác định";
const subtotal = item.quantity * item.price
    totalAmount += subtotal

    html += `
      <tr>
        <td>${item.materialCode}</td>
        <td>${materialName}</td>
        <td><input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)"></td>

        <td>${formatCurrency(item.price)}</td>
        <td>${formatCurrency(subtotal)}</td>
        <td><button class="remove-btn" onclick="removeMaterialFromOrder(${index})"><i class="fas fa-times"></i></button></td>
      </tr>
    `
  })

  html += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" style="text-align: right; font-weight: bold;">Tổng tiền:</td>
          <td colspan="2" style="font-weight: bold;">${formatCurrency(totalAmount)}</td>
        </tr>
      </tfoot>
    </table>
  `

  container.innerHTML = html
}

// Lưu đơn hàng (thêm hoặc cập nhật)
async function saveOrder() {
  const MADH = document.getElementById("MADH").value
  const NGAYDAT = document.getElementById("NGAYDAT").value
  const TRANGTHAIDH = document.getElementById("TRANGTHAIDH").value
  const TONGTIEN = parseFloat(document.getElementById("TONGTIEN").value)
 const payload = {
    MADH,
    NGAYDAT,
    TRANGTHAIDH,
    TONGTIEN,
    items: selectedMaterial, // ✅ gửi mảng vật tư đi
  };
  if (!MADH || !NGAYDAT || !TRANGTHAIDH || isNaN(TONGTIEN)) {
    alert("Vui lòng điền đầy đủ thông tin.")
    return
  }
  const method = editingOrderId ? "PUT" : "POST";
  const url = editingOrderId
    ? `http://localhost:3000/api/order/${editingOrderId}`
    : `http://localhost:3000/api/order`;
    console.log("🧾 selectedMaterial gửi đi:", selectedMaterial);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());

      alert("Đơn hàng đã được lưu!");
    closeOrderModal()
    fetchOrders()
    calculateTotalPrice()
  } catch (err) {
    console.error("Lỗi khi lưu đơn hàng:", err)
  }
  const tongTienInput = document.getElementById("TONGTIEN");

}

// Xoá đơn hàng
async function deleteOrder(id) {
  if (!confirm("Bạn có chắc muốn xoá đơn hàng này?")) return
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" })
    fetchOrders()
  } catch (err) {
    console.error("Lỗi khi xoá đơn hàng:", err)
  }
}

// Đóng modal
function closeOrderModal() {
  document.getElementById("modal-order").style.display = "none"
}


function filterOrders() {
  const keyword = document.getElementById("searchOrderInput").value.toLowerCase()
  const rows = document.querySelectorAll("#orders-body tr")
  rows.forEach(row => {
    const text = row.textContent.toLowerCase()
    row.style.display = text.includes(keyword) ? "" : "none"
  })
}
// Định dạng tiền tệ
function formatCurrency(amount) {
  return Number(amount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
}

// Gọi lúc tải trang
fetchOrders()
// Xử lý click trên các ô chức năng (cards) ở trang home
document.addEventListener("DOMContentLoaded", () => {
  const cardMaterials = document.getElementById("card-materials")
  const cardSuppliers = document.getElementById("card-suppliers")
  const cardOrders = document.getElementById("card-orders")
  const cardWarehouse = document.getElementById("card-warehouse")
  const cardReport = document.getElementById("card-report")

  if (cardMaterials) cardMaterials.addEventListener("click", () => navigateTo("materials"))
  if (cardSuppliers) cardSuppliers.addEventListener("click", () => navigateTo("suppliers"))
  if (cardOrders) cardOrders.addEventListener("click", () => navigateTo("orders"))
  if (cardWarehouse) cardWarehouse.addEventListener("click", () => navigateTo("warehouse"))
  if (cardReport) cardReport.addEventListener("click", () => navigateTo("report"))


  // 🔄 Tự động điền nếu đã lưu
  const savedUsername = localStorage.getItem("savedUsername")
  const savedPassword = localStorage.getItem("savedPassword")
  if (savedUsername && savedPassword) {
    document.getElementById("username").value = savedUsername
    document.getElementById("password").value = savedPassword
    document.getElementById("remember").checked = true
  }

  // Set up new password form events
  const newPass = document.getElementById("new-password")
  const confirmPass = document.getElementById("confirm-password")
  if (newPass && confirmPass) {
    ;[newPass, confirmPass].forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          submitNewPassword() // Tự động xác nhận
        }
      })
    })
  }

  const isLoggedIn = sessionStorage.getItem("loggedIn") === "true"

  if (isLoggedIn) {
    navigateTo("home")
  } else {
    navigateTo("login") // hoặc để nguyên, đừng gọi navigateTo vội
  }

  // Khởi tạo danh sách vật tư cho form đơn hàng
  populateMaterialSelect()
})

function populateMaterialSelect() {
  const materialSelect = document.getElementById("order-material");
  if (!materialSelect) return;

  materialSelect.innerHTML = '<option value="">-- Chọn vật tư --</option>';

  material.forEach((mat) => {
    materialSelect.innerHTML += `
      <option value="${mat.MAVT}">${mat.MAVT} - ${mat.TENVT}</option>
    `;
  });
}


// ===== QUẢN LÝ NHÀ CUNG CẤP =====
// --- suppliers page ---

let editingSupplierIndex = null

function showAddSupplierModal() {
  isEditingSupplier = false;
  editingSupplierId = null;

  document.getElementById("modal-sup-title").textContent = "Thêm nhà cung cấp";
  document.getElementById("MANCC").value = "";
  document.getElementById("TENNCC").value = "";
  document.getElementById("DIACHI").value = "";
  document.getElementById("SDT").value = "";
  document.getElementById("EMAIL").value = "";

  ["MANCC", "TENNCC", "DIACHI", "SDT", "EMAIL"].forEach(id => {
    document.getElementById(id).readOnly = false;
  });

  document.querySelector("#modal-supplier .modal-footer button:first-child").style.display = "inline-block";

  document.getElementById("modal-supplier").style.display = "block";

  // Tạo div có class "function-bar1"
  const functionBar = document.createElement("div");
  functionBar.classList.add("function-bar");

  // Bạn có thể chỉ định thêm các nội dung hoặc nút vào functionBar nếu cần
  functionBar.innerHTML = `
    <button class="btn-primary" onclick="showAddSupplierModal()">Thêm nhà cung cấp</button>
    <button class="btn-secondary" onclick="closeSupplierModal()">Đóng</button>
  `;

  // Chèn function bar vào modal-body, nếu function-bar chưa có
  const modalContent = document.querySelector("#modal-supplier .modal-content");
  if (!document.querySelector(".function-bar")) {
    modalContent.insertBefore(functionBar, modalContentfirstChild); // Chèn ở đầu modal-body
  }
}

function showEditSupplierModal(maNCC) {
  const supplier = suppliers.find(s => s.MANCC === maNCC);
  if (!supplier) return alert("Không tìm thấy!");

  isEditingSupplier = true;
  editingSupplierId = maNCC;

  document.getElementById("modal-sup-title").textContent = "Chỉnh sửa nhà cung cấp";
  document.getElementById("MANCC").value = supplier.MANCC;
  document.getElementById("TENNCC").value = supplier.TENNCC;
  document.getElementById("DIACHI").value = supplier.DIACHI;
  document.getElementById("SDT").value = supplier.SDT;
  document.getElementById("EMAIL").value = supplier.EMAIL;

  document.getElementById("MANCC").readOnly = true;

  document.querySelector("#modal-supplier .modal-footer button:first-child").style.display = "inline-block";

  document.getElementById("modal-supplier").style.display = "block";
}

function saveSupplier() {
  const mancc = document.getElementById("MANCC").value.trim();
  const tenncc = document.getElementById("TENNCC").value.trim();
  const diachi = document.getElementById("DIACHI").value.trim();
  const sdt = document.getElementById("SDT").value.trim();
  const email = document.getElementById("EMAIL").value.trim();
  console.log("MANCC:", mancc);
  console.log("TENNCC:", tenncc);
  console.log("DIACHI:", diachi);
  console.log("SDT:", sdt);
  console.log("EMAIL:", email);
  
  if (!mancc || !tenncc || !diachi || !sdt || !email) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  const supplierData = {
    MaNCC: mancc,
    TenNCC: tenncc,
    DiaChi: diachi,
    SDT: sdt,
    Email: email
  };

  if (isEditingSupplier && editingSupplierId) {
    // ✅ Gọi PUT để cập nhật
    fetch(`http://localhost:3000/api/suppliers/${editingSupplierId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplierData)
    })
      .then(res => {
        if (!res.ok) return res.text().then(text => { throw new Error(text); });
        alert("Cập nhật thành công!");
        closeSupplierModal();
        fetchSuppliers();
      })
      .catch(err => {
        alert("Lỗi cập nhật: " + err.message);
      });
  } else {
    // ✅ Gọi POST để thêm mới
    fetch("http://localhost:3000/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplierData)
    })
      .then(res => {
        if (!res.ok) return res.text().then(text => { throw new Error(text); });
        alert("Đã thêm nhà cung cấp!");
       
        closeSupplierModal();
        fetchSuppliers();
      })
      .catch(err => {
        alert("Lỗi thêm nhà cung cấp: " + err.message);
      });
  }
}

async function deleteSupplier(maNCC) {
  if (confirm("Bạn có chắc chắn muốn xóa?")) {
    try {
      const response = await fetch(`http://localhost:3000/api/suppliers/${maNCC}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Đã xóa nhà cung cấp");
        fetchSuppliers(); // Gọi lại hàm để tải lại danh sách nhà cung cấp
      } else {
        alert("Không thể xóa nhà cung cấp");
      }
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Đã xảy ra lỗi khi xóa");
    }
  }
}


function closeSupplierModal() {
  document.getElementById("modal-supplier").style.display = "none";

  ["MANCC", "TENNCC", "DIACHI", "SDT", "EMAIL"].forEach(id => {
    document.getElementById(id).readOnly = false;
    document.getElementById(id).value = "";
  });

  document.querySelector("#modal-supplier .modal-footer button:first-child").style.display = "inline-block";

  isEditingSupplier = false;
  editingSupplierId = null;
}

function renderSuppliers() {
  const supplierList = document.getElementById("suppliers-body");
  supplierList.innerHTML = ""; // xóa nội dung cũ

  suppliers.forEach((supplier) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${supplier.MANCC}</td>
      <td>${supplier.TENNCC}</td>
      <td>${supplier.DIACHI}</td>
      <td>${supplier.SDT}</td>
      <td>${supplier.EMAIL}</td>
      <td class="action-icons">
        <i class="fas fa-eye" onclick="showSupplierDetailModal('${supplier.MANCC}')"></i>
        <i class="fas fa-pen" onclick="showEditSupplierModal('${supplier.MANCC}')"></i>
        <i class="fas fa-trash" onclick="deleteSupplier('${supplier.MANCC}')"></i>
      </td>
    `;
    supplierList.appendChild(row);
  });
}


function filterSuppliers() {
  const keyword = document.getElementById("searchSupplierInput").value.toLowerCase();
  const rows = document.querySelectorAll("#suppliers-body tr");

  rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(keyword) ? "" : "none"; // Lọc hàng
  });
}

function createSupplierDetailModal() {
  // Kiểm tra nếu modal đã tồn tại
  if (document.getElementById("supplier-detail-modal")) {
      return;
  }

  const modal = document.createElement("div");
  modal.id = "supplier-detail-modal";
  modal.className = "detail-modal";
  modal.innerHTML = `
      <div class="detail-modal-content">
          <div class="detail-modal-header">
              <h3 class="detail-modal-title">Chi tiết nhà cung cấp</h3>
              <button class="detail-modal-close" onclick="closeSupplierDetailModal()">&times;</button>
          </div>
          <div class="detail-modal-body" id="supplier-detail-modal-body">
              <!-- Nội dung sẽ được thêm vào động -->
          </div>
          <div class="detail-modal-footer">
              <button class="btn-secondary" onclick="closeSupplierDetailModal()">Đóng</button>
          </div>
      </div>
  `;
  document.body.appendChild(modal);
}

function showSupplierDetailModal(maNCC) {
  const supplier = suppliers.find(s => s.MANCC === maNCC);
  if (!supplier) return alert("Không tìm thấy!");

  isEditingSupplier = false;
  editingSupplierId = null;

  document.getElementById("modal-sup-title").textContent = "Chi tiết nhà cung cấp";
  document.getElementById("MANCC").value = supplier.MANCC;
  document.getElementById("TENNCC").value = supplier.TENNCC;
  document.getElementById("DIACHI").value = supplier.DIACHI;
  document.getElementById("SDT").value = supplier.SDT;
  document.getElementById("EMAIL").value = supplier.EMAIL;

  ["MANCC", "TENNCC", "DIACHI", "SDT", "EMAIL"].forEach(id => {
    document.getElementById(id).readOnly = true;
  });

  // Ẩn nút Lưu
  document.querySelector("#modal-supplier .modal-footer button:first-child").style.display = "none";

  document.getElementById("modal-supplier").style.display = "block";
}



function closeSupplierDetailModal() {
  const modal = document.getElementById("supplier-detail-modal");
  if (modal) modal.remove();
}

// ===== QUẢN LÝ KHO HÀNG =====//
// --- warehouse page ---

let editingIndex = null; // Biến để xác định đang ở chế độ chỉnh sửa
editingIndex = MAKH;
let warehouse = [];
let material = [];
const baseURL = 'http://localhost:3000/api/warehouse';
async function fetchWarehouse() {
  try {
    const res = await fetch("http://localhost:3000/api/warehouse")

    if (!res.ok) {
      const text = await res.text()
      throw new Error("Lỗi từ server: " + text)
    }

    const data = await res.json()
    warehouse = data.map(item => ({
      MAKH: item.MAKH,
      MAVT: item.MAVT,
      SOLUONG: item.SOLUONG,
      VITRI: item.VITRI,
      THOIGIANCN: item.THOIGIANCN
    }))
    renderWarehouse()
  } catch (err) {
    console.error("🔥 Lỗi khi lấy kho hàng:", err)
    alert("Không thể lấy dữ liệu kho hàng. Xem console để biết thêm.")
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadMaterialsForWarehouse().then(() => {
    // dữ liệu đã load xong
    fetchWarehouse();
  });
  
})

function loadMaterialsForWarehouse() {
  return fetch('http://localhost:3000/api/material')
    .then(res => {
      if (!res.ok) {
        throw new Error('API không tìm thấy (404) hoặc có lỗi khác.');
      }
      return res.json();
    })
    .then(data => {
      material = data; // ✅ Lưu lại dữ liệu vật tư toàn cục
      const select = document.getElementById('MAVT');
      select.innerHTML = '<option value="">-- Chọn vật tư --</option>';
      data.forEach(vt => {
        const option = document.createElement('option');
        option.value = vt.MAVT;
        option.textContent = vt.TENVT;
        select.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Lỗi khi lấy dữ liệu vật tư:', error);
    });
}

function showAddWarehouseModal() {
  document.getElementById("modal-wh-title").textContent = "Thêm kho hàng"
  document.getElementById("warehouse_MAKH").value = ""

  document.getElementById("SOLUONG").value = ""
  document.getElementById("VITRI").value = ""
  document.getElementById("THOIGIANCN").value = ""
  editingWarehouseIndex = null
  document.getElementById("modal-warehouse").style.display = "block"
}
async function showEditWarehouseModal(index) {
  const item = warehouse[index]; // ✅ lấy toàn bộ object tại index
  editingIndex = index;

  console.log("🟡 Mã kho đang gọi API:", item.MAKH);

  try {
    const res = await fetch(`http://localhost:3000/api/warehouse/${item.MAKH}`);
    const data = await res.json();
console.log("📦 Dữ liệu kho từ API:", data);


    // ✅ Cập nhật form với dữ liệu từ API
    document.getElementById('modal-wh-title').innerText = 'Chỉnh sửa vật tư kho';
    document.getElementById('warehouse_MAKH').value = data.MAKH;
    console.log('✅ MAKH set:', data.MAKH) 
  document.getElementById('SOLUONG').value = data.SOLUONG;
    document.getElementById('VITRI').value = data.VITRI;
    document.getElementById('THOIGIANCN').value = data.THOIGIANCN?.slice(0, 10);

    // ✅ Mở modal
    document.getElementById("modal-warehouse").style.display = "block";

    // ✅ Gán lại sự kiện lưu
    document.querySelector('.save-btn').onclick = () => saveWarehouse();
  } catch (err) {
    console.error("❌ Lỗi khi gọi API kho:", err);
    alert("Không thể lấy dữ liệu để chỉnh sửa.");
  }
}

async function saveWarehouse() {
  const code = document.getElementById("MAKH").value;
  const mavt = document.getElementById("MAVT").value;
  const qty = document.getElementById("SOLUONG").value;
  const location = document.getElementById("VITRI").value;
  const date = document.getElementById("THOIGIANCN").value;

  if (!code || !mavt || !qty || !location || !date) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  const item = {
    MAKH: code,
    MAVT: mavt,
    SOLUONG: parseInt(qty),
    VITRI: location,
    THOIGIANCN: date
  };

  try {
    if (editingIndex !== null) {
      const original = warehouse[editingIndex];
      await fetch(`${baseURL}/${original.MAKH}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } else {
      await fetch(baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    }

    await fetchWarehouse();
    closeWarehouseModal();
  } catch (err) {
    console.error("Lỗi khi lưu kho hàng:", err);
    alert("Không thể lưu kho hàng.");
  }
}


async function deleteWarehouse(index) {
  if (!confirm("Bạn chắc chắn muốn xoá vật tư này?")) return;

  const makh = warehouse[index].MAKH;
  try {
    await fetch(`${baseURL}/${makh}`, { method: 'DELETE' });
    await fetchWarehouseData();
  } catch (err) {
    console.error("Lỗi khi xoá kho hàng:", err);
    alert("Không thể xoá kho hàng.");
  }
}


function closeWarehouseModal() {
  editingIndex = null;
  document.getElementById("modal-warehouse").style.display = "none";
}

function renderWarehouse() {
  const body = document.getElementById("warehouse-body");
  body.innerHTML = "";

  warehouse.forEach((item, index) => {
    const row = `
        <tr>
          <td>${item.MAKH}</td>
          <td>${item.SOLUONG}</td>
          <td>${item.VITRI}</td>
          <td>${new Date(item.THOIGIANCN).toLocaleDateString()}</td>
          <td class="action-icons">
            <i class="fas fa-eye" onclick="showWarehouseDetailModal(${index})"></i>
            <i class="fas fa-pen" onclick="showEditWarehouseModal(${index})"></i>
            <i class="fas fa-trash" onclick="deleteWarehouse(${index})"></i>
          </td>
        </tr>`;
    body.innerHTML += row;
  });
}


function filterWarehouse() {
  const keyword = document.getElementById("searchWarehouseInput").value.toLowerCase()
  const rows = document.querySelectorAll("#warehouse-body tr")

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase()
    row.style.display = text.includes(keyword) ? "" : "none"
  })
}

function createWarehouseDetailModal() {
  // Kiểm tra nếu modal đã tồn tại
  if (document.getElementById("warehouse-detail-modal")) {
    return
  }

  const modal = document.createElement("div")
  modal.id = "warehouse-detail-modal"
  modal.className = "detail-modal"
  modal.innerHTML = `
    <div class="detail-modal-content">
      <div class="detail-modal-header">
        <h3 class="detail-modal-title">Chi tiết kho hàng</h3>
        <button class="detail-modal-close" onclick="closeWarehouseDetailModal()">&times;</button>
      </div>
      <div class="detail-modal-body" id="warehouse-detail-modal-body">
        <!-- Nội dung sẽ được thêm vào động -->
      </div>
      <div class="detail-modal-footer">
        <button class="btn-secondary" onclick="closeWarehouseDetailModal()">Đóng</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}
async function showWarehouseDetailModal(index) {
  const wh = warehouse[index];
  if (!wh) return alert("Không tìm thấy dữ liệu kho!");

  createWarehouseDetailModal();

  try {
    const res = await fetch(`http://localhost:3000/api/material/warehouse/${wh.MAKH}/value`);
    const data = await res.json();

    let stockValue = 0;
    let materials = [];

    if (data.totalValue !== undefined && Array.isArray(data.materials)) {
      stockValue = data.totalValue;
      materials = data.materials;
    } else if (Array.isArray(data)) {
      // Trường hợp API trả về mảng trực tiếp
      materials = data;
      materials.forEach(mat => {
        const soLuong = mat.SOLUONG || 0;
        const donGia = mat.DONGIA || 0;
        stockValue += soLuong * donGia;
      });
    }

    const modalBody = document.getElementById("warehouse-detail-modal-body");

    // Thông tin kho
    modalBody.innerHTML = `
      <div class="detail-info-grid">
        <div class="detail-info-item">
          <span class="detail-info-label">Mã kho hàng:</span>
          <span class="detail-info-value">${wh.MAKH}</span>
        </div>
        <div class="detail-info-item">
          <span class="detail-info-label">Số lượng:</span>
          <span class="detail-info-value">${wh.SOLUONG}</span>
        </div>
        <div class="detail-info-item">
          <span class="detail-info-label">Vị trí:</span>
          <span class="detail-info-value">${wh.VITRI}</span>
        </div>
        <div class="detail-info-item">
          <span class="detail-info-label">Ngày cập nhật:</span>
          <span class="detail-info-value">${wh.THOIGIANCN?.slice(0, 10) || "N/A"}</span>
        </div>
        <div class="detail-info-item">
          <span class="detail-info-label">Giá trị tồn kho:</span>
          <span class="detail-info-value">${formatCurrency(stockValue)}</span>
        </div>
      </div>
    `;

    // Danh sách vật tư
    const materialListContainer = document.createElement("div");
    materialListContainer.className = "material-list";
    materialListContainer.style.marginTop = "20px";
    materialListContainer.innerHTML = `<h4>Danh sách vật tư:</h4>`;

    materials.forEach((mat, i) => {
      const item = document.createElement("div");
      item.className = "material-item";
      item.innerHTML = `
        <div><strong>STT:</strong> ${i + 1}</div>
        <div><strong>Mã VT:</strong> ${mat.MAVT}</div>
        <div><strong>Số lượng:</strong> ${mat.SOLUONG}</div>
        <div><strong>Đơn giá:</strong> ${formatCurrency(mat.DONGIA)}</div>
        <hr>
      `;
      materialListContainer.appendChild(item);
    });

    modalBody.appendChild(materialListContainer);
    document.getElementById("warehouse-detail-modal").style.display = "flex";
  } catch (error) {
    console.error("Lỗi khi lấy vật tư theo kho:", error);
    alert("Không thể lấy dữ liệu vật tư cho kho này.");
  }
}



function closeWarehouseDetailModal() {
  const modal = document.getElementById("warehouse-detail-modal")
  if (modal) {
    modal.style.display = "none"
  }
}
function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}


// ===== BÁO CÁO & THỐNG KÊ =====
// Mảng lưu trữ các báo cáo đã tạo


// Fix tab switching to ensure proper display
let materials = []


let reports = []


document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab")
  const tabContents = document.querySelectorAll(".tab-content")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"))
      tabContents.forEach((c) => {
        c.classList.remove("active")
        c.style.display = "none"
      })

      // Add active class to clicked tab and show corresponding content
      tab.classList.add("active")
      const tabId = tab.dataset.tab
      const content = document.getElementById(`${tabId}-tab`)
      if (content) {
        content.classList.add("active")
        content.style.display = "block"
      }
    })
  })

  // Fix report period change handler
  const reportPeriod = document.getElementById("report-period")
  if (reportPeriod) {
    reportPeriod.addEventListener("change", function () {
      const customRange = document.getElementById("custom-date-range")
      if (customRange) {
        customRange.style.display = this.value === "custom" ? "block" : "none"
      }
    })
  }

  // Update statistics on report page load
  if (document.getElementById("statistics-tab")) {
    updateReportStatisticsFromTables()
  }

  // Render danh sách báo cáo
  renderReports()
})

function renderReports() {
  const reportTable = document.querySelector("#report-table tbody")
  if (!reportTable) return

  reportTable.innerHTML = ""

  reports.forEach((report, index) => {
    const typeText = getReportTypeText(report.type)

    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${report.name}</td>
        <td>${typeText}</td>
        <td>${report.date}</td>
        <td class="action-icons">
          <i class="fas fa-eye" onclick="viewReport(${report.id})" title="Xem báo cáo"></i>
          <i class="fas fa-download" onclick="downloadReport(${report.id})" title="Tải xuống"></i>
          <i class="fas fa-trash" onclick="deleteReport(${report.id})" title="Xóa"></i>
        </td>
      </tr>
    `
    reportTable.innerHTML += row
  })
}

function getReportTypeText(type) {
  switch (type) {
    case "inventory":
      return "Báo cáo tồn kho"
    case "supplier":
      return "Báo cáo nhà cung cấp"
    case "transaction":
      return "Báo cáo giao dịch"
    default:
      return "Khác"
  }
}

function createReportDetailModal() {
  // Kiểm tra nếu modal đã tồn tại
  if (document.getElementById("report-detail-modal")) {
    return
  }

  const modal = document.createElement("div")
  modal.id = "report-detail-modal"
  modal.className = "detail-modal"
  modal.innerHTML = `
    <div class="detail-modal-content">
      <div class="detail-modal-header">
        <h3 class="detail-modal-title">Chi tiết báo cáo</h3>
        <button class="detail-modal-close" onclick="closeReportDetailModal()">&times;</button>
      </div>
      <div class="detail-modal-body" id="report-detail-modal-body">
        <!-- Nội dung sẽ được thêm vào động -->
      </div>
      <div class="detail-modal-footer">
        <button class="btn-primary" onclick="downloadReportDetail()">Tải xuống</button>
        <button class="btn-secondary" onclick="closeReportDetailModal()">Đóng</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

function viewReport(id) {
  const report = reports.find((r) => r.id === id)
  if (!report) {
    alert("Không tìm thấy báo cáo!")
    return
  }

  // Tạo modal nếu chưa có
  createReportDetailModal()

  // Tạo nội dung báo cáo dựa trên loại
  let reportContent = ""

  switch (report.type) {
    case "inventory":
      reportContent = createInventoryReportContent(report)
      break
    case "supplier":
      reportContent = createSupplierReportContent(report)
      break
    case "transaction":
      reportContent = createTransactionReportContent(report)
      break
    default:
      reportContent = `<p>Không có dữ liệu chi tiết cho báo cáo này.</p>`
  }

  // Cập nhật nội dung
  const modalBody = document.getElementById("report-detail-modal-body")
  modalBody.innerHTML = `
    <div class="detail-info-grid">
      <div class="detail-info-item">
        <span class="detail-info-label">Tên báo cáo:</span>
        <span class="detail-info-value">${report.name}</span>
      </div>
      <div class="detail-info-item">
        <span class="detail-info-label">Loại báo cáo:</span>
        <span class="detail-info-value">${getReportTypeText(report.type)}</span>
      </div>
      <div class="detail-info-item">
        <span class="detail-info-label">Ngày tạo:</span>
        <span class="detail-info-value">${report.date}</span>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h4>Nội dung báo cáo</h4>
      ${reportContent}
    </div>
  `

  // Hiển thị modal
  document.getElementById("report-detail-modal").style.display = "flex"
}

function createInventoryReportContent(report) {
  let html = `
    <table class="selected-materials-table" style="margin-top: 15px;">
      <thead>
        <tr>
          <th>Mã vật tư</th>
          <th>Tên vật tư</th>
          <th>Số lượng tồn</th>
          <th>Đơn giá</th>
          <th>Giá trị tồn kho</th>
        </tr>
      </thead>
      <tbody>
  `

  let totalValue = 0

  warehouse.forEach((item) => {
    const material = materials.find((m) => m.code === item.code || m.name === item.name)
    const price = material?.DONGIA || 0
    const value = item.qty * price
    totalValue += value

    html += `
      <tr>
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${formatCurrency(price)}</td>
        <td>${formatCurrency(value)}</td>
      </tr>
    `
  })

  html += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" style="text-align: right; font-weight: bold;">Tổng giá trị tồn kho:</td>
          <td style="font-weight: bold;">${formatCurrency(totalValue)}</td>
        </tr>
      </tfoot>
    </table>
  `

  return html
}

function createSupplierReportContent(report) {
  let html = `
    <table class="selected-materials-table" style="margin-top: 15px;">
      <thead>
        <tr>
          <th>Mã NCC</th>
          <th>Tên nhà cung cấp</th>
          <th>Số vật tư cung cấp</th>
          <th>Tổng giá trị</th>
        </tr>
      </thead>
      <tbody>
  `

  let totalValue = 0

  suppliers.forEach((supplier) => {
    const supplierMaterials = materials.filter((m) => m.supplierCode === supplier.code)
    const materialCount = supplierMaterials.length

    let supplierValue = 0
    supplierMaterials.forEach((mat) => {
      const warehouseItem = warehouse.find((w) => w.code === mat.warehouseCode)
      if (warehouseItem) {
        supplierValue += warehouseItem.qty * mat.price
      }
    })

    totalValue += supplierValue

    html += `
      <tr>
        <td>${supplier.code}</td>
        <td>${supplier.name}</td>
        <td>${materialCount}</td>
        <td>${formatCurrency(supplierValue)}</td>
      </tr>
    `
  })

  html += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align: right; font-weight: bold;">Tổng giá trị:</td>
          <td style="font-weight: bold;">${formatCurrency(totalValue)}</td>
        </tr>
      </tfoot>
    </table>
  `

  return html
}

function createTransactionReportContent(report) {
  let html = `
    <table class="selected-materials-table" style="margin-top: 15px;">
      <thead>
        <tr>
          <th>Mã đơn hàng</th>
          <th>Ngày đặt</th>
          <th>Trạng thái</th>
          <th>Số vật tư</th>
          <th>Tổng tiền</th>
        </tr>
      </thead>
      <tbody>
  `

  let totalAmount = 0

  orders.forEach((order) => {
    const orderTotal = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    totalAmount += orderTotal

    html += `
      <tr>
        <td>${order.code}</td>
        <td>${order.date}</td>
        <td>${order.status}</td>
        <td>${order.items.length}</td>
        <td>${formatCurrency(orderTotal)}</td>
      </tr>
    `
  })

  html += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" style="text-align: right; font-weight: bold;">Tổng doanh thu:</td>
          <td style="font-weight: bold;">${formatCurrency(totalAmount)}</td>
        </tr>
      </tfoot>
    </table>
  `

  return html
}

function closeReportDetailModal() {
  const modal = document.getElementById("report-detail-modal")
  if (modal) {
    modal.style.display = "none"
  }
}

function downloadReportDetail() {
  alert("Đang tải xuống báo cáo...")
}

function downloadReport(id) {
  const report = reports.find((r) => r.id === id)
  if (!report) {
    alert("Không tìm thấy báo cáo!")
    return
  }

  alert(`Đang tải xuống báo cáo: ${report.name}`)
}

function deleteReport(id) {
  if (confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) {
    const index = reports.findIndex((r) => r.id === id)
    if (index !== -1) {
      reports.splice(index, 1)
      renderReports()
    }
  }
}

function handleReportSubmit(e) {
  e.preventDefault() // ✅ Ngăn load lại trang

  const reportType = document.getElementById("report-type").value
  const reportPeriod = document.getElementById("report-period").value

  if (!reportType || !reportPeriod) {
    alert("Vui lòng chọn loại báo cáo và kỳ báo cáo!")
    return
  }

  let reportName = ""
  const reportDate = new Date().toISOString().split("T")[0]
  let reportContent = ""

  // Tạo tên báo cáo dựa trên loại và kỳ
  const typeText = getReportTypeText(reportType)
  const periodText = getPeriodText(reportPeriod)

  reportName = `${typeText} ${periodText}`

  // Tạo nội dung báo cáo
  switch (reportType) {
    case "inventory":
      reportContent = `Báo cáo chi tiết tồn kho ${periodText.toLowerCase()}`
      break
    case "supplier":
      reportContent = `Báo cáo chi tiết nhà cung cấp ${periodText.toLowerCase()}`
      break
    case "transaction":
      reportContent = `Báo cáo chi tiết giao dịch ${periodText.toLowerCase()}`
      break
  }

  // Tạo báo cáo mới
  const newReport = {
    id: reports.length > 0 ? Math.max(...reports.map((r) => r.id)) + 1 : 1,
    name: reportName,
    type: reportType,
    date: reportDate,
    content: reportContent,
  }

  // Thêm vào danh sách báo cáo
  reports.push(newReport)

  // Hiển thị thông báo
  alert("Báo cáo đã được tạo thành công!")

  // Chuyển sang tab xem báo cáo
  const viewReportsTab = document.querySelector('.tab[data-tab="view-reports"]')
  if (viewReportsTab) {
    viewReportsTab.click()
  }

  // Cập nhật danh sách báo cáo
  renderReports()
}

function getPeriodText(period) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  switch (period) {
    case "daily":
      return `ngày ${now.getDate()}/${month}/${year}`
    case "weekly":
      return `tuần ${Math.ceil(now.getDate() / 7)}/${month}/${year}`
    case "monthly":
      return `tháng ${month}/${year}`
    case "quarterly":
      return `quý ${Math.ceil(month / 3)}/${year}`
    case "yearly":
      return `năm ${year}`
    case "custom":
      const startDate = document.getElementById("start-date").value
      const endDate = document.getElementById("end-date").value
      if (startDate && endDate) {
        return `từ ${startDate} đến ${endDate}`
      }
      return `tùy chỉnh`
    default:
      return ""
  }
}

document.getElementById("report-form")?.addEventListener("submit", handleReportSubmit)

// Replace the navigateTo function with this improved version
function navigateTo(sectionId) {
  const sections = document.querySelectorAll("section")
  sections.forEach((sec) => (sec.style.display = "none"))

  const target = document.getElementById(sectionId)
  if (target) {
    target.style.display = "block"

    // 👉 Thêm gọi fetchSuppliers khi chuyển đến tab nhà cung cấp
    if (sectionId === "suppliers") {
      fetchSuppliers()
    }

    // Save the current scroll position
    const currentScrollPosition = window.scrollY

    // Only scroll to top for sections other than report
    if (sectionId !== "report") {
      window.scrollTo(0, 0)
    } else {
      // For report section, maintain scroll position and update statistics
      setTimeout(() => {
        updateReportStatisticsFromTables()

        // Fix tab display
        const tabs = target.querySelectorAll(".tab")
        const tabContents = target.querySelectorAll(".tab-content")

        // Ensure at least one tab is active
        let hasActiveTab = false
        tabs.forEach((tab) => {
          if (tab.classList.contains("active")) {
            hasActiveTab = true
            const tabId = tab.dataset.tab
            const content = document.getElementById(`${tabId}-tab`)
            if (content) {
              content.classList.add("active")
              content.style.display = "block"
            }
          }
        })

        // If no active tab, activate the first one
        if (!hasActiveTab && tabs.length > 0) {
          tabs[0].classList.add("active")
          const tabId = tabs[0].dataset.tab
          const content = document.getElementById(`${tabId}-tab`)
          if (content) {
            content.classList.add("active")
            content.style.display = "block"
          }
        }

        // Ensure we're still at the same position
        window.scrollTo(0, currentScrollPosition)
      }, 200)
    }
  }

  // Update username displays
  updateUsernameDisplays()

  // ✅ Khóa cuộn chỉ khi ở trang login hoặc home
  if (["login", "home"].includes(sectionId)) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = "auto"
  }

  // Cập nhật trạng thái active của menu
  document.querySelectorAll(".sidebar ul li a").forEach((link) => {
    link.classList.remove("active")
    const onclickAttr = link.getAttribute("onclick")
    if (onclickAttr && onclickAttr.includes(`navigateTo('${sectionId}')`)) {
      link.classList.add("active")
    }
    if (
      sectionId === "home" &&
      (!onclickAttr || link.getAttribute("href") === "#") &&
      link.querySelector("span")?.textContent === "Trang chủ"
    ) {
      link.classList.add("active")
    }
  })
}


function getUniqueCodesFromTable(tableId, colIndex = 0) {
  const table = document.querySelector(`#${tableId}`)
  if (!table) return []

  const rows = table.querySelectorAll("tbody tr")
  const codes = [...rows]
    .map((row) => {
      const cells = row.querySelectorAll("td")
      return cells[colIndex]?.innerText.trim()
    })
    .filter(Boolean)

  return [...new Set(codes)]
}

function updateReportStatisticsFromTables() {
  const materialsCount = materials.length
  const suppliersCount = suppliers.length
  const warehouseCount = warehouse.length
  const ordersCount = orders.length

  const statElements = document.querySelectorAll(".stat-number")
  if (statElements.length >= 4) {
    statElements[0].innerText = materialsCount
    statElements[1].innerText = suppliersCount
    statElements[2].innerText = warehouseCount
    statElements[3].innerText = ordersCount
  }

  // Cập nhật biểu đồ
  console.log("📊 warehouse dữ liệu đang có:", warehouse)

  updateChartData()

  // Cập nhật bảng vật tư tồn kho nhiều nhất
  updateTopInventoryTable()
}

function updateChartData() {
  const chartBars = document.querySelectorAll(".chart-bar")
  if (chartBars.length === 0 || warehouse.length === 0) return

  const topWarehouse = warehouse.slice(0, 5)
  const maxQty = Math.max(...topWarehouse.map(item => item.qty || 0), 1)

  topWarehouse.forEach((item, index) => {
    const percentage = Math.round((item.qty / maxQty) * 100)
    const bar = chartBars[index]
    if (!bar) return

    bar.style.height = `${percentage}%`

    const label = bar.querySelector(".chart-label")
    const value = bar.querySelector(".chart-value")

    if (label) label.textContent = item.name
    if (value) value.textContent = `${percentage}%`
  })

  for (let i = topWarehouse.length; i < chartBars.length; i++) {
    chartBars[i].style.height = "0%"
    const label = chartBars[i].querySelector(".chart-label")
    const value = chartBars[i].querySelector(".chart-value")
    if (label) label.textContent = ""
    if (value) value.textContent = "0%"
  }
}


function updateTopInventoryTable() {
  const tableBody = document.querySelector(".inventory-stats table tbody")
  if (!tableBody) return

  // Sắp xếp kho hàng theo số lượng giảm dần
  const sortedWarehouse = [...warehouse].sort((a, b) => b.qty - a.qty)

  // Lấy tối đa 5 mục
  const topItems = sortedWarehouse.slice(0, 5)

  // Xóa dữ liệu cũ
  tableBody.innerHTML = ""

  // Thêm dữ liệu mới
  topItems.forEach((item) => {
    const matchedMaterial = materials.find(
      (m) => m.MAVT === item.code || m.name === item.name
    )
  
    // Nếu không tìm thấy vật tư, gán mặc định
    const price = matchedMaterial?.DONGIA || 0
    const qty = item.qty || 0
    const totalValue = qty * price
  
    console.log("🔍 matchedMaterial:", matchedMaterial)
    console.log("👉 item.qty:", qty, "Đơn giá:", price)
  
    const row = `
      <tr>
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td>${qty}</td>
        <td>${formatCurrency(totalValue)}</td>
      </tr>
    `
    tableBody.innerHTML += row
  })
  

  // Nếu không có dữ liệu
  if (topItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center;">Không có dữ liệu</td>
      </tr>
    `
  }
}


// Add this function to handle the report card click specifically
document.addEventListener("DOMContentLoaded", () => {
  const cardReport = document.getElementById("card-report")

  if (cardReport) {
    // Remove the existing event listener
    cardReport.removeEventListener("click", () => {
      navigateTo("report")
    })

    // Add a new event listener with custom behavior
    cardReport.addEventListener("click", () => {
      const sections = document.querySelectorAll("section")
      sections.forEach((sec) => (sec.style.display = "none"))

      const reportSection = document.getElementById("report")
      if (reportSection) {
        reportSection.style.display = "block"

        // Update the active menu item
        document.querySelectorAll(".sidebar ul li a").forEach((link) => {
          link.classList.remove("active")
          if (link.getAttribute("onclick")?.includes("report")) {
            link.classList.add("active")
          }
        })

        // Update statistics without scrolling
        Promise.all([
          fetchMaterialsForReport(),
          fetchWarehouseForReport(),
          fetchSuppliersForReport()
        ]).then(() => {
          updateReportStatisticsFromTables()
        })
              }

      // Ensure body scrolling is enabled
      document.body.style.overflow = "auto"
    })
  }
})

// Ensure the report section displays correctly
document.addEventListener("DOMContentLoaded", () => {
  // Fix for report navigation
  const reportLinks = document.querySelectorAll("a[onclick*=\"navigateTo('report'\"]")

  reportLinks.forEach((link) => {
    link.addEventListener(
      "click",
      (e) => {
        e.preventDefault()
        e.stopPropagation()

        // Show report section without scrolling
        const sections = document.querySelectorAll("section")
        sections.forEach((sec) => (sec.style.display = "none"))

        const reportSection = document.getElementById("report")
        if (reportSection) {
          reportSection.style.display = "block"

          // Make sure the tab container is visible and properly sized
          const tabContainer = reportSection.querySelector(".tab-container")
          if (tabContainer) {
            tabContainer.style.display = "flex"
            tabContainer.style.width = "100%"
          }

          // Update active state in sidebar
          document.querySelectorAll(".sidebar ul li a").forEach((menuLink) => {
            menuLink.classList.remove("active")
            if (menuLink.getAttribute("onclick")?.includes("report")) {
              menuLink.classList.add("active")
            }
          })

          // Update statistics without scrolling
          Promise.all([
            fetchMaterialsForReport(),
            fetchWarehouseForReport(),
            fetchSuppliersForReport()
          ]).then(() => {
            updateReportStatisticsFromTables()
          })
                  }

        // Ensure body scrolling is enabled
        document.body.style.overflow = "auto"

        return false
      },
      true,
    )
  })

  // Fix tab display on initial load
  const reportSection = document.getElementById("report")
  if (reportSection) {
    const tabContainer = reportSection.querySelector(".tab-container")
    if (tabContainer) {
      tabContainer.style.display = "flex"
      tabContainer.style.width = "100%"
    }
  }
})
async function fetchMaterialsForReport() {
  try {
    const res = await fetch("http://localhost:3000/api/material")
    const data = await res.json()
    materials = data // ✅ Gán vào biến toàn cục
    console.log("✅ Đã load vật tư:", materials)
  } catch (err) {
    console.error("❌ Lỗi khi lấy vật tư:", err)
    materials = []
  }
}

async function fetchWarehouseForReport() {
  try {
    const res = await fetch("http://localhost:3000/api/warehouse")
    const data = await res.json()
    warehouse = data.map((item, index) => ({
      code: item.MAVT || item.MAKH || `KHO${index + 1}`, // code dùng để tìm vật tư
      name: item.VITRI || `Kho ${index + 1}`,
      qty: item.SOLUONG || 0,
    }))
    console.log("✅ Dữ liệu kho sau khi chuẩn hóa:", warehouse)
  } catch (err) {
    console.error("❌ Lỗi khi lấy kho:", err)
    warehouse = []
  }
}



async function fetchSuppliersForReport() {
  try {
    const res = await fetch("http://localhost:3000/api/suppliers")
    suppliers = await res.json()
  } catch (err) {
    console.error("Lỗi khi tải nhà cung cấp:", err)
    suppliers = []
  }
}
