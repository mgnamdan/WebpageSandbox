/*
  JavaScript I Webpage Sandbox Script
  -----------------------------------
  This file powers the teaching tool. The important idea for students:

  1. HTML creates the permanent interface in index.html.
  2. CSS styles that interface in style.css.
  3. JavaScript listens for clicks and typing, then updates the preview iframe.

  The sandbox teaches HTML and CSS first, so any <script> tags typed into the
  HTML editor are not allowed to run inside the preview.
*/

// Each lesson is one small "web page" made of an HTML string, a CSS string,
// and a short teacher note. Adding a new lesson is mostly adding one object.
const lessons = [
  {
    id: "starter",
    title: "Starter Profile Card",
    note: "HTML elements describe the content: a heading, image, paragraph, and links. CSS controls spacing, colors, borders, and layout.",
    html: `<main class="profile-card">
  <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80" alt="A smiling dog ready for class">

  <section>
    <p class="tag">Student spotlight</p>
    <h1>Maya's First Webpage</h1>
    <p>
      This card is built with semantic HTML and styled with CSS.
      Try changing the heading, image, button text, or class names.
    </p>

    <a href="#" class="button-link">Read more</a>
  </section>
</main>`,
    css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #dbeafe;
  font-family: Arial, sans-serif;
  color: #172033;
}

.profile-card {
  width: min(90%, 520px);
  overflow: hidden;
  background: white;
  border: 4px solid #2563eb;
  border-radius: 18px;
  box-shadow: 0 18px 35px rgba(23, 32, 51, 0.18);
}

.profile-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.profile-card section {
  padding: 24px;
}

.tag {
  margin: 0 0 8px;
  color: #2563eb;
  font-weight: bold;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 12px;
}

p {
  line-height: 1.6;
}

.button-link {
  display: inline-block;
  margin-top: 8px;
  padding: 12px 16px;
  background: #2563eb;
  color: white;
  border-radius: 999px;
  text-decoration: none;
  font-weight: bold;
}`
  },
  {
    id: "box-model",
    title: "Box Model Lab",
    note: "Use this example to compare content, padding, border, and margin. Change one number at a time and watch the box move or grow.",
    html: `<article class="box-demo">
  <h1>The CSS Box Model</h1>
  <p class="content">
    Every element is a box. This paragraph has content, padding,
    a border, and margin around it.
  </p>
  <p>Try editing padding, border, and margin in the CSS tab.</p>
</article>`,
    css: `body {
  margin: 0;
  min-height: 100vh;
  background: #f8fafc;
  font-family: Arial, sans-serif;
}

.box-demo {
  max-width: 640px;
  margin: 40px auto;
  padding: 20px;
}

.content {
  background: #fef3c7;
  padding: 32px;
  border: 8px solid #f59e0b;
  margin: 28px;
  color: #78350f;
  font-size: 1.2rem;
  line-height: 1.5;
}`
  },
  {
    id: "selectors",
    title: "Selectors + Classes",
    note: "This lesson shows how CSS selectors target elements. Compare element selectors like li, class selectors like .featured, and combined selectors.",
    html: `<section class="menu">
  <h1>Lunch Menu</h1>
  <ul>
    <li>Tomato soup</li>
    <li class="featured">Grilled cheese</li>
    <li>Apple slices</li>
  </ul>
  <p class="featured">Today's featured item gets extra attention.</p>
</section>`,
    css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #ecfdf5;
  font-family: Georgia, serif;
}

.menu {
  width: min(90%, 460px);
  padding: 28px;
  background: white;
  border-radius: 12px;
  border: 2px solid #10b981;
}

h1 {
  margin-top: 0;
  color: #065f46;
}

li {
  padding: 8px;
  margin-bottom: 8px;
}

.featured {
  background: #bbf7d0;
  color: #065f46;
  font-weight: bold;
}

li.featured {
  border-left: 6px solid #10b981;
}`
  },
  {
    id: "layout",
    title: "Flexbox Layout",
    note: "Flexbox helps arrange items in rows or columns. Change flex-direction, justify-content, gap, or flex-wrap to see layout rules in action.",
    html: `<section class="gallery">
  <h1>Class Project Gallery</h1>
  <div class="card-row">
    <article>HTML</article>
    <article>CSS</article>
    <article>JavaScript</article>
  </div>
</section>`,
    css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f1f5f9;
  font-family: Arial, sans-serif;
}

.gallery {
  width: min(92%, 720px);
}

.card-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

