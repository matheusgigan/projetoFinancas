# frontend/main.py

from kivy.app import App
# Importante: A classe principal se chama FinancasApp
from telas import GerenciadorTelas

class FinancasApp(App):
    def build(self):
        return GerenciadorTelas()

if __name__ == '__main__':
    FinancasApp().run()