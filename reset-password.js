import { createAuthClient } from "better-auth/client";

const authClient = createAuthClient();
const form = document.querySelector("#resetPasswordForm");
const newPassword = document.querySelector("#newPassword");
const confirmPassword = document.querySelector("#confirmPassword");
const status = document.querySelector("#resetStatus");
const token = new URLSearchParams(window.location.search).get("token");

if (!token) {
  status.textContent = "Este link é inválido ou expirou.";
  status.classList.add("error");
  form.hidden = true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (newPassword.value !== confirmPassword.value) {
    status.textContent = "As senhas não coincidem.";
    status.classList.add("error");
    return;
  }

  const result = await authClient.resetPassword({
    newPassword: newPassword.value,
    token
  });
  if (result.error) {
    status.textContent = result.error.message;
    status.classList.add("error");
    return;
  }

  status.textContent = "Senha alterada. Você já pode entrar.";
  status.classList.remove("error");
  form.hidden = true;
});
