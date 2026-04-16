const USW_DATA = {
    // Stores user accounts
    saveUser: (user, pass) => {
        let users = JSON.parse(localStorage.getItem('usw_users') || '{}');
        if (users[user]) return false;
        users[user] = { pass: pass, snippets: {} };
        localStorage.setItem('usw_users', JSON.stringify(users));
        return true;
    },
    // Login check
    verifyUser: (user, pass) => {
        let users = JSON.parse(localStorage.getItem('usw_users') || '{}');
        return users[user] && users[user].pass === pass;
    },
    // The SAVE function for the Deploy button
    saveCode: (user, lang, code) => {
        let users = JSON.parse(localStorage.getItem('usw_users') || '{}');
        if (users[user]) {
            users[user].snippets[lang] = code;
            localStorage.setItem('usw_users', JSON.stringify(users));
            console.log(`Saved ${lang} for ${user}`);
            return true;
        }
        return false;
    },
    // The LOAD function for switching files
    loadCode: (user, lang) => {
        let users = JSON.parse(localStorage.getItem('usw_users') || '{}');
        return users[user]?.snippets[lang] || null;
    }
};
