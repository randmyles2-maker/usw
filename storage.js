const USW_DATA = {
    saveUser: (user, pass) => {
        let u = JSON.parse(localStorage.getItem('usw_users') || '{}');
        if (u[user]) return false;
        u[user] = { pass: pass, snippets: {} };
        localStorage.setItem('usw_users', JSON.stringify(u));
        return true;
    },
    verifyUser: (user, pass) => {
        let u = JSON.parse(localStorage.getItem('usw_users') || '{}');
        return u[user] && u[user].pass === pass;
    },
    saveCode: (user, lang, code) => {
        let u = JSON.parse(localStorage.getItem('usw_users') || '{}');
        if (u[user]) {
            u[user].snippets[lang] = code;
            localStorage.setItem('usw_users', JSON.stringify(u));
            return true;
        }
        return false;
    },
    loadCode: (user, lang) => {
        let u = JSON.parse(localStorage.getItem('usw_users') || '{}');
        return u[user]?.snippets[lang] || null;
    }
};
