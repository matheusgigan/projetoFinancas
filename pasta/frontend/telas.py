# frontend/telas.py

from kivy.uix.screenmanager import ScreenManager, Screen
import requests

class LoginScreen(Screen):
    def fazer_login(self):
        username = self.ids.login_input.text
        password = self.ids.password_input.text
        print(f"Tentando login com usuário: {username}")
        try:
            url = "http://127.0.0.1:8000/api/auth/login/"
            response = requests.post(url, data={'username': username, 'password': password})
            if response.status_code == 200:
                token = response.json()['token']
                print("Login bem-sucedido! Token:", token)
                # Agora vamos realmente mudar de tela!
                self.manager.current = 'home'
            else:
                print(f"Falha no login. Status: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print("Não foi possível conectar ao servidor.")

class HomeScreen(Screen):
    pass

class GerenciadorTelas(ScreenManager):
    pass