// ==========================================
// NAVIGATION MENU
// ==========================================

let menuBtn = document.getElementById("menuBtn");
let navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", function() {
    navLinks.classList.toggle("active");

    if (navLinks.classList.contains("active")) {
        menuBtn.textContent = "✕";
    } else {
        menuBtn.textContent = "☰";
    }
});

let navItems = document.querySelectorAll(".nav-links a");

navItems.forEach(function(item) {
    item.addEventListener("click", function() {
        navLinks.classList.remove("active");
        menuBtn.textContent = "☰";
    });
});


// ==========================================
// AUTHENTICATION ELEMENTS
// ==========================================

let signupForm = document.getElementById("signupForm");
let loginForm = document.getElementById("loginForm");

let showLogin = document.getElementById("showLogin");
let showSignup = document.getElementById("showSignup");

let formTitle = document.getElementById("formTitle");
let formDescription = document.getElementById("formDescription");
let message = document.getElementById("message");


// ==========================================
// SHOW LOGIN FORM
// ==========================================

function displayLogin() {
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

    formTitle.textContent = "Welcome Back!";
    formDescription.textContent = "Login to manage your finances.";

    message.textContent = "";
}

showLogin.addEventListener("click", function(event) {
    event.preventDefault();
    displayLogin();
});


// ==========================================
// SHOW SIGNUP FORM
// ==========================================

function displaySignup() {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");

    formTitle.textContent = "Create Your Account";
    formDescription.textContent = "Join us and manage your money smarter.";

    message.textContent = "";
}

showSignup.addEventListener("click", function(event) {
    event.preventDefault();
    displaySignup();
});


// ==========================================
// SIGNUP FUNCTIONALITY
// ==========================================

signupForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let name = document.getElementById("signupName").value.trim();
    let email = document.getElementById("signupEmail").value.trim().toLowerCase();
    let password = document.getElementById("signupPassword").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    let users = JSON.parse(localStorage.getItem("expenseUsers")) || [];

    if (password.length < 6) {
        message.style.color = "red";
        message.textContent = "Password must contain at least 6 characters.";
        return;
    }

    if (password !== confirmPassword) {
        message.style.color = "red";
        message.textContent = "Passwords do not match.";
        return;
    }

    let existingUser = users.find(function(user) {
        return user.email === email;
    });

    if (existingUser) {
        message.style.color = "red";
        message.textContent = "This email is already registered.";
        return;
    }

    let newUser = {
        name: name,
        email: email,
        password: password
    };

    users.push(newUser);

    localStorage.setItem("expenseUsers", JSON.stringify(users));

    signupForm.reset();

    message.style.color = "green";
    message.textContent = "Account created successfully! Please login.";

    setTimeout(function() {
        displayLogin();
        message.style.color = "green";
        message.textContent = "Account created successfully. Please login.";
    }, 1000);
});


// ==========================================
// DASHBOARD ELEMENTS
// ==========================================

let dashboard = document.getElementById("dashboard");

let transactionForm = document.getElementById("transactionForm");
let transactionList = document.getElementById("transactionList");

let totalBalanceElement = document.getElementById("totalBalance");
let totalIncomeElement = document.getElementById("totalIncome");
let totalExpenseElement = document.getElementById("totalExpense");

let monthlyIncomeElement = document.getElementById("monthlyIncome");
let monthlyExpenseElement = document.getElementById("monthlyExpense");

let searchInput = document.getElementById("searchTransaction");
let filterSelect = document.getElementById("filterTransaction");

let transactionDate = document.getElementById("transactionDate");

let budgetForm = document.getElementById("budgetForm");
let budgetAmountInput = document.getElementById("budgetAmount");

let activeUser = null;
let transactions = [];

let categoryChart = null;
let incomeExpenseChart = null;


// ==========================================
// DATE HELPER
// ==========================================

function getTodayDate() {
    let today = new Date();

    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, "0");
    let day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


// ==========================================
// CURRENCY FORMAT
// ==========================================

function formatCurrency(amount) {
    return Number(amount).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    });
}


// ==========================================
// USER TRANSACTION STORAGE
// ==========================================

function getStorageKey() {
    return "transactions_" + activeUser.email;
}

function saveTransactions() {
    localStorage.setItem(
        getStorageKey(),
        JSON.stringify(transactions)
    );
}


// ==========================================
// BUDGET STORAGE
// ==========================================

