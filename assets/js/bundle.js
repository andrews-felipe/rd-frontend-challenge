(() => {
  const selector = (selector) => {
    return document.querySelector(selector);
  };
  const create = (element) => {
    return document.createElement(element);
  };

  const app = selector("#app");

  const Login = create("div");
  Login.classList.add("login");

  const Logo = create("img");
  Logo.src = "./assets/images/logo.svg";
  Logo.classList.add("logo");

  const Form = create("form");

  Form.onsubmit = async (e) => {
    e.preventDefault();

    const [email, password] = e.target.elements;

    const { url } = await fakeAuthenticate(email.value, password.value);

    location.href = "#users";

    const users = await getRequest(url);
    renderPageUsers(users);
  };

  Form.oninput = (e) => {
    const [email, password, button] = e.target.parentElement.children;
    !email.validity.valid || !email.value || password.value.length <= 5
      ? button.setAttribute("disabled", "disabled")
      : button.removeAttribute("disabled");
  };

  Form.innerHTML = `
    <input type="text" name="email" class="input" placeholder="Entre com seu e-mail">
    <input type="password" name="password" class="input" placeholder="Digite sua senha supersecreta" >
    <button type="submit" disabled="disabled" >Entrar</button>
  `;

  app.appendChild(Logo);
  Login.appendChild(Form);

  /**
   * Método para pseudo autenticação, ele é responsável por requisitar uma url
   * para a API e gerar um token que é armazenado no localStorage
   * @param {*} email
   * @param {*} password
   */
  async function fakeAuthenticate(email, password) {
    const json = await getRequest("http://www.mocky.io/v2/5dba690e3000008c00028eb6");

    const fakeJwtToken = `${btoa(email + password)}.${btoa(json.url)}.${
      new Date().getTime() + 300000
    }`;
    localStorage.setItem("token", fakeJwtToken);

    return json;
  }

  /**
   * Método responsável por criar uma requisição
   * a pártir da url passada no parametro
   * @param {*} url url para requisição
   */
  async function getRequest(url) {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  }

  /**
   * Método responsável por renderizar a lista de itens no DOM
   * @param {*} users lista de usuários
   */
  function renderPageUsers(users) {
    app.style.justifyContent = "normal"; // Manipulando o flex para adequadção dos quadros

    const flexContainer = create("div");
    flexContainer.classList.add("flex");

    let html = "";
    users.forEach((user) => {
      html += `
        <a href="${user.html_url}" class="item">
            <div class="mask">
                <img src="${user.avatar_url}"/>
            </div>
            <p>${user.login}</p>
        </a>
      `;
    });

    Login.style.display = "none";
    app.appendChild(flexContainer);
    flexContainer.innerHTML = html;
  }

  /**
   * Função assíncrona para verificação da autenticação
   */
  (async function () {
    const rawToken = localStorage.getItem("token");
    const token = rawToken ? rawToken.split(".") : null;
    if (!token || token[2] < new Date().getTime()) {
      localStorage.removeItem("token");
      location.href = "#login";
      app.appendChild(Login);
    } else {
      location.href = "#users";
      const users = await getDevelopersList(atob(token[1]));
      renderPageUsers(users);
    }
  })();
})();
