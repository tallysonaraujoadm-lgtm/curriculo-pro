const form = document.querySelector("#resumeForm");
const preview = document.querySelector("#resumePreview");
const printBtn = document.querySelector("#printBtn");
const finishPrintBtn = document.querySelector("#finishPrintBtn");
const clearBtn = document.querySelector("#clearBtn");
const templateButtons = document.querySelectorAll(".template-option");
const styleButtons = document.querySelectorAll(".style-option");
const pagePanels = document.querySelectorAll("[data-page-panel]");
const suggestionTitle = document.querySelector("#suggestionTitle");
const suggestionList = document.querySelector("#suggestionList");
const photoInput = document.querySelector("#photoInput");
const photoThumb = document.querySelector("#photoThumb");
const removePhotoBtn = document.querySelector("#removePhotoBtn");
const resumePhoto = document.querySelector("#resumePhoto");
const skillsField = form.elements.skills;
const skillOptions = document.querySelector("#skillOptions");
const customSkillInput = document.querySelector("#customSkillInput");
const addCustomSkillBtn = document.querySelector("#addCustomSkillBtn");
const experienceList = document.querySelector("#experienceList");
const educationList = document.querySelector("#educationList");
const addExperienceBtn = document.querySelector("#addExperienceBtn");
const addEducationBtn = document.querySelector("#addEducationBtn");
const currentStepTitle = document.querySelector("#currentStepTitle");
const stepCounter = document.querySelector("#stepCounter");
const progressBar = document.querySelector("#progressBar");
const saveStatus = document.querySelector("#saveStatus");
const authOverlay = document.querySelector("#authOverlay");
const authStep = document.querySelector("#authStep");
const deliveryStep = document.querySelector("#deliveryStep");
const closeAuthModalBtn = document.querySelector("#closeAuthModalBtn");
const googleAuthBtn = document.querySelector("#googleAuthBtn");
const facebookAuthBtn = document.querySelector("#facebookAuthBtn");
const modalAuthEmail = document.querySelector("#modalAuthEmail");
const modalAuthPassword = document.querySelector("#modalAuthPassword");
const modalSignInBtn = document.querySelector("#modalSignInBtn");
const modalSignUpBtn = document.querySelector("#modalSignUpBtn");
const modalDownloadBtn = document.querySelector("#modalDownloadBtn");
const modalEmailBtn = document.querySelector("#modalEmailBtn");
const authModalState = document.querySelector("#authModalState");
const deliveryState = document.querySelector("#deliveryState");
const prevPageBtn = document.querySelector("#prevPageBtn");
const nextPageBtn = document.querySelector("#nextPageBtn");
const finishLoginBtn = document.querySelector("#finishLoginBtn");
const storageKey = "curriculo-pro-data";
const cloudConfigKey = "curriculo-pro-cloud";
const supabaseUrl = "https://gzgsjodcbraglevopvjk.supabase.co";
const supabasePublicKey = "sb_publishable_RdwtaCaqPsrmLCnxgiV6Dw_-mSksim5";
const templates = ["classic", "modern", "compact", "executive", "portrait", "sidebar"];
const photoTemplates = ["portrait", "sidebar"];

const pages = ["personal", "profile", "experience", "education", "template", "finish"];
const pageNames = {
  personal: "Dados pessoais",
  profile: "Perfil e habilidades",
  experience: "Experiencia profissional",
  education: "Formacao",
  template: "Estilo visual",
  finish: "Conclusao"
};

let currentPage = "personal";
let photoData = "";
let cloudClient = null;
let cloudSession = null;
let cloudUser = null;
let cloudAuthListenerAttached = false;
const pendingPdfKey = "curriculo-pro-pending-pdf";
const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function isOauthCallback() {
  const params = new URLSearchParams(window.location.search);
  return params.has("code") || params.has("error") || params.has("access_token") || params.has("id_token");
}

const defaults = {
  name: "Seu Nome",
  role: "Cargo desejado",
  phone: "(65) 99999-9999",
  email: "voce@email.com",
  location: "Cuiaba, MT",
  link: "linkedin.com/in/seunome",
  summary: "Escreva um resumo curto sobre sua experiencia, area de atuacao e principais pontos fortes.",
  skills: "Atendimento ao cliente\nExcel intermediario\nRedes de computadores",
  experience: "Empresa - Cargo - Periodo\nDescreva suas principais atividades e resultados.",
  education: "Curso - Instituicao - Ano\nCertificacoes relevantes",
  template: "classic",
  style: "teal",
  photoData: "",
  page: "personal"
};