function getBudgetKey() {
    return "budget_" + activeUser.email;
}

function getSavedBudget() {
    return Number(localStorage.getItem(getBudgetKey())) || 0;
}


// ==========================================
// OPEN DASHBOARD
// ==========================================

function openDashboard(user) {
    activeUser = user;

    document.getElementById("userName").textContent = user.name;

    document.querySelector(".hero").classList.add("hidden");
    document.querySelector(".features").classList.add("hidden");
    document.querySelector(".about").classList.add("hidden");
    document.querySelector(".auth-section").classList.add("hidden");
    document.querySelector("footer").classList.add("hidden");

    dashboard.classList.remove("hidden");

    transactions = JSON.parse(
        localStorage.getItem(getStorageKey())
    ) || [];

    searchInput.value = "";
    filterSelect.value = "all";

    transactionDate.value = getTodayDate();

    budgetAmountInput.value = getSavedBudget() || "";

    updateDashboard();

    window.scrollTo(0, 0);
}


// ==========================================
// LOGIN FUNCTIONALITY
// ==========================================

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let email = document.getElementById("loginEmail").value.trim().toLowerCase();
    let password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("expenseUsers")) || [];

    let currentUser = users.find(function(user) {
        return user.email === email && user.password === password;
    });

    if (currentUser) {
        let session = {
            name: currentUser.name,
            email: currentUser.email
        };

        localStorage.setItem(
            "currentExpenseUser",
            JSON.stringify(session)
        );

        loginForm.reset();
        message.textContent = "";

        openDashboard(session);
    } else {
        message.style.color = "red";
        message.textContent = "Invalid email or password!";
    }
});


// ==========================================
// ADD TRANSACTION
// ==========================================

transactionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!activeUser) {
        return;
    }

    let title = document.getElementById("transactionTitle").value.trim();

    let amount = Number(
        document.getElementById("transactionAmount").value
    );

    let type = document.getElementById("transactionType").value;

    let category = document.getElementById("transactionCategory").value;

    let date = transactionDate.value;

    if (
        !title ||
        !date ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        alert("Please enter valid transaction details.");
        return;
    }

    let newTransaction = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        title: title,
        amount: amount,
        type: type,
        category: category,
        date: date
    };

    transactions.push(newTransaction);

    saveTransactions();

    transactionForm.reset();

    transactionDate.value = getTodayDate();

    updateDashboard();
});


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {
    let income = 0;
    let expense = 0;

    transactions.forEach(function(transaction) {
        if (transaction.type === "income") {
            income += Number(transaction.amount);
        } else {
            expense += Number(transaction.amount);
        }
    });

    let balance = income - expense;

    totalBalanceElement.textContent = formatCurrency(balance);
    totalIncomeElement.textContent = formatCurrency(income);
    totalExpenseElement.textContent = formatCurrency(expense);

    updateMonthlySummary();
    displayTransactions();
    updateAnalytics();
    updateBudgetSummary();
}


// ==========================================
// MONTHLY SPENDING SUMMARY
// ==========================================

function updateMonthlySummary() {
    let now = new Date();

    let currentMonth = now.getMonth();
    let currentYear = now.getFullYear();

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    transactions.forEach(function(transaction) {
        let date = new Date(transaction.date + "T00:00:00");

        if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        ) {
            if (transaction.type === "income") {
                monthlyIncome += Number(transaction.amount);
            } else {
                monthlyExpense += Number(transaction.amount);
            }
        }
    });

    monthlyIncomeElement.textContent = formatCurrency(monthlyIncome);
    monthlyExpenseElement.textContent = formatCurrency(monthlyExpense);

    let maximum = Math.max(monthlyIncome, monthlyExpense, 1);

    let incomePercentage = (monthlyIncome / maximum) * 100;
    let expensePercentage = (monthlyExpense / maximum) * 100;

    document.getElementById("incomeBar").style.width =
        incomePercentage + "%";

    document.getElementById("expenseBar").style.width =
        expensePercentage + "%";
}


// ==========================================
// DISPLAY TRANSACTIONS
// ==========================================

