const USW_DATA = {
    saveUser: (user, pass) => {
        let users = JSON.parse(localStorage.getItem('usw_users') || '{}');
        if (users[user]) return false;
        users[user] = { pass: pass, snippets: {} };
        localStorage.setItem('usw_users', JSON.stringify(users));
        return true;
    },
    verifyUser: (user, pass) => {
        let users = JSON.parse(localStorage.getItem('usw_users') || '{}');
        return users[user] && users[user].pass === pass;
    },
    saveCode: (user, lang, code) => {
        let users = JSON.parse(localStorage.getItem('usw_users') || '{}');
        if (users[user]) {
            users[user].snippets[lang] = code;
            localStorage.setItem('usw_users', JSON.stringify(users));
            return true;
        }
        return false;
    },
    loadCode: (user, lang) => {
        let users = JSON.parse(localStorage.getItem('usw_users') || '{}');
        return users[user]?.snippets[lang] || null;
    }
};