article {
  flex: 1 1 150px;
  padding: 36px 20px;
  background: #1e293b;
  color: white;
  border-radius: 12px;
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
}`
  }
];

// Store references to the page elements we will use more than once.
// This avoids repeatedly searching the document for the same IDs.
const htmlEditor = document.querySelector("#htmlEditor");
const cssEditor = document.querySelector("#cssEditor");
const previewFrame = document.querySelector("#previewFrame");
const lessonGrid = document.querySelector("#lessonGrid");
const conceptCard = document.querySelector("#conceptCard");
const saveStatus = document.querySelector("#saveStatus");
const autoRunToggle = document.querySelector("#autoRunToggle");
const runButton = document.querySelector("#runButton");
const resetButton = document.querySelector("#resetButton");
const tabButtons = document.querySelectorAll(".tab-button");
const editorPanes = document.querySelectorAll(".editor-pane");

// Track which lesson is currently loaded so Reset can restore that lesson.
let activeLessonId = "starter";

// A timer lets us wait a tiny moment after typing before updating the preview.
// That keeps the page responsive while still feeling live.
let previewTimer;

function buildPreviewDocument(htmlCode, cssCode) {
  /*
    The iframe needs a complete HTML document, not just the student's snippet.
    We create that document as a string, insert the student's CSS inside <style>,
    and insert the student's HTML inside <body>.

    The iframe uses sandbox="" in index.html, so scripts typed by students will
    not execute. This keeps the classroom exercise focused on HTML and CSS.
  */
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${cssCode}
  </style>
</head>
<body>
${htmlCode}
</body>
</html>`;
}

function updatePreview() {
  // srcdoc replaces the iframe's document with the newest editor contents.
  previewFrame.srcdoc = buildPreviewDocument(htmlEditor.value, cssEditor.value);
  saveStatus.textContent = "Preview updated";
}

function schedulePreviewUpdate() {
  // When live update is off, typing changes the editor but not the preview.
  if (!autoRunToggle.checked) {
    saveStatus.textContent = "Edited - press Run now";
    return;
  }

  saveStatus.textContent = "Updating...";
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 250);
}

function switchEditor(nextEditorName) {
  /*
    Tabs work by matching data-editor="html" or data-editor="css"
    on the button to the matching panel ID.
  */
  tabButtons.forEach((button) => {
    const isActive = button.dataset.editor === nextEditorName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  editorPanes.forEach((pane) => {
    const isActive = pane.id === `${nextEditorName}Panel`;
    pane.classList.toggle("active", isActive);
    pane.hidden = !isActive;
  });
}

function setConceptNote(lesson) {
  conceptCard.innerHTML = `
    <h3>What to notice</h3>
    <p>${lesson.note}</p>
  `;
}

function loadLesson(lessonId) {
  // Find the lesson object that matches the button the user clicked.
  const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];

  activeLessonId = lesson.id;
  htmlEditor.value = lesson.html;
  cssEditor.value = lesson.css;
  setConceptNote(lesson);

  document.querySelectorAll(".lesson-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.lessonId === lesson.id);
  });

  updatePreview();
}

function buildLessonButtons() {
  /*
    The HTML file has an empty lessonGrid. JavaScript fills it here.
    This is a gentle example of how JS can create repeated interface pieces
    from data instead of copying and pasting the same markup by hand.
  */
  lessons.forEach((lesson) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-button";
    button.dataset.lessonId = lesson.id;
    button.textContent = lesson.title;

    button.addEventListener("click", () => {
      loadLesson(lesson.id);
    });

    lessonGrid.appendChild(button);
  });
}

function insertTabCharacter(event) {
  /*
    Textareas usually move focus when Tab is pressed. In a code editor, students
    expect Tab to indent. This small handler inserts two spaces instead.
  */
  if (event.key !== "Tab") {
    return;
  }

  event.preventDefault();

  const editor = event.target;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const indentation = "  ";

  editor.value = `${editor.value.slice(0, start)}${indentation}${editor.value.slice(end)}`;
  editor.selectionStart = start + indentation.length;
  editor.selectionEnd = start + indentation.length;
  schedulePreviewUpdate();
}

// Wire the interface together after all helper functions exist.
buildLessonButtons();
loadLesson(activeLessonId);

htmlEditor.addEventListener("input", schedulePreviewUpdate);
cssEditor.addEventListener("input", schedulePreviewUpdate);
htmlEditor.addEventListener("keydown", insertTabCharacter);
cssEditor.addEventListener("keydown", insertTabCharacter);

runButton.addEventListener("click", updatePreview);
resetButton.addEventListener("click", () => {
  loadLesson(activeLessonId);
});

autoRunToggle.addEventListener("change", () => {
  if (autoRunToggle.checked) {
    updatePreview();
  } else {
    saveStatus.textContent = "Live update paused";
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchEditor(button.dataset.editor);
  });
});