function displayTransactions() {
    transactionList.innerHTML = "";

    let searchText = searchInput.value.toLowerCase().trim();

    let selectedFilter = filterSelect.value;

    let filteredTransactions = transactions.filter(function(item) {
        let matchesSearch =
            item.title.toLowerCase().includes(searchText) ||
            item.category.toLowerCase().includes(searchText);

        let matchesType =
            selectedFilter === "all" ||
            item.type === selectedFilter;

        return matchesSearch && matchesType;
    });

    if (filteredTransactions.length === 0) {
        let emptyRow = document.createElement("tr");

        let emptyCell = document.createElement("td");

        emptyCell.colSpan = 6;
        emptyCell.className = "empty-message";
        emptyCell.textContent = "No matching transactions found.";

        emptyRow.appendChild(emptyCell);

        transactionList.appendChild(emptyRow);

        return;
    }

    filteredTransactions.sort(function(a, b) {
        return b.date.localeCompare(a.date);
    });

    filteredTransactions.forEach(function(item) {
        let row = document.createElement("tr");

        let titleCell = document.createElement("td");
        titleCell.textContent = item.title;

        let categoryCell = document.createElement("td");
        categoryCell.textContent = item.category;

        let dateCell = document.createElement("td");
        dateCell.textContent = item.date;

        let typeCell = document.createElement("td");
        typeCell.textContent =
            item.type.charAt(0).toUpperCase() + item.type.slice(1);

        let amountCell = document.createElement("td");

        amountCell.textContent =
            (item.type === "income" ? "+ " : "- ") +
            formatCurrency(item.amount);

        amountCell.className =
            item.type === "income" ? "income-text" : "expense-text";

        let actionCell = document.createElement("td");

        // EDIT BUTTON
        let editButton = document.createElement("button");

        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", function() {
            editTransaction(item.id);
        });

        // DELETE BUTTON
        let deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            deleteTransaction(item.id);
        });

        actionCell.append(editButton, deleteButton);

        row.append(
            titleCell,
            categoryCell,
            dateCell,
            typeCell,
            amountCell,
            actionCell
        );

        transactionList.appendChild(row);
    });
}


// ==========================================
// SEARCH AND FILTER
// ==========================================

searchInput.addEventListener("input", displayTransactions);

filterSelect.addEventListener("change", displayTransactions);


// ==========================================
// DELETE TRANSACTION
// ==========================================

function deleteTransaction(id) {
    let confirmation = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmation) {
        return;
    }

    transactions = transactions.filter(function(item) {
        return item.id !== id;
    });

    saveTransactions();

    updateDashboard();
}


// ==========================================
// EDIT TRANSACTION
// ==========================================