function emptyExperience() {
  return {
    company: "",
    role: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    current: false,
    description: ""
  };
}

function emptyEducation() {
  return {
    course: "",
    institution: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    current: false,
    details: ""
  };
}

function fieldValue(name) {
  return form.elements[name] ? form.elements[name].value : "";
}

function textOrDefault(value, fallback) {
  return value && value.trim() ? value.trim() : fallback;
}

function hasAnyValue(item) {
  return Object.values(item).some((value) => {
    return typeof value === "boolean" ? value : value && value.trim();
  });
}

function getDynamicItems(list, fields) {
  return Array.from(list.querySelectorAll(".dynamic-item")).map((item) => {
    return Object.fromEntries(fields.map((field) => {
      const input = item.querySelector(`[data-field="${field}"]`);
      if (!input) return [field, ""];
      return [field, input.type === "checkbox" ? input.checked : input.value];
    }));
  });
}

function getExperiences() {
  return getDynamicItems(experienceList, [
    "company",
    "role",
    "startMonth",
    "startYear",
    "endMonth",
    "endYear",
    "current",
    "description"
  ]);
}

function getEducations() {
  return getDynamicItems(educationList, [
    "course",
    "institution",
    "startMonth",
    "startYear",
    "endMonth",
    "endYear",
    "current",
    "details"
  ]);
}

function composePeriod(item) {
  const start = [item.startMonth, item.startYear].filter(Boolean).join(" ");
  const end = item.current ? "Atual" : [item.endMonth, item.endYear].filter(Boolean).join(" ");

  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  if (end) return end;
  return item.period || "";
}

function parsePeriodText(text) {
  const value = (text || "").trim();
  if (!value) return {};

  const currentMatch = value.match(/^(.+?)\s*-\s*atual$/i);
  if (currentMatch) {
    const [month, year] = currentMatch[1].trim().split(/\s+/);
    return { startMonth: month || "", startYear: year || "", current: true };
  }

  const rangeMatch = value.match(/^(.+?)\s*-\s*(.+)$/);
  if (rangeMatch) {
    const [startMonth, startYear] = rangeMatch[1].trim().split(/\s+/);
    const [endMonth, endYear] = rangeMatch[2].trim().split(/\s+/);
    return {
      startMonth: startMonth || "",
      startYear: startYear || "",
      endMonth: endMonth || "",
      endYear: endYear || "",
      current: false
    };
  }

  const [startMonth = "", startYear = ""] = value.split(/\s+/);
  return { startMonth, startYear };
}

function composeExperience(items) {
  return items
    .filter(hasAnyValue)
    .flatMap((item) => {
      const header = [item.company, item.role, composePeriod(item)].filter(Boolean).join(" - ");
      return [header, item.description].filter(Boolean);
    })
    .join("\n");
}

function composeEducation(items) {
  return items
    .filter(hasAnyValue)
    .flatMap((item) => {
      const header = [item.course, item.institution, composePeriod(item)].filter(Boolean).join(" - ");
      return [header, item.details].filter(Boolean);
    })
    .join("\n");
}

function getFormData() {
  const experiences = getExperiences();
  const educations = getEducations();
  const template = templates.find((name) => preview.classList.contains(name)) || "classic";
  const data = {
    name: fieldValue("name"),
    role: fieldValue("role"),
    phone: fieldValue("phone"),
    email: fieldValue("email"),
    location: fieldValue("location"),
    link: fieldValue("link"),
    summary: fieldValue("summary"),
    skills: fieldValue("skills"),
    experiences,
    educations,
    experience: composeExperience(experiences),
    education: composeEducation(educations),
    photoData,
    template,
    style: ["blue", "graphite", "wine"].find((style) => {
      return preview.classList.contains(`style-${style}`);
    }) || "teal",
    page: currentPage
  };

  return data;
}

function renderLines(target, value, fallback) {
  const lines = textOrDefault(value, fallback)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  target.replaceChildren(
    ...lines.map((line) => {
      const item = document.createElement("li");
      item.textContent = line;
      return item;
    })
  );
}

function renderBlock(target, value, fallback) {
  const lines = textOrDefault(value, fallback)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  target.replaceChildren(
    ...lines.map((line) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      return paragraph;
    })
  );
}

function render(data) {
  const header = document.querySelector(".resume-header");
  const nameNode = document.querySelector('[data-output="name"]');
  const roleNode = document.querySelector('[data-output="role"]');
  const contactNodes = document.querySelectorAll(".contact-list [data-output]");
  const hasHeaderContent = [data.name, data.role, data.phone, data.email, data.location, data.link, data.photoData]
    .some((value) => (value || "").trim());

  if (header) header.hidden = !hasHeaderContent;

  renderTextNode(nameNode, data.name);
  renderTextNode(roleNode, data.role);

  contactNodes.forEach((node) => {
    const key = node.dataset.output;
    renderTextNode(node, data[key]);
  });

  renderListSection(
    "skills",
    document.querySelector("[data-output-list='skills']"),
    data.skills
  );
  renderBlockSection(
    "experience",
    document.querySelector("[data-output-block='experience']"),
    data.experience
  );
  renderBlockSection(
    "education",
    document.querySelector("[data-output-block='education']"),
    data.education
  );
  renderPhoto(data.photoData || "");
  updateSkillButtons(data.skills || "");
  renderSuggestions(data);
  setSaveStatus("Salvo localmente", false);
}

function renderTextNode(node, value) {
  if (!node) return;

  const text = (value || "").trim();
  node.hidden = !text;
  node.textContent = text;
}

function updateSkillButtons(skillsText) {
  const selected = skillsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  skillOptions.querySelectorAll("[data-skill]").forEach((button) => {
    button.classList.toggle("selected", selected.includes(button.dataset.skill));
  });
}

function addSkill(skill) {
  const value = (skill || "").trim();
  if (!value) return;

  const currentSkills = skillsField.value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!currentSkills.includes(value)) {
    currentSkills.push(value);
    skillsField.value = currentSkills.join("\n");
  }

  updateSkillButtons(skillsField.value);
  saveAndRender();
}

function renderListSection(sectionName, target, value) {
  const section = target ? target.closest(`[data-preview-section="${sectionName}"]`) : null;
  const lines = (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (target) {
    target.replaceChildren(
      ...lines.map((line) => {
        const item = document.createElement("li");
        item.textContent = line;
        return item;
      })
    );
  }

  if (section) section.hidden = lines.length === 0;
}

function renderBlockSection(sectionName, target, value) {
  const section = target ? target.closest(`[data-preview-section="${sectionName}"]`) : null;
  const lines = (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (target) {
    target.replaceChildren(
      ...lines.map((line) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = line;
        return paragraph;
      })
    );
  }

  if (section) section.hidden = lines.length === 0;
}

function renderPhoto(src) {
  photoData = src;
  preview.classList.toggle("no-photo", !src);

  if (src) {
    resumePhoto.src = src;
    photoThumb.replaceChildren(Object.assign(document.createElement("img"), {
      src,
      alt: "Foto selecionada"
    }));
    return;
  }

  resumePhoto.removeAttribute("src");
  photoThumb.textContent = "Sem foto";
}

function createInput(labelText, field, value, placeholder, multiline = false) {
  const label = document.createElement("label");
  const control = multiline ? document.createElement("textarea") : document.createElement("input");

  label.textContent = labelText;
  control.dataset.field = field;
  control.value = value || "";
  control.placeholder = placeholder;
  if (multiline) control.rows = 3;
  label.append(control);

  return label;
}

function createSelect(labelText, field, value, options, placeholder) {
  const label = document.createElement("label");
  const select = document.createElement("select");
  const empty = document.createElement("option");

  label.textContent = labelText;
  select.dataset.field = field;
  empty.value = "";
  empty.textContent = placeholder;
  select.append(empty);

  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    select.append(item);
  });

  select.value = value || "";
  label.append(select);

  return label;
}

function createCurrentCheckbox(value) {
  const label = document.createElement("label");
  const input = document.createElement("input");

  label.className = "period-current";
  input.type = "checkbox";
  input.dataset.field = "current";
  input.checked = Boolean(value);
  label.append(input, "Atual");

  return label;
}

function createPeriodGroup(item) {
  const years = Array.from({ length: 50 }, (_, index) => String(new Date().getFullYear() - index));
  const group = document.createElement("div");
  const title = document.createElement("p");
  const grid = document.createElement("div");

  group.className = "period-group";
  title.className = "period-title";
  title.textContent = "Periodo";
  grid.className = "period-grid";
  grid.append(
    createSelect("Mes de ingresso", "startMonth", item.startMonth, months, "Mes"),
    createSelect("Ano de ingresso", "startYear", item.startYear, years, "Ano"),
    createSelect("Mes de saida", "endMonth", item.endMonth, months, "Mes"),
    createSelect("Ano de saida", "endYear", item.endYear, years, "Ano")
  );
  group.append(title, grid, createCurrentCheckbox(item.current));

  togglePeriodEndFields(group);

  return group;
}

function togglePeriodEndFields(scope) {
  const current = scope.querySelector('[data-field="current"]');
  const endMonth = scope.querySelector('[data-field="endMonth"]');
  const endYear = scope.querySelector('[data-field="endYear"]');
  const disabled = Boolean(current && current.checked);

  [endMonth, endYear].forEach((field) => {
    if (!field) return;
    field.disabled = disabled;
    if (disabled) field.value = "";
  });
}

function renderExperienceEditor(items) {
  const safeItems = items && items.length ? items : [emptyExperience()];

  experienceList.replaceChildren(...safeItems.map((item, index) => {
    const wrapper = document.createElement("div");
    const header = document.createElement("div");
    const title = document.createElement("h3");
    const remove = document.createElement("button");

    wrapper.className = "dynamic-item";
    wrapper.dataset.type = "experience";
    wrapper.dataset.index = String(index);
    header.className = "dynamic-item-head";
    title.textContent = `Experiencia ${index + 1}`;
    remove.className = "ghost-button remove-item";
    remove.type = "button";
    remove.dataset.remove = "experience";
    remove.dataset.index = String(index);
    remove.textContent = "Remover";

    header.append(title, remove);
    wrapper.append(
      header,
      createInput("Empresa", "company", item.company, "Nome da empresa"),
      createInput("Cargo", "role", item.role, "Seu cargo"),
      createPeriodGroup(item),
      createInput("Atividades e resultados", "description", item.description, "Descreva responsabilidades, resultados e ferramentas usadas.", true)
    );

    return wrapper;
  }));
}

function renderEducationEditor(items) {
  const safeItems = items && items.length ? items : [emptyEducation()];

  educationList.replaceChildren(...safeItems.map((item, index) => {
    const wrapper = document.createElement("div");
    const header = document.createElement("div");
    const title = document.createElement("h3");
    const remove = document.createElement("button");

    wrapper.className = "dynamic-item";
    wrapper.dataset.type = "education";
    wrapper.dataset.index = String(index);
    header.className = "dynamic-item-head";
    title.textContent = `Formacao ${index + 1}`;
    remove.className = "ghost-button remove-item";
    remove.type = "button";
    remove.dataset.remove = "education";
    remove.dataset.index = String(index);
    remove.textContent = "Remover";

    header.append(title, remove);
    wrapper.append(
      header,
      createInput("Curso", "course", item.course, "Nome do curso"),
      createInput("Instituicao", "institution", item.institution, "Nome da instituicao"),
      createPeriodGroup(item),
      createInput("Detalhes", "details", item.details, "Certificacoes, status ou observacoes relevantes.", true)
    );

    return wrapper;
  }));
}

function setTemplate(template) {
  preview.classList.remove(...templates);
  preview.classList.add(template);

  templateButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.template === template);
  });
}

function setStyle(style) {
  preview.classList.remove("style-teal", "style-blue", "style-graphite", "style-wine");
  preview.classList.add(`style-${style}`);

  styleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.style === style);
  });
}

function updatePageUi() {
  const pageIndex = pages.indexOf(currentPage);

  pagePanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.pagePanel === currentPage);
  });

  document.body.classList.toggle("is-finished", currentPage === "finish");
  currentStepTitle.textContent = pageNames[currentPage];
  stepCounter.textContent = `${pageIndex + 1} de ${pages.length}`;
  progressBar.style.width = `${((pageIndex + 1) / pages.length) * 100}%`;
  prevPageBtn.disabled = pageIndex === 0;
  nextPageBtn.textContent = currentPage === "finish" ? "Salvar em PDF" : "Avancar";
}

function setPage(page) {
  currentPage = page;
  updatePageUi();
  saveAndRender();
}

function countFilled(values) {
  return values.filter((value) => value && value.trim()).length;
}

function getSuggestions(data) {
  const summaryWords = textOrDefault(data.summary, "").split(/\s+/).filter(Boolean).length;
  const skills = textOrDefault(data.skills, "").split("\n").filter((line) => line.trim());
  const experience = textOrDefault(data.experience, "");
  const education = textOrDefault(data.education, "");
  const suggestionsByPage = {
    personal: [],
    profile: [],
    experience: [],
    education: [],
    template: [],
    finish: []
  };

  if (!data.name || data.name.trim().split(/\s+/).length < 2) {
    suggestionsByPage.personal.push("Use nome e sobrenome para deixar o curriculo mais profissional.");
  }

  if (!data.role || data.role.trim().length < 4) {
    suggestionsByPage.personal.push("Preencha o cargo desejado para direcionar melhor a leitura do recrutador.");
  }

  if (countFilled([data.phone, data.email, data.location]) < 2) {
    suggestionsByPage.personal.push("Inclua pelo menos telefone, e-mail e cidade para facilitar o contato.");
  }

  if (data.email && !data.email.includes("@")) {
    suggestionsByPage.personal.push("Revise o e-mail: ele parece estar sem o simbolo @.");
  }

  if (summaryWords < 18) {
    suggestionsByPage.profile.push("Escreva um resumo com 2 ou 3 frases, citando area de atuacao, experiencia e principais pontos fortes.");
  }

  if (summaryWords > 80) {
    suggestionsByPage.profile.push("Seu resumo esta longo. Tente deixar entre 30 e 70 palavras.");
  }

  if (skills.length < 4) {
    suggestionsByPage.profile.push("Adicione mais habilidades tecnicas e comportamentais, uma por linha.");
  }

  if (!data.experiences.some(hasAnyValue)) {
    suggestionsByPage.experience.push("Adicione pelo menos uma experiencia profissional, estagio, projeto ou trabalho autonomo.");
  }

  if (experience && !/resultado|reduzi|aumentei|melhorei|organizei|implantei|atendi|responsavel/i.test(experience)) {
    suggestionsByPage.experience.push("Nas experiencias, cite resultados ou responsabilidades concretas, como atendimento, organizacao, implantacao ou melhorias.");
  }

  if (!data.educations.some(hasAnyValue)) {
    suggestionsByPage.education.push("Adicione sua formacao principal, cursos ou certificacoes relevantes.");
  }

  if (education && !/\d{4}|atual|cursando|concluido/i.test(education)) {
    suggestionsByPage.education.push("Inclua ano, periodo, 'cursando' ou 'concluido' na formacao.");
  }

  suggestionsByPage.template.push("Use Classico, Moderno, Compacto ou Executivo quando nao quiser foto no curriculo.");
  suggestionsByPage.template.push("Use Com foto ou Foto lateral quando a vaga pedir apresentacao visual ou quando a foto fizer sentido para a area.");
  if (!data.photoData) {
    suggestionsByPage.template.push("Adicione uma foto profissional para visualizar os modelos com foto.");
  }
  suggestionsByPage.template.push("Escolha uma cor discreta. Verde e azul funcionam bem para a maioria das vagas; grafite fica mais formal.");
  suggestionsByPage.finish.push("Revise telefone, e-mail, datas e ortografia antes de salvar em PDF.");
  suggestionsByPage.finish.push("Se o curriculo passar de uma pagina, use o modelo Compacto ou reduza textos repetidos.");

  Object.keys(suggestionsByPage).forEach((page) => {
    if (!suggestionsByPage[page].length) {
      suggestionsByPage[page].push("Esta etapa esta bem preenchida. Revise ortografia, datas e consistencia antes de gerar o PDF.");
    }
  });

  return suggestionsByPage;
}

function renderSuggestions(data) {
  const suggestions = getSuggestions(data)[currentPage] || [];

  suggestionTitle.textContent = pageNames[currentPage];
  suggestionList.replaceChildren(
    ...suggestions.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    })
  );
}

function saveAndRender() {
  const data = getFormData();
  localStorage.setItem(storageKey, JSON.stringify(data));
  setSaveStatus("Alteracoes salvas", false);
  render(data);
}

function setSaveStatus(text, dirty) {
  if (!saveStatus) return;
  saveStatus.textContent = text;
  document.body.classList.toggle("status-dirty", Boolean(dirty));
}

function setCloudState(text) {
  if (authModalState) authModalState.textContent = text;
}

function setCloudUserLabel(text) {
  return text;
}

function setAuthModalState(text) {
  if (authModalState) authModalState.textContent = text;
}

function openAuthModal() {
  if (!authOverlay) return;
  authOverlay.hidden = false;
  if (cloudReady()) {
    showDeliveryOptions();
    return;
  }
  authStep.hidden = false;
  deliveryStep.hidden = true;
  setAuthModalState(cloudClient ? "Entre ou crie sua conta para seguir." : "A autenticação ainda não foi configurada.");
  modalAuthPassword.value = "";
  modalAuthEmail.focus();
}

function showDeliveryOptions() {
  authStep.hidden = true;
  deliveryStep.hidden = false;
  deliveryState.textContent = cloudUser?.email ? `Conta: ${cloudUser.email}` : "";
}

function closeAuthModal() {
  if (!authOverlay) return;
  authOverlay.hidden = true;
}

function getCloudConfig() {
  try {
    return JSON.parse(localStorage.getItem(cloudConfigKey) || "{}");
  } catch {
    return {};
  }
}

function saveCloudConfig(config) {
  localStorage.setItem(cloudConfigKey, JSON.stringify(config));
}

function initCloudClient() {
  const savedConfig = getCloudConfig();
  const config = {
    url: supabaseUrl,
    key: supabasePublicKey || savedConfig.key
  };
  if (!config.key || !window.supabase?.createClient) {
    cloudClient = null;
    cloudSession = null;
    cloudUser = null;
    cloudAuthListenerAttached = false;
    setCloudState("Offline");
    setCloudUserLabel("Nenhuma conta conectada");
    return;
  }

  cloudClient = window.supabase.createClient(config.url, config.key);
  cloudAuthListenerAttached = false;
  setCloudState(cloudSession ? `Online: ${cloudUser?.email || "logado"}` : "Conectado");
  setCloudUserLabel(cloudSession?.user?.email ? `Conta: ${cloudSession.user.email}` : "Nenhuma conta conectada");

  cloudClient.auth.getSession().then(({ data }) => {
    cloudSession = data.session || null;
    cloudUser = cloudSession?.user || null;
    setCloudState(cloudSession ? `Online: ${cloudUser?.email || "logado"}` : "Conectado");
    setCloudUserLabel(cloudUser?.email ? `Conta: ${cloudUser.email}` : "Nenhuma conta conectada");
    resumePendingPdfIfReady();
  });

  if (!cloudAuthListenerAttached) {
    cloudClient.auth.onAuthStateChange((_event, session) => {
      cloudSession = session;
      cloudUser = session?.user || null;
      setCloudState(cloudSession ? `Online: ${cloudUser?.email || "logado"}` : "Conectado");
      setCloudUserLabel(cloudUser?.email ? `Conta: ${cloudUser.email}` : "Nenhuma conta conectada");
      resumePendingPdfIfReady();
    });
    cloudAuthListenerAttached = true;
  }
}

function cloudReady() {
  return Boolean(cloudClient && cloudSession?.user?.id);
}

function resumePendingPdfIfReady() {
  const pending = sessionStorage.getItem(pendingPdfKey) === "choose-delivery";
  if (!pending || !cloudReady() || !cloudSession) return false;
  sessionStorage.removeItem(pendingPdfKey);
  authOverlay.hidden = false;
  showDeliveryOptions();
  return true;
}

async function signInWithPassword(email, password) {
  if (!cloudClient) {
    setAuthModalState("A autenticação ainda não foi configurada.");
    return false;
  }
  if (!email || !password) {
    setAuthModalState("Informe seu e-mail e sua senha.");
    return false;
  }

  const result = await cloudClient.auth.signInWithPassword({ email, password });
  if (result.error) {
    setCloudState(`Erro no login: ${result.error.message}`);
    setAuthModalState(`Erro no login: ${result.error.message}`);
    return false;
  }

  saveCloudConfig({ ...getCloudConfig(), email });
  setCloudState("Login realizado");
  setAuthModalState("Login realizado");
  cloudSession = result.data.session || cloudSession;
  cloudUser = result.data.user || cloudSession?.user || cloudUser;
  showDeliveryOptions();
  return true;
}

async function signUpWithPassword(email, password) {
  if (!cloudClient) {
    setAuthModalState("A autenticação ainda não foi configurada.");
    return false;
  }
  if (!email || !password) {
    setAuthModalState("Informe seu e-mail e crie uma senha.");
    return false;
  }

  const result = await cloudClient.auth.signUp({ email, password });
  if (result.error) {
    setCloudState(`Erro ao criar conta: ${result.error.message}`);
    setAuthModalState(`Erro ao criar conta: ${result.error.message}`);
    return false;
  }

  saveCloudConfig({ ...getCloudConfig(), email });
  setCloudState("Conta criada");
  cloudSession = result.data.session || cloudSession;
  cloudUser = result.data.user || cloudSession?.user || cloudUser;
  if (cloudSession) {
    showDeliveryOptions();
  } else {
    setAuthModalState("Conta criada. Confirme o e-mail e depois faça login.");
  }
  return true;
}

async function signInWithProvider(provider) {
  if (!cloudClient) {
    setAuthModalState("A autenticação ainda não foi configurada.");
    return false;
  }

  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const result = await cloudClient.auth.signInWithOAuth({
    provider,
    options: { redirectTo }
  });

  if (result.error) {
    setCloudState(`Erro no ${provider}: ${result.error.message}`);
    setAuthModalState(`Erro no ${provider}: ${result.error.message}`);
    return false;
  }

  sessionStorage.setItem(pendingPdfKey, "choose-delivery");
  setAuthModalState(`Abrindo ${provider}...`);
  return true;
}

async function handlePdfAccess() {
  sessionStorage.setItem(pendingPdfKey, "choose-delivery");
  openAuthModal();
}

function getResumeFileName() {
  const name = (fieldValue("name") || "curriculo")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");

  return `${name || "curriculo"}.pdf`;
}

function sendResumeByEmail() {
  const recipient = (cloudUser?.email || modalAuthEmail.value || "").trim();
  if (!recipient) {
    setAuthModalState("Informe um e-mail para receber o material.");
    return;
  }

  const subject = encodeURIComponent("Seu currículo do Curriculo Pro");
  const body = encodeURIComponent(
    [
      "Seu currículo foi preparado no Curriculo Pro.",
      "",
      "Abra o site para revisar e gerar o PDF.",
      `Arquivo sugerido: ${getResumeFileName()}`
    ].join("\n")
  );

  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
}

function hydrateForm(data) {
  ["name", "role", "phone", "email", "location", "link", "summary", "skills"].forEach((key) => {
    const field = form.elements[key];
    if (field) field.value = data[key] || "";
  });

  renderExperienceEditor(normalizeExperienceItems(data.experiences || parseLegacyExperience(data.experience)));
  renderEducationEditor(normalizeEducationItems(data.educations || parseLegacyEducation(data.education)));
  setTemplate(templates.includes(data.template) ? data.template : "classic");
  setStyle(data.style || "teal");
  photoData = data.photoData || "";
  renderPhoto(photoData);
  currentPage = pages.includes(data.page) ? data.page : "personal";
  updatePageUi();
  render(getFormData());
  localStorage.setItem(storageKey, JSON.stringify(getFormData()));
}

function parseLegacyExperience(text) {
  if (!text || !text.trim()) return [emptyExperience()];
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const [company = "", role = "", period = ""] = (lines[0] || "").split(" - ");
  return [{
    ...emptyExperience(),
    company,
    role,
    ...parsePeriodText(period),
    description: lines.slice(1).join("\n")
  }];
}

function parseLegacyEducation(text) {
  if (!text || !text.trim()) return [emptyEducation()];
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const [course = "", institution = "", period = ""] = (lines[0] || "").split(" - ");
  return [{
    ...emptyEducation(),
    course,
    institution,
    ...parsePeriodText(period),
    details: lines.slice(1).join("\n")
  }];
}

function normalizeExperienceItems(items) {
  if (!Array.isArray(items) || !items.length) {
    return [emptyExperience()];
  }

  return items.map((item) => ({
    ...emptyExperience(),
    ...item,
    ...parsePeriodText(item.period)
  }));
}

function normalizeEducationItems(items) {
  if (!Array.isArray(items) || !items.length) {
    return [emptyEducation()];
  }

  return items.map((item) => ({
    ...emptyEducation(),
    ...item,
    ...parsePeriodText(item.period)
  }));
}

function loadSavedData() {
  const saved = localStorage.getItem(storageKey);
  const data = saved ? { ...defaults, ...JSON.parse(saved) } : {
    template: defaults.template,
    style: defaults.style,
    page: defaults.page,
    experiences: [emptyExperience()],
    educations: [emptyEducation()]
  };

  ["name", "role", "phone", "email", "location", "link", "summary", "skills"].forEach((key) => {
    const field = form.elements[key];
    if (field) field.value = data[key] === defaults[key] ? "" : data[key] || "";
  });

  hydrateForm(data);
  setSaveStatus("Pronto para editar", false);
}

if (authOverlay) {
  authOverlay.hidden = true;
}

if (!isOauthCallback()) {
  sessionStorage.removeItem(pendingPdfKey);
}

form.addEventListener("input", saveAndRender);

form.addEventListener("change", (event) => {
  const field = event.target.closest('[data-field="current"]');
  if (field) {
    const item = field.closest(".dynamic-item");
    if (item) togglePeriodEndFields(item);
  }
  saveAndRender();
});

skillOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-skill]");
  if (!button) return;

  addSkill(button.dataset.skill);
});

addCustomSkillBtn.addEventListener("click", () => {
  addSkill(customSkillInput.value);
  customSkillInput.value = "";
  customSkillInput.focus();
});

customSkillInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addSkill(customSkillInput.value);
  customSkillInput.value = "";
});

templateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setTemplate(button.dataset.template);
    saveAndRender();
  });
});

styleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setStyle(button.dataset.style);
    saveAndRender();
  });
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    photoData = String(reader.result || "");
    if (!photoTemplates.includes(getFormData().template)) {
      setTemplate("portrait");
    }
    saveAndRender();
  });
  reader.readAsDataURL(file);
});

removePhotoBtn.addEventListener("click", () => {
  photoData = "";
  photoInput.value = "";
  renderPhoto("");
  saveAndRender();
});

addExperienceBtn.addEventListener("click", () => {
  renderExperienceEditor([...getExperiences(), emptyExperience()]);
  saveAndRender();
});

addEducationBtn.addEventListener("click", () => {
  renderEducationEditor([...getEducations(), emptyEducation()]);
  saveAndRender();
});

form.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;

  const index = Number(button.dataset.index);
  if (button.dataset.remove === "experience") {
    const items = getExperiences().filter((_, itemIndex) => itemIndex !== index);
    renderExperienceEditor(items.length ? items : [emptyExperience()]);
  }

  if (button.dataset.remove === "education") {
    const items = getEducations().filter((_, itemIndex) => itemIndex !== index);
    renderEducationEditor(items.length ? items : [emptyEducation()]);
  }

  saveAndRender();
});

prevPageBtn.addEventListener("click", () => {
  const index = pages.indexOf(currentPage);
  if (index > 0) setPage(pages[index - 1]);
});

nextPageBtn.addEventListener("click", () => {
  const index = pages.indexOf(currentPage);
  if (currentPage === "finish") {
    printResume();
    return;
  }

  setPage(pages[index + 1]);
});

function printResume() {
  currentPage = "finish";
  updatePageUi();
  saveAndRender();
  handlePdfAccess().catch(() => {});
}

printBtn.addEventListener("click", () => {
  currentPage = "finish";
  updatePageUi();
  saveAndRender();
});
if (finishPrintBtn) {
  finishPrintBtn.addEventListener("click", () => {
    currentPage = "finish";
    updatePageUi();
    saveAndRender();
    handlePdfAccess().catch(() => {});
  });
}

finishLoginBtn.addEventListener("click", () => {
  currentPage = "finish";
  updatePageUi();
  saveAndRender();
  handlePdfAccess().catch(() => {});
});

closeAuthModalBtn.addEventListener("click", closeAuthModal);
authOverlay.addEventListener("click", (event) => {
  if (event.target === authOverlay) closeAuthModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && authOverlay && !authOverlay.hidden) {
    closeAuthModal();
  }
});

googleAuthBtn.addEventListener("click", () => {
  signInWithProvider("google").catch(() => {});
});

facebookAuthBtn.addEventListener("click", () => {
  signInWithProvider("facebook").catch(() => {});
});

modalSignInBtn.addEventListener("click", () => {
  signInWithPassword(modalAuthEmail.value.trim(), modalAuthPassword.value);
});

modalSignUpBtn.addEventListener("click", () => {
  signUpWithPassword(modalAuthEmail.value.trim(), modalAuthPassword.value);
});

modalDownloadBtn.addEventListener("click", () => {
  closeAuthModal();
  window.setTimeout(() => window.print(), 100);
});

modalEmailBtn.addEventListener("click", () => {
  sendResumeByEmail();
});

clearBtn.addEventListener("click", () => {
  form.reset();
  renderExperienceEditor([emptyExperience()]);
  renderEducationEditor([emptyEducation()]);
  setTemplate("classic");
  setStyle("teal");
  photoData = "";
  photoInput.value = "";
  renderPhoto("");
  currentPage = "personal";
  updatePageUi();
  localStorage.removeItem(storageKey);
  render(getFormData());
  setSaveStatus("Pronto para editar", false);
});

loadSavedData();
initCloudClient();
