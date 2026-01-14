window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const topBar = document.createElement('div');
        topBar.id = 'custom-top-bar';
        topBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        const title = document.createElement('div');
        title.innerHTML = 'Board Game API Documentation';
        title.style.cssText = `
            color: white;
            font-weight: 600;
            font-size: 16px;
        `;
        
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '/api-docs-logout';
        logoutBtn.innerHTML = 'Logout';
        logoutBtn.style.cssText = `
            background: white;
            color: #667eea;
            padding: 8px 20px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-block;
        `;
        
        logoutBtn.onmouseover = function() {
            this.style.background = '#f5f5f5';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        };
        
        logoutBtn.onmouseout = function() {
            this.style.background = 'white';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        };
        
        topBar.appendChild(title);
        topBar.appendChild(logoutBtn);
        document.body.insertBefore(topBar, document.body.firstChild);
        
        const wrapper = document.querySelector('.swagger-ui .wrapper');
        if (wrapper) {
            wrapper.style.paddingTop = '60px';
        }
    }, 100);
});