function editTransaction(id) {
    let selectedTransaction = transactions.find(function(item) {
        return item.id === id;
    });

    if (!selectedTransaction) {
        return;
    }

    let newTitle = prompt(
        "Enter new description:",
        selectedTransaction.title
    );

    if (newTitle === null) {
        return;
    }

    newTitle = newTitle.trim();

    if (newTitle === "") {
        alert("Description cannot be empty.");
        return;
    }

    let newAmount = prompt(
        "Enter new amount:",
        selectedTransaction.amount
    );

    if (newAmount === null) {
        return;
    }

    newAmount = Number(newAmount);

    if (!Number.isFinite(newAmount) || newAmount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    selectedTransaction.title = newTitle;
    selectedTransaction.amount = newAmount;

    saveTransactions();

    updateDashboard();
}


// ==========================================
// EXPENSE ANALYTICS
// ==========================================

function updateAnalytics() {
    if (typeof Chart === "undefined") {
        return;
    }

    let categoryTotals = {};

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(function(transaction) {
        let amount = Number(transaction.amount);

        if (transaction.type === "income") {
            totalIncome += amount;
        } else {
            totalExpense += amount;

            if (!categoryTotals[transaction.category]) {
                categoryTotals[transaction.category] = 0;
            }

            categoryTotals[transaction.category] += amount;
        }
    });

    let categoryLabels = Object.keys(categoryTotals);
    let categoryAmounts = Object.values(categoryTotals);

    let categoryCanvas = document.getElementById("categoryChart");
    let incomeExpenseCanvas = document.getElementById("incomeExpenseChart");

    if (categoryChart) {
        categoryChart.destroy();
    }

    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }

    // CATEGORY DOUGHNUT CHART
    categoryChart = new Chart(categoryCanvas, {
        type: "doughnut",

        data: {
            labels: categoryLabels,

            datasets: [{
                label: "Expenses",
                data: categoryAmounts,
                backgroundColor: [
                    "#635bff",
                    "#16a34a",
                    "#f59e0b",
                    "#ef4444",
                    "#0ea5e9",
                    "#a855f7",
                    "#ec4899",
                    "#64748b"
                ],
                borderWidth: 1
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: true,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });


    // INCOME VS EXPENSE BAR CHART
    incomeExpenseChart = new Chart(incomeExpenseCanvas, {
        type: "bar",

        data: {
            labels: ["Income", "Expenses"],

            datasets: [{
                label: "Amount (₹)",
                data: [totalIncome, totalExpense],
                backgroundColor: ["#16a34a", "#ef4444"],
                borderRadius: 7
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: true,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


// ==========================================
// SET MONTHLY BUDGET
// ==========================================

budgetForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!activeUser) {
        return;
    }

    let budget = Number(budgetAmountInput.value);

    if (!Number.isFinite(budget) || budget <= 0) {
        alert("Please enter a valid budget amount.");
        return;
    }

    localStorage.setItem(getBudgetKey(), budget);

    updateBudgetSummary();

    alert("Monthly budget saved successfully!");
});


// ==========================================
// UPDATE BUDGET SUMMARY
// ==========================================

function updateBudgetSummary() {
    if (!activeUser) {
        return;
    }

    let budget = getSavedBudget();

    let now = new Date();

    let currentMonth = now.getMonth();
    let currentYear = now.getFullYear();

    let monthlyExpense = 0;

    transactions.forEach(function(transaction) {
        let date = new Date(transaction.date + "T00:00:00");

        if (
            transaction.type === "expense" &&
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        ) {
            monthlyExpense += Number(transaction.amount);
        }
    });

    let remaining = budget - monthlyExpense;

    document.getElementById("budgetLimit").textContent =
        formatCurrency(budget);

    document.getElementById("budgetSpent").textContent =
        formatCurrency(monthlyExpense);

    document.getElementById("budgetRemaining").textContent =
        formatCurrency(remaining);

    let progressBar = document.getElementById("budgetProgressBar");
    let budgetMessage = document.getElementById("budgetMessage");

    if (budget > 0) {
        let percentage = (monthlyExpense / budget) * 100;

        progressBar.style.width = Math.min(percentage, 100) + "%";

        if (monthlyExpense > budget) {
            progressBar.style.backgroundColor = "#dc2626";

            budgetMessage.style.color = "#dc2626";
            budgetMessage.textContent =
                "Warning! You have exceeded your monthly budget.";
        } else if (percentage >= 80) {
            progressBar.style.backgroundColor = "#f59e0b";

            budgetMessage.style.color = "#d97706";
            budgetMessage.textContent =
                "Careful! You have used most of your budget.";
        } else {
            progressBar.style.backgroundColor = "#635bff";

            budgetMessage.style.color = "#16a34a";
            budgetMessage.textContent =
                "Good job! You are within your monthly budget.";
        }
    } else {
        progressBar.style.width = "0%";

        budgetMessage.style.color = "#64748b";
        budgetMessage.textContent =
            "Set a monthly budget to start tracking your spending.";
    }
}


// ==========================================
// LOGOUT FUNCTIONALITY
// ==========================================

document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("currentExpenseUser");

    activeUser = null;
    transactions = [];

    if (categoryChart) {
        categoryChart.destroy();
        categoryChart = null;
    }

    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
        incomeExpenseChart = null;
    }

    dashboard.classList.add("hidden");

    document.querySelector(".hero").classList.remove("hidden");
    document.querySelector(".features").classList.remove("hidden");
    document.querySelector(".about").classList.remove("hidden");
    document.querySelector(".auth-section").classList.remove("hidden");
    document.querySelector("footer").classList.remove("hidden");

    displayLogin();

    window.scrollTo(0, 0);
});


// ==========================================
// RESTORE LOGIN SESSION
// ==========================================

let savedSession = JSON.parse(
    localStorage.getItem("currentExpenseUser")
);

if (savedSession) {
    let registeredUsers =
        JSON.parse(localStorage.getItem("expenseUsers")) || [];

    let validUser = registeredUsers.find(function(user) {
        return user.email === savedSession.email;
    });

    if (validUser) {
        openDashboard(savedSession);
    } else {
        localStorage.removeItem("currentExpenseUser");
    }
}


// ==========================================
// INITIAL DATE
// ==========================================

transactionDate.value = getTodayDate();