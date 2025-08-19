# frontend/main.py
from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
import requests # Para fazer as chamadas à API

# Classe para a Tela de Login
class LoginScreen(Screen):
    def fazer_login(self):
        # 1. Pegar os dados dos campos de texto da interface
        username = self.ids.login_input.text
        password = self.ids.password_input.text
        print(f"Tentando login com usuário: {username}") # Para debug

        # 2. Enviar os dados para a API Django
        try:
            url = "http://127.0.0.1:8000/api/auth/login/"
            response = requests.post(url, data={'username': username, 'password': password})

            # 3. Processar a resposta da API
            if response.status_code == 200:
                token = response.json()['token']
                print("Login bem-sucedido!")
                print("Token:", token)
                # Aqui, no futuro, vamos salvar o token e mudar de tela
            else:
                print("Falha no login. Status:", response.status_code)
                print("Resposta:", response.json())

        except requests.exceptions.ConnectionError:
            print("Não foi possível conectar ao servidor. O backend está rodando?")

# Classe para a Tela Principal (depois do login) - por enquanto, vazia
class HomeScreen(Screen):
    pass

# O Gerenciador de Telas
class GerenciadorTelas(ScreenManager):
    pass

# A Classe Principal do Aplicativo
class FinancasApp(App):
    def build(self):
        return GerenciadorTelas()

# Rodar o aplicativo
if __name__ == '__main__':
    FinancasApp().run()