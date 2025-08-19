# frontend/test_api.py
# Versão de teste da API sem interface gráfica Kivy
import requests
import json

class FinancasAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
    
    def criar_usuario(self, username, email, password):
        """Teste para criar um novo usuário"""
        url = f"{self.base_url}/api/users/"
        data = {
            'username': username,
            'email': email,
            'password': password
        }
        
        try:
            response = requests.post(url, json=data)
            print(f"Status: {response.status_code}")
            print(f"Resposta: {response.json()}")
            return response.status_code == 201
        except requests.exceptions.ConnectionError:
            print("Erro: Não foi possível conectar ao servidor.")
            print("Certifique-se de que o Django está rodando na porta 8001")
            return False
        except Exception as e:
            print(f"Erro: {e}")
            return False
    
    def fazer_login(self, username, password):
        """Teste para fazer login"""
        url = f"{self.base_url}/api/auth/login/"
        data = {
            'username': username,
            'password': password
        }
        
        try:
            response = requests.post(url, data=data)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                self.token = response.json().get('token')
                print("Login bem-sucedido!")
                print(f"Token: {self.token}")
                return True
            else:
                print(f"Falha no login: {response.json()}")
                return False
        except requests.exceptions.ConnectionError:
            print("Erro: Não foi possível conectar ao servidor.")
            return False
        except Exception as e:
            print(f"Erro: {e}")
            return False
    
    def testar_endpoints(self):
        """Testa os principais endpoints da API"""
        print("=== Testando API do Sistema de Finanças ===")
        print(f"Base URL: {self.base_url}")
        
        # Teste de conectividade
        try:
            response = requests.get(f"{self.base_url}/")
            print(f"Servidor respondendo: {response.status_code}")
        except:
            print("Servidor não está respondendo. Verifique se o Django está rodando.")
            return
        
        # Aqui você pode adicionar mais testes conforme necessário
        print("\n=== Testes disponíveis ===")
        print("1. criar_usuario(username, email, password)")
        print("2. fazer_login(username, password)")
        print("\nExemplo de uso:")
        print("tester = FinancasAPITester()")
        print("tester.criar_usuario('testuser', 'test@email.com', 'senha123')")
        print("tester.fazer_login('testuser', 'senha123')")

if __name__ == '__main__':
    tester = FinancasAPITester()
    tester.testar_endpoints()
