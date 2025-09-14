import { test, expect } from '@playwright/test'; //librerias utilizando, expect son aserciones
import { RegisterPage }  from '../pages/registerPage'; 
import TestData from '../data/testData.json';

let registerPage: RegisterPage;

test.beforeEach(async ({page}) => {
  registerPage = new RegisterPage(page);
  await registerPage.visitarPaginaRegistro();
}); 

test('TC-1 Verificación de elementos visuales en la página de registro', async ({ page }) => {
  await expect(registerPage.firstNameInput).toBeVisible();
  await expect(registerPage.lastNameInput).toBeVisible();
  await expect(registerPage.emailInput).toBeVisible();
  await expect(registerPage.passwordInput).toBeVisible();
  await expect(registerPage.registerButton).toBeVisible();
});

test('TC-2 Verificar Boton de registro esta inhabilitado por defecto', async({page}) => {
  await expect(registerPage.registerButton).toBeDisabled();

});

test('TC-3  Verificar que el botón de registro se habilita al completar los campos obligatorios', async ({ page }) => {
  await registerPage.completarFormularioRegistro(TestData.usuarioValido);
  await registerPage.hacerClicBotonRegistro();
  //await registerPage.firstNameInput.fill('Luana');
  //await registerPage.lastNameInput.fill('Deudor');
  //await registerPage.emailInput.fill('luz@gmail.com');
  //await registerPage.passwordInput.fill('123456');
  //await expect(registerPage.registerButton).toBeEnabled();

// usando solo el json await registerPage.completarFormularioRegistro(TestData.usuarioValido.nombre, TestData.usuarioValido.apellido, TestData.usuarioValido.email, TestData.usuarioValido.password);
});

test('TC4 Verificar redireccionamiento a página de inicio de sesión al hacer clic en el boton de registro', async ({ page}) => {
  await registerPage.loginButton.click();
  await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC5 Verificar Registro exitoso con datos vàlidos', async({page}) => {
  test.step('Completar el formulario de registro con datos válidos', async() => {
    const email = (TestData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (TestData.usuarioValido.email.split('@')[1]);
    TestData.usuarioValido.email = email;
    await registerPage.completarYHacerClicBotonRegistro(TestData.usuarioValido)
  });
    await expect(page.getByText('Registro exitoso')).toBeVisible();

});

test('TC6 Verificar que un usuario no pueda registrase con un correo electrónico ya existente', async({page}) => {
  const email = (TestData.usuarioValido.email.split('@')[0]) + Date.now().toString() + '@' + (TestData.usuarioValido.email.split('@')[1]);
  TestData.usuarioValido.email = email;

  await registerPage.completarYHacerClicBotonRegistro(TestData.usuarioValido);
  await expect(page.getByText('Registro exitoso')).toBeVisible();
  await registerPage.visitarPaginaRegistro();
  await registerPage.completarYHacerClicBotonRegistro(TestData.usuarioValido);
  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(page.getByText('Registro exitoso')).not.toBeVisible();

});
