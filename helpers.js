function generateRandomString() {
  const list = "ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvqxyz123456789";
  let output = "";
  for (let i = 0; i <= 6; i++) {
    let random = Math.floor(Math.random() * list.length);
    output += list.charAt(random);
  }
  return output;
} //generating a unique short URL (6 random characters) 

const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return null; 
}


function urlsForUser(id, urlDatabase) {
  const filter = {};
  for (const user in urlDatabase) {
    if (urlDatabase[user].userID === id) {
      filter[user] = urlDatabase[user];
    }
  }
  return filter;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser}