const form = document.querySelector("#resumeForm");
const preview = document.querySelector("#resumePreview");
const printBtn = document.querySelector("#printBtn");
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
const deliveryOverlay = document.querySelector("#deliveryOverlay");
const closeDeliveryModalBtn = document.querySelector("#closeDeliveryModalBtn");
const modalDownloadBtn = document.querySelector("#modalDownloadBtn");
const modalEmailBtn = document.querySelector("#modalEmailBtn");
const deliveryState = document.querySelector("#deliveryState");
const prevPageBtn = document.querySelector("#prevPageBtn");
const nextPageBtn = document.querySelector("#nextPageBtn");
const finishDeliveryBtn = document.querySelector("#finishDeliveryBtn");
const startEditorButtons = document.querySelectorAll("[data-start-editor]");
const backLandingBtn = document.querySelector("#backLandingBtn");
const landingModelButtons = document.querySelectorAll("[data-landing-template]");
const landingStyleButtons = document.querySelectorAll("[data-landing-style]");
const landingModelPreview = document.querySelector("#landingModelPreview");
const landingModelName = document.querySelector("#landingModelName");
const useSelectedModelBtn = document.querySelector("#useSelectedModelBtn");
const modelOptions = document.querySelector("#modelOptions");
const previousModelBtn = document.querySelector("#previousModelBtn");
const nextModelBtn = document.querySelector("#nextModelBtn");
const modelCarouselDots = document.querySelector("#modelCarouselDots");
const editorStepButtons = document.querySelectorAll("[data-step-target]");
const templates = ["classic", "modern", "compact", "executive", "portrait", "sidebar"];
const photoTemplates = ["portrait", "sidebar"];

const pages = ["personal", "profile", "experience", "education", "template", "finish"];
const pageNames = {
  personal: "Dados pessoais",
  profile: "Perfil e habilidades",
  experience: "Experiência profissional",
  education: "Formação",
  template: "Estilo visual",
  finish: "Conclusão"
};

let currentPage = "personal";
let photoData = "";
let selectedLandingTemplate = "classic";
let selectedLandingStyle = "teal";
const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const landingModelNames = {
  classic: "Clássico",
  modern: "Moderno",
  compact: "Compacto",
  executive: "Executivo",
  portrait: "Com foto",
  sidebar: "Foto lateral"
};

function updateLandingModelPreview() {
  if (!landingModelPreview) return;

  landingModelPreview.classList.add("changing");
  window.setTimeout(() => {
    landingModelPreview.classList.remove(
      ...templates,
      "style-teal",
      "style-blue",
      "style-graphite",
      "style-wine"
    );
    landingModelPreview.classList.add(selectedLandingTemplate, `style-${selectedLandingStyle}`);
    landingModelPreview.classList.remove("changing");
  }, 100);

  if (landingModelName) {
    landingModelName.textContent = landingModelNames[selectedLandingTemplate];
  }

  landingModelButtons.forEach((button) => {
    const active = button.dataset.landingTemplate === selectedLandingTemplate;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  landingStyleButtons.forEach((button) => {
    const active = button.dataset.landingStyle === selectedLandingStyle;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (modelCarouselDots) {
    modelCarouselDots.querySelectorAll("button").forEach((dot) => {
      dot.classList.toggle("active", dot.dataset.template === selectedLandingTemplate);
    });
  }
}

function selectLandingModel(template, centerCard = true) {
  if (!templates.includes(template)) return;
  selectedLandingTemplate = template;
  updateLandingModelPreview();

  if (!centerCard || !modelOptions) return;
  const card = modelOptions.querySelector(`[data-landing-template="${template}"]`);
  if (!card) return;

  const left = card.offsetLeft - (modelOptions.clientWidth - card.offsetWidth) / 2;
  modelOptions.scrollTo({ left, behavior: "smooth" });
}

function moveLandingModel(direction) {
  const currentIndex = templates.indexOf(selectedLandingTemplate);
  const nextIndex = (currentIndex + direction + templates.length) % templates.length;
  selectLandingModel(templates[nextIndex]);
}

function createModelCarouselDots() {
  if (!modelCarouselDots) return;

  modelCarouselDots.replaceChildren(...templates.map((template) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.dataset.template = template;
    dot.className = template === selectedLandingTemplate ? "active" : "";
    dot.setAttribute("aria-label", `Ver modelo ${landingModelNames[template]}`);
    dot.addEventListener("click", () => selectLandingModel(template));
    return dot;
  }));
}

function showEditor(updateHistory = true) {
  document.body.classList.remove("landing-mode");
  document.body.classList.add("editor-open");

  if (updateHistory && window.location.hash !== "#editor") {
    window.history.pushState({ view: "editor" }, "", "#editor");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  window.setTimeout(() => {
    const firstField = form.querySelector("input:not([type='file'])");
    if (firstField) firstField.focus({ preventScroll: true });
  }, 250);
}

function showLanding(updateHistory = true) {
  document.body.classList.remove("editor-open", "is-finished");
  document.body.classList.add("landing-mode");
  closeDeliveryModal();

  if (updateHistory) {
    window.history.pushState({ view: "landing" }, "", window.location.pathname);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

const defaults = {
  name: "Seu Nome",
  role: "Cargo desejado",
  phone: "(65) 99999-9999",
  email: "voce@email.com",
  location: "Cuiabá, MT",
  link: "linkedin.com/in/seunome",
  summary: "Escreva um resumo curto sobre sua experiência, área de atuação e principais pontos fortes.",
  skills: "Atendimento ao cliente\nExcel intermediário\nRedes de computadores",
  experience: "Empresa - Cargo - Período\nDescreva suas principais atividades e resultados.",
  education: "Curso - Instituição - Ano\nCertificações relevantes",
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

export function getFormData() {
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
  const hasResumeContent = [
    data.name,
    data.role,
    data.phone,
    data.email,
    data.location,
    data.link,
    data.summary,
    data.skills,
    data.experience,
    data.education,
    data.photoData
  ].some((value) => (value || "").trim());
  const hasHeaderContent = [data.name, data.role, data.phone, data.email, data.location, data.link, data.photoData]
    .some((value) => (value || "").trim());

  preview.classList.toggle("is-empty", !hasResumeContent);
  if (header) header.hidden = !hasHeaderContent;

  renderTextNode(nameNode, data.name);
  renderTextNode(roleNode, data.role);

  contactNodes.forEach((node) => {
    const key = node.dataset.output;
    renderTextNode(node, data[key]);
  });

  renderTextSection(
    "summary",
    document.querySelector('[data-output="summary"]'),
    data.summary
  );
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

function renderTextSection(sectionName, target, value) {
  const section = target ? target.closest(`[data-preview-section="${sectionName}"]`) : null;
  const text = (value || "").trim();

  if (target) {
    target.textContent = text;
  }

  if (section) {
    section.hidden = !text;
  }
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
  title.textContent = "Período";
  grid.className = "period-grid";
  grid.append(
    createSelect("Mês de ingresso", "startMonth", item.startMonth, months, "Mês"),
    createSelect("Ano de ingresso", "startYear", item.startYear, years, "Ano"),
    createSelect("Mês de saída", "endMonth", item.endMonth, months, "Mês"),
    createSelect("Ano de saída", "endYear", item.endYear, years, "Ano")
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
    title.textContent = `Experiência ${index + 1}`;
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
    title.textContent = `Formação ${index + 1}`;
    remove.className = "ghost-button remove-item";
    remove.type = "button";
    remove.dataset.remove = "education";
    remove.dataset.index = String(index);
    remove.textContent = "Remover";

    header.append(title, remove);
    wrapper.append(
      header,
      createInput("Curso", "course", item.course, "Nome do curso"),
      createInput("Instituição", "institution", item.institution, "Nome da instituição"),
      createPeriodGroup(item),
      createInput("Detalhes", "details", item.details, "Certificações, status ou observações relevantes.", true)
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
  nextPageBtn.textContent = currentPage === "finish" ? "Salvar em PDF" : "Avançar";

  editorStepButtons.forEach((button, index) => {
    const isActive = button.dataset.stepTarget === currentPage;
    button.classList.toggle("active", isActive);
    button.classList.toggle("completed", index < pageIndex);
    button.setAttribute("aria-current", isActive ? "step" : "false");
  });
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
    suggestionsByPage.personal.push("Use nome e sobrenome para deixar o currículo mais profissional.");
  }

  if (!data.role || data.role.trim().length < 4) {
    suggestionsByPage.personal.push("Preencha o cargo desejado para direcionar melhor a leitura do recrutador.");
  }

  if (countFilled([data.phone, data.email, data.location]) < 2) {
    suggestionsByPage.personal.push("Inclua pelo menos telefone, e-mail e cidade para facilitar o contato.");
  }

  if (data.email && !data.email.includes("@")) {
    suggestionsByPage.personal.push("Revise o e-mail: ele parece estar sem o símbolo @.");
  }

  if (summaryWords < 18) {
    suggestionsByPage.profile.push("Escreva um resumo com 2 ou 3 frases, citando área de atuação, experiência e principais pontos fortes.");
  }

  if (summaryWords > 80) {
    suggestionsByPage.profile.push("Seu resumo está longo. Tente deixar entre 30 e 70 palavras.");
  }

  if (skills.length < 4) {
    suggestionsByPage.profile.push("Adicione mais habilidades técnicas e comportamentais, uma por linha.");
  }

  if (!data.experiences.some(hasAnyValue)) {
    suggestionsByPage.experience.push("Adicione pelo menos uma experiência profissional, estágio, projeto ou trabalho autônomo.");
  }

  if (experience && !/resultado|reduzi|aumentei|melhorei|organizei|implantei|atendi|respons[aá]vel/i.test(experience)) {
    suggestionsByPage.experience.push("Nas experiências, cite resultados ou responsabilidades concretas, como atendimento, organização, implantação ou melhorias.");
  }

  if (!data.educations.some(hasAnyValue)) {
    suggestionsByPage.education.push("Adicione sua formação principal, cursos ou certificações relevantes.");
  }

  if (education && !/\d{4}|atual|cursando|conclu[ií]do/i.test(education)) {
    suggestionsByPage.education.push("Inclua ano, período, “cursando” ou “concluído” na formação.");
  }

  suggestionsByPage.template.push("Use Clássico, Moderno, Compacto ou Executivo quando não quiser foto no currículo.");
  suggestionsByPage.template.push("Use Com foto ou Foto lateral quando a vaga pedir apresentação visual ou quando a foto fizer sentido para a área.");
  if (!data.photoData) {
    suggestionsByPage.template.push("Adicione uma foto profissional para visualizar os modelos com foto.");
  }
  suggestionsByPage.template.push("Escolha uma cor discreta. Verde e azul funcionam bem para a maioria das vagas; grafite fica mais formal.");
  suggestionsByPage.finish.push("Revise telefone, e-mail, datas e ortografia antes de salvar em PDF.");
  suggestionsByPage.finish.push("Se o currículo passar de uma página, use o modelo Compacto ou reduza textos repetidos.");

  Object.keys(suggestionsByPage).forEach((page) => {
    if (!suggestionsByPage[page].length) {
      suggestionsByPage[page].push("Esta etapa está bem preenchida. Revise ortografia, datas e consistência antes de gerar o PDF.");
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
  setSaveStatus("Alterações desta sessão", false);
  render(data);
}

function setSaveStatus(text, dirty) {
  if (!saveStatus) return;
  saveStatus.textContent = text;
  document.body.classList.toggle("status-dirty", Boolean(dirty));
}

function openDeliveryModal() {
  if (!deliveryOverlay) return;
  deliveryState.textContent = "";
  deliveryOverlay.hidden = false;
}

function closeDeliveryModal() {
  if (!deliveryOverlay) return;
  deliveryOverlay.hidden = true;
}

function getResumeFileName() {
  const name = (fieldValue("name") || "curriculo")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");

  return `${name || "curriculo"}.pdf`;
}

async function createResumePdf() {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ]);

  const canvas = await html2canvas(preview, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false
  });
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = canvas.height * pageWidth / canvas.width;
  const image = canvas.toDataURL("image/jpeg", 0.94);

  let remainingHeight = imageHeight;
  let position = 0;
  pdf.addImage(image, "JPEG", 0, position, pageWidth, imageHeight, undefined, "FAST");
  remainingHeight -= pageHeight;

  while (remainingHeight > 0) {
    position = remainingHeight - imageHeight;
    pdf.addPage();
    pdf.addImage(image, "JPEG", 0, position, pageWidth, imageHeight, undefined, "FAST");
    remainingHeight -= pageHeight;
  }

  return pdf;
}

async function sendResumeByEmail() {
  deliveryState.textContent = "Gerando e enviando o PDF...";
  modalEmailBtn.disabled = true;

  try {
    const pdf = await createResumePdf();
    const pdfBase64 = pdf.output("datauristring").split(",")[1];
    const response = await fetch("/api/send-resume", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: getResumeFileName(),
        pdfBase64
      })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.error || "Não foi possível enviar o currículo.");
    }
    deliveryState.textContent = "Currículo enviado para o e-mail da sua conta.";
  } catch (error) {
    deliveryState.textContent = error.message || "Não foi possível enviar o currículo.";
  } finally {
    modalEmailBtn.disabled = false;
  }
}

export function hydrateForm(data) {
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

function loadInitialData() {
  const data = {
    template: defaults.template,
    style: defaults.style,
    page: defaults.page,
    experiences: [emptyExperience()],
    educations: [emptyEducation()]
  };

  ["name", "role", "phone", "email", "location", "link", "summary", "skills"].forEach((key) => {
    const field = form.elements[key];
    if (field) field.value = "";
  });

  hydrateForm(data);
  setSaveStatus("Pronto para editar", false);
}

export function startNewResume() {
  loadInitialData();
  showEditor();
}

export function openEditor() {
  showEditor();
}

if (deliveryOverlay) {
  deliveryOverlay.hidden = true;
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

editorStepButtons.forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.stepTarget));
});

function printResume() {
  currentPage = "finish";
  updatePageUi();
  saveAndRender();
  openDeliveryModal();
}

printBtn.addEventListener("click", () => {
  currentPage = "finish";
  updatePageUi();
  saveAndRender();
  openDeliveryModal();
});
finishDeliveryBtn.addEventListener("click", () => {
  currentPage = "finish";
  updatePageUi();
  saveAndRender();
  openDeliveryModal();
});

closeDeliveryModalBtn.addEventListener("click", closeDeliveryModal);
deliveryOverlay.addEventListener("click", (event) => {
  if (event.target === deliveryOverlay) closeDeliveryModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && deliveryOverlay && !deliveryOverlay.hidden) {
    closeDeliveryModal();
  }
});

modalDownloadBtn.addEventListener("click", () => {
  closeDeliveryModal();
  window.print();
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
  render(getFormData());
  setSaveStatus("Pronto para editar", false);
});

startEditorButtons.forEach((button) => {
  button.addEventListener("click", () => showEditor());
});

landingModelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectLandingModel(button.dataset.landingTemplate);
  });
});

if (previousModelBtn) {
  previousModelBtn.addEventListener("click", () => moveLandingModel(-1));
}

if (nextModelBtn) {
  nextModelBtn.addEventListener("click", () => moveLandingModel(1));
}

if (modelOptions) {
  modelOptions.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveLandingModel(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveLandingModel(1);
    }
  });
}

landingStyleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedLandingStyle = button.dataset.landingStyle;
    updateLandingModelPreview();
  });
});

if (useSelectedModelBtn) {
  useSelectedModelBtn.addEventListener("click", () => {
    setTemplate(selectedLandingTemplate);
    setStyle(selectedLandingStyle);
    saveAndRender();
    showEditor();
  });
}

if (backLandingBtn) {
  backLandingBtn.addEventListener("click", () => showLanding());
}

window.addEventListener("popstate", () => {
  if (window.location.hash === "#editor") {
    showEditor(false);
    return;
  }

  showLanding(false);
});

localStorage.removeItem("curriculo-pro-data");
loadInitialData();
createModelCarouselDots();
updateLandingModelPreview();

if (window.location.hash === "#editor") {
  showEditor(false);
}
