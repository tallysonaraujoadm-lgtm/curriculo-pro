const {
  getFormData,
  hydrateForm,
  startNewResume,
  openEditor
} = window.curriculoPro;

const storageKey = "curriculo-pro-resumes";
const saveResumeBtn = document.querySelector("#saveResumeBtn");
const myResumesBtn = document.querySelector("#myResumesBtn");
const resumesOverlay = document.querySelector("#resumesOverlay");
const closeResumesBtn = document.querySelector("#closeResumesBtn");
const resumesList = document.querySelector("#resumesList");
const resumesStatus = document.querySelector("#resumesStatus");
const newResumeBtn = document.querySelector("#newResumeBtn");

let currentResumeId = null;
let currentResumeTitle = "";

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readResumes() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeResumes(resumes) {
  localStorage.setItem(storageKey, JSON.stringify(resumes));
}

function setStatus(message, error = false) {
  resumesStatus.textContent = message;
  resumesStatus.classList.toggle("error", error);
}

function suggestedTitle(data) {
  return [data.name, data.role].filter((value) => value?.trim()).join(" — ")
    || "Currículo sem título";
}

function saveCurrentResume() {
  saveResumeBtn.disabled = true;

  try {
    const resumes = readResumes();
    const payload = getFormData();
    const now = new Date().toISOString();
    const index = resumes.findIndex((resume) => resume.id === currentResumeId);

    if (index >= 0) {
      resumes[index] = {
        ...resumes[index],
        title: currentResumeTitle || suggestedTitle(payload),
        payload,
        updated_at: now
      };
    } else {
      const resume = {
        id: createId(),
        title: suggestedTitle(payload),
        payload,
        created_at: now,
        updated_at: now
      };
      resumes.unshift(resume);
      currentResumeId = resume.id;
      currentResumeTitle = resume.title;
    }

    writeResumes(resumes);
    saveResumeBtn.textContent = "Salvo";
    window.setTimeout(() => {
      saveResumeBtn.textContent = "Salvar";
    }, 1400);
  } catch {
    window.alert("Não foi possível salvar. O armazenamento do navegador pode estar cheio.");
    saveResumeBtn.textContent = "Salvar";
  } finally {
    saveResumeBtn.disabled = false;
  }
}

function resumeCard(resume) {
  const article = document.createElement("article");
  const info = document.createElement("div");
  const title = document.createElement("h3");
  const date = document.createElement("p");
  const actions = document.createElement("div");

  title.textContent = resume.title;
  date.textContent = `Salvo neste navegador em ${new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(resume.updated_at))}`;
  info.append(title, date);
  actions.className = "resume-card-actions";

  [
    ["Abrir", "open", "primary-button"],
    ["Duplicar", "duplicate", "ghost-button"],
    ["Excluir", "delete", "danger-button"]
  ].forEach(([label, action, className]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = className;
    button.addEventListener("click", () => handleResumeAction(action, resume));
    actions.append(button);
  });

  article.append(info, actions);
  return article;
}

function loadResumes() {
  const resumes = readResumes();
  resumesOverlay.hidden = false;
  setStatus(resumes.length
    ? "Os currículos ficam somente neste navegador e dispositivo."
    : "Você ainda não salvou nenhum currículo neste navegador.");
  resumesList.replaceChildren(...resumes.map(resumeCard));
}

function handleResumeAction(action, resume) {
  if (action === "open") {
    currentResumeId = resume.id;
    currentResumeTitle = resume.title;
    hydrateForm(resume.payload);
    resumesOverlay.hidden = true;
    openEditor();
    return;
  }

  if (action === "duplicate") {
    const resumes = readResumes();
    const now = new Date().toISOString();
    const copy = {
      ...resume,
      id: createId(),
      title: `${resume.title} (cópia)`,
      created_at: now,
      updated_at: now
    };
    resumes.unshift(copy);
    writeResumes(resumes);
    loadResumes();
    return;
  }

  if (action === "delete") {
    if (!window.confirm(`Excluir “${resume.title}” deste navegador?`)) return;
    writeResumes(readResumes().filter((item) => item.id !== resume.id));
    if (currentResumeId === resume.id) {
      currentResumeId = null;
      currentResumeTitle = "";
    }
    loadResumes();
  }
}

saveResumeBtn.addEventListener("click", saveCurrentResume);
myResumesBtn.addEventListener("click", loadResumes);
closeResumesBtn.addEventListener("click", () => {
  resumesOverlay.hidden = true;
});
resumesOverlay.addEventListener("click", (event) => {
  if (event.target === resumesOverlay) resumesOverlay.hidden = true;
});
newResumeBtn.addEventListener("click", () => {
  currentResumeId = null;
  currentResumeTitle = "";
  resumesOverlay.hidden = true;
  startNewResume();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") resumesOverlay.hidden = true;
});
