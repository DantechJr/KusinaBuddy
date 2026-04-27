// -------------------------------- Generator Form Script Start -------------------------------------------//
document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");

  const weekPlanBtn = document.getElementById("weekBtn");

  const resetBtn = document.getElementById("resetBtn");

  const inputBox = document.getElementById("generateBox");
  const outputArea = document.getElementById("FormControlTextarea1");

  // 🔒 If required elements are missing, stop safely
  if (!generateBtn || !inputBox || !outputArea) {
    return;
  }

  // Generate Recipe
  generateBtn.addEventListener("click", async () => {
    const query = inputBox.value.trim();

    if (!query) {
      outputArea.value = "⚠️ Please type an ingredient or dish first!";
      return;
    }

    try {
      const response = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      outputArea.value = data.result;
    } catch (error) {
      outputArea.value = "❌ Error generating recipe. Please try again.";
    }
  });

  // Trigger on Enter key
  inputBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      generateBtn.click();
    }
  });

  // Week Plan (ingredient-based)
  if (weekPlanBtn) {
    weekPlanBtn.addEventListener("click", async () => {
      const ingredients = inputBox.value.trim();

      if (!ingredients) {
        outputArea.value =
          "⚠️ Please type some ingredients for the weekly plan!";
        return;
      }

      try {
        const response = await fetch("/weekplan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients }),
        });

        const data = await response.json();
        outputArea.value = data.plan;
      } catch (error) {
        outputArea.value = "❌ Error generating week plan. Please try again.";
      }
    });
  }

  // Reset
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      inputBox.value = "";
      outputArea.value = "";
    });
  }
});

// -------------------------------- Generator Form Script End -------------------------------------------//

// -------------------------------- Contact Form Script Start -------------------------------------------//
const btn = document.getElementById("button");
const form = document.getElementById("form");

// 🔒 Guard clause
if (btn && form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    btn.value = "Sending...";

    const serviceID = "default_service";
    const templateID = "template_7qw7ghh";

    emailjs.sendForm(serviceID, templateID, this).then(
      () => {
        btn.value = "Send Email";
        alert("Your message has been sent successfully!");
      },
      (err) => {
        btn.value = "Send Email";
        alert(JSON.stringify(err));
      },
    );
  });
}

// --------------------------------------- Contact Form Script End ------------------------------------//

// --------------------------------------- Calculator Script Start -------------------------------------//

// Run only when modal is opened
document
  .getElementById("staticBackdrop2")
  .addEventListener("shown.bs.modal", () => {
    display = document.getElementById("display");
    display.value = "";
  });

// Calculator Functions
function press(char) {
  display.value += char;
}

function clearDisplay() {
  display.value = "";
}

function backspace() {
  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    display.value = eval(display.value);
  } catch {
    display.value = "Error";
  }
}

// --------------------------------------- Calculator Script End -----------------------------------//

// ---------------------------------------- Notepad Script Start--------------- -------------------//

// --- State Management ---
let tasks = JSON.parse(localStorage.getItem("myTasks")) || [];

const input = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");

// --- Core Functions ---

function saveAndRender() {
  localStorage.setItem("myTasks", JSON.stringify(tasks));
  render();
}

function addTask() {
  const text = input.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
  };

  tasks.push(newTask);
  input.value = "";
  saveAndRender();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveAndRender();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
  saveAndRender();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  const newText = prompt("Edit your task:", task.text);

  if (newText !== null && newText.trim() !== "") {
    task.text = newText.trim();
    saveAndRender();
  }
}

// --- DOM Rendering ---

function render() {
  todoList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    li.innerHTML = `
                <input type="checkbox" ${task.completed ? "checked" : ""} 
                    onclick="toggleTask(${task.id})">
                <span class="task-text ${task.completed ? "completed" : ""}">${
                  task.text
                }</span>
                <button class="edit-btn btn btn-outline-success ms-5  my-2" onclick="editTask(${
                  task.id
                })">Edit</button>
                <button class="delete-btn btn btn-outline-danger  my-2" onclick="deleteTask(${
                  task.id
                })">Delete</button>
            `;
    todoList.appendChild(li);
  });
}

// --- Event Listeners ---

addBtn.addEventListener("click", addTask);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

// Initial load
render();

// -------------------------------------- Notepad Script End -------------------------------------//

//---------------------------------------- BMI Calculator Script Start ----------------------------------//

function calculateBMI() {
  const weight = document.getElementById("weight").value;
  const height = document.getElementById("height").value / 100;

  if (weight > 0 && height > 0) {
    const bmi = (weight / (height * height)).toFixed(1);
    document.getElementById("bmi-value").innerText = bmi;
    updateUI(bmi);
  } else {
    alert("Please enter valid positive numbers!");
  }
}

// 2. The UI Logic
function updateUI(bmi) {
  document.querySelectorAll(".cat").forEach((el) => {
    el.className = "cat";
  });

  let status = "";
  if (bmi < 18.5) {
    status = "Underweight";
    document.getElementById("under").classList.add("active-under");
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    status = "Normal Weight";
    document.getElementById("normal").classList.add("active-normal");
  } else if (bmi >= 25 && bmi <= 29.9) {
    status = "Overweight";
    document.getElementById("over").classList.add("active-over");
  } else {
    status = "Obese";
    document.getElementById("obese").classList.add("active-obese");
  }
  document.getElementById("bmi-status").innerText = status;
}

// Reset function to clear inputs and results
function resetBMI() {
  document.getElementById("weight").value = "";
  document.getElementById("height").value = "";
  document.getElementById("bmi-value").innerText = "0.0";
  document.getElementById("bmi-status").innerText = "Enter your details";
  document.querySelectorAll(".cat").forEach((el) => {
    el.className = "cat"; // Remove all active classes
  });
}

// 3. THE FIX: Move this OUTSIDE the functions
// This tells the browser: "The moment you load, start watching for clicks on this button."
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("calc-btn").addEventListener("click", calculateBMI);
  document.getElementById("reset-btn").addEventListener("click", resetBMI);
});

//------------------------------------------------ BMI Calculator Script End ----------------------------------//

// ---------------------------------------- Save Recipe Script Start --------------------------------//

function saveRecipe() {
  // Get the content from the recipe textarea
  const content = document.getElementById("FormControlTextarea1").value;

  // Check if there's content to save
  if (!content.trim()) {
    alert("No recipe to save. Generate a recipe first!");
    return;
  }

  // Create a Blob containing the recipe text
  const blob = new Blob([content], { type: "text/plain" });

  // Create a temporary link element
  const a = document.createElement("a");

  // Set the download filename and link the blob to the download URL
  a.download = "recipe.txt";
  a.href = URL.createObjectURL(blob);

  // Append the link to the body (required for Firefox)
  document.body.appendChild(a);

  // Programmatically click the link to trigger the download
  a.click();

  // Clean up by removing the temporary link and revoking the object URL
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);

  alert("Recipe saved as recipe.txt");
}

// ---------------------------------------- Save Recipe Script End ----------------------------------//
