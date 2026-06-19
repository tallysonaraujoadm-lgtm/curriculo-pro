import { createAuthClient } from "better-auth/client";
import {
  getFormData,
  hydrateForm,
  startNewResume,
  openEditor
} from "./app.js";

const authClient = createAuthClient();

const authOverlay = document.querySelector("#authOverlay");
const closeAuthBtn = document.querySelector("#closeAuthBtn");
const landingAccountBtn = document.querySelector("#landingAccountBtn");
const editorAccountBtn = document.querySelector("#editorAccountBtn");
const authTitle = document.querySelector("#authTitle");
const authCopy = document.querySelector("#authCopy");
const authGuest = document.querySelector("#authGuest");
const authSession = document.querySelector("#authSession");
const sessionUserName = document.querySelector("#sessionUserName");
const sessionUserEmail = document.querySelector("#sessionUserEmail");
const importAccountBtn = document.querySelector("#importAccountBtn");
const signOutBtn = document.querySelector("#signOutBtn");
const sessionResumesBtn = document.querySelector("#sessionResumesBtn");
const authForm = document.querySelector("#authForm");
const authNameField = document.querySelector("#authNameField");
const authName = document.querySelector("#authName");
const authEmail = document.querySelector("#authEmail");
const authPasswordField = document.querySelector("#authPasswordField");
const authPassword = document.querySelector("#authPassword");
const authSubmitBtn = document.querySelector("#authSubmitBtn");
const forgotPasswordBtn = document.querySelector("#forgotPasswordBtn");
const authStatus = document.querySelector("#authStatus");
const authViewButtons = document.querySelectorAll("[data-auth-view]");
const socialButtons = document.querySelectorAll("[data-social-provider]");
const socialAuthDivider = document.querySelector("#socialAuthDivider");
const socialAuthActions = document.querySelector("#socialAuthActions");
const saveResumeBtn = document.querySelector("#saveResumeBtn");
const myResumesBtn = document.querySelector("#myResumesBtn");
const resumesOverlay = document.querySelector("#resumesOverlay");
const closeResumesBtn = document.querySelector("#closeResumesBtn");
const resumesList = document.querySelector("#resumesList");
const resumesStatus = document.querySelector("#resumesStatus");
const newResumeBtn = document.querySelector("#newResumeBtn");

let session = null;
let authView = "signin";
let currentResumeId = null;
let currentResumeTitle = "";

function setStatus(message, error = false) {
  authStatus.textContent = message;
  authStatus.classList.toggle("error", error);
}

function setResumesStatus(message, error = false) {
  resumesStatus.textContent = message;
  resumesStatus.classList.toggle("error", error);
}

function openAuth() {
  authOverlay.hidden = false;
  setStatus("");
}

function closeAuth() {
  authOverlay.hidden = true;
}

function setAuthView(view) {
  authView = view;
  const signup = view === "signup";
  const reset = view === "reset";

  authViewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.authView === view);
  });

  authNameField.hidden = !signup;
  authPasswordField.hidden = reset;
  authName.required = signup;
  authPassword.required = !reset;
  authPassword.autocomplete = signup ? "new-password" : "current-password";
  forgotPasswordBtn.hidden = reset || signup;

  if (reset) {
    authTitle.textContent = "Recuperar senha";
    authCopy.textContent = "Enviaremos um link seguro para criar uma nova senha.";
    authSubmitBtn.textContent = "Enviar link";
  } else if (signup) {
    authTitle.textContent = "Criar sua conta";
    authCopy.textContent = "Salve, edite e duplique seus currículos em qualquer dispositivo.";
    authSubmitBtn.textContent = "Criar conta";
  } else {
    authTitle.textContent = "Entrar no Currículo Pro";
    authCopy.textContent = "Acesse seus currículos salvos em qualquer dispositivo.";
    authSubmitBtn.textContent = "Entrar";
  }
  setStatus("");
}

function updateSessionUi() {
  const user = session?.user;
  authGuest.hidden = Boolean(user);
  authSession.hidden = !user;
  landingAccountBtn.textContent = user ? "Minha conta" : "Entrar";
  editorAccountBtn.textContent = user ? (user.name?.split(" ")[0] || "Conta") : "Entrar";

  if (user) {
    sessionUserName.textContent = user.name || "Usuário";
    sessionUserEmail.textContent = user.email;
    authTitle.textContent = "Sua conta";
    authCopy.textContent = "Sua sessão está ativa neste dispositivo.";
  } else {
    setAuthView("signin");
  }
}

async function refreshSession() {
  const result = await authClient.getSession();
  session = result.data || null;
  updateSessionUi();
  return session;
}

async function loadConfiguredProviders() {
  try {
    const response = await fetch("/api/auth-providers", {
      credentials: "same-origin",
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Não foi possível consultar os provedores.");

    const body = await response.json();
    const configured = new Set(body.providers || []);
    socialButtons.forEach((button) => {
      button.hidden = !configured.has(button.dataset.socialProvider);
    });
    const hasProvider = configured.size > 0;
    socialAuthDivider.hidden = !hasProvider;
    socialAuthActions.hidden = !hasProvider;
  } catch {
    socialAuthDivider.hidden = true;
    socialAuthActions.hidden = true;
  }
}

function importAccountIntoResume() {
  const user = session?.user;
  if (!user) return;

  const current = getFormData();
  hydrateForm({
    ...current,
    name: user.name || current.name,
    email: user.email || current.email,
    photoData: current.photoData || user.image || ""
  });
  currentResumeTitle = "";
  closeAuth();
  openEditor();
  setStatus("Nome, e-mail e foto disponíveis na conta foram adicionados ao currículo.");
}

async function requireSession() {
  await refreshSession();
  if (session?.user) return true;
  openAuth();
  setStatus("Entre ou crie uma conta para salvar currículos.");
  return false;
}

async function apiRequest(options = {}) {
  const response = await fetch("/api/resumes", {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Não foi possível concluir a operação.");
  return body;
}

function suggestedTitle(data) {
  return [data.name, data.role].filter((value) => value?.trim()).join(" — ") || "Currículo sem título";
}

async function saveCurrentResume() {
  if (!(await requireSession())) return;

  saveResumeBtn.disabled = true;
  saveResumeBtn.textContent = "Salvando...";
  try {
    const payload = getFormData();
    const title = currentResumeTitle || suggestedTitle(payload);
    const body = await apiRequest({
      method: currentResumeId ? "PATCH" : "POST",
      body: JSON.stringify({
        id: currentResumeId,
        title,
        payload
      })
    });
    currentResumeId = body.resume.id;
    currentResumeTitle = body.resume.title;
    saveResumeBtn.textContent = "Salvo";
    window.setTimeout(() => {
      saveResumeBtn.textContent = "Salvar";
    }, 1400);
  } catch (error) {
    saveResumeBtn.textContent = "Salvar";
    openAuth();
    setStatus(error.message, true);
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
  date.textContent = `Atualizado em ${new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(resume.updated_at))}`;
  info.append(title, date);
  actions.className = "resume-card-actions";

  const definitions = [
    ["Abrir", "open", "primary-button"],
    ["Duplicar", "duplicate", "ghost-button"],
    ["Excluir", "delete", "danger-button"]
  ];
  definitions.forEach(([label, action, className]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = className;
    button.dataset.resumeAction = action;
    button.addEventListener("click", () => handleResumeAction(action, resume));
    actions.append(button);
  });

  article.append(info, actions);
  return article;
}

async function loadResumes() {
  if (!(await requireSession())) return;
  resumesOverlay.hidden = false;
  setResumesStatus("Carregando...");
  resumesList.replaceChildren();

  try {
    const body = await apiRequest();
    setResumesStatus(body.resumes.length ? "" : "Você ainda não salvou nenhum currículo.");
    resumesList.replaceChildren(...body.resumes.map(resumeCard));
  } catch (error) {
    setResumesStatus(error.message, true);
  }
}

async function handleResumeAction(action, resume) {
  if (action === "open") {
    currentResumeId = resume.id;
    currentResumeTitle = resume.title;
    hydrateForm(resume.payload);
    resumesOverlay.hidden = true;
    openEditor();
    return;
  }

  if (action === "duplicate") {
    try {
      const body = await apiRequest({
        method: "POST",
        body: JSON.stringify({
          title: `${resume.title} (cópia)`,
          payload: resume.payload
        })
      });
      currentResumeId = body.resume.id;
      currentResumeTitle = body.resume.title;
      await loadResumes();
    } catch (error) {
      setResumesStatus(error.message, true);
    }
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(`Excluir “${resume.title}”? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    try {
      await apiRequest({
        method: "DELETE",
        body: JSON.stringify({ id: resume.id })
      });
      if (currentResumeId === resume.id) {
        currentResumeId = null;
        currentResumeTitle = "";
      }
      await loadResumes();
    } catch (error) {
      setResumesStatus(error.message, true);
    }
  }
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Aguarde...");
  authSubmitBtn.disabled = true;

  try {
    if (authView === "signup") {
      const result = await authClient.signUp.email({
        name: authName.value.trim(),
        email: authEmail.value.trim(),
        password: authPassword.value,
        callbackURL: `${window.location.origin}/#editor`
      });
      if (result.error) throw new Error(result.error.message);
      setStatus("Cadastro criado. Verifique seu e-mail para confirmar a conta.");
      authForm.reset();
    } else if (authView === "reset") {
      const result = await authClient.requestPasswordReset({
        email: authEmail.value.trim(),
        redirectTo: `${window.location.origin}/reset-password.html`
      });
      if (result.error) throw new Error(result.error.message);
      setStatus("Se o e-mail estiver cadastrado, enviaremos o link de recuperação.");
    } else {
      const result = await authClient.signIn.email({
        email: authEmail.value.trim(),
        password: authPassword.value,
        rememberMe: true,
        callbackURL: `${window.location.origin}/#editor`
      });
      if (result.error) throw new Error(result.error.message);
      await refreshSession();
      closeAuth();
    }
  } catch (error) {
    setStatus(error.message || "Não foi possível autenticar.", true);
  } finally {
    authSubmitBtn.disabled = false;
  }
});

socialButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const result = await authClient.signIn.social({
      provider: button.dataset.socialProvider,
      callbackURL: `${window.location.origin}/#editor`,
      errorCallbackURL: `${window.location.origin}/?authError=oauth`
    });
    if (result?.error) setStatus(result.error.message, true);
  });
});

authViewButtons.forEach((button) => {
  button.addEventListener("click", () => setAuthView(button.dataset.authView));
});

forgotPasswordBtn.addEventListener("click", () => setAuthView("reset"));
[landingAccountBtn, editorAccountBtn].forEach((button) => button.addEventListener("click", openAuth));
closeAuthBtn.addEventListener("click", closeAuth);
authOverlay.addEventListener("click", (event) => {
  if (event.target === authOverlay) closeAuth();
});

signOutBtn.addEventListener("click", async () => {
  await authClient.signOut();
  session = null;
  currentResumeId = null;
  currentResumeTitle = "";
  updateSessionUi();
  setStatus("Sessão encerrada.");
});

importAccountBtn.addEventListener("click", importAccountIntoResume);
saveResumeBtn.addEventListener("click", saveCurrentResume);
myResumesBtn.addEventListener("click", loadResumes);
sessionResumesBtn.addEventListener("click", () => {
  closeAuth();
  loadResumes();
});
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
  if (event.key !== "Escape") return;
  authOverlay.hidden = true;
  resumesOverlay.hidden = true;
});

loadConfiguredProviders();
refreshSession();
