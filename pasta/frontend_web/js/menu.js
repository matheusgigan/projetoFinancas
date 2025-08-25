// frontend_web/menu.js
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-btn');
    if(logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            Toastify({ text: "Você saiu com sucesso!", duration: 2000, style: { background: "#6c757d" } }).showToast();
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        });
    }
});