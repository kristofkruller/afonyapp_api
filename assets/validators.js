module.exports = {
  isValidEmail: (email) => /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
  isStrongPassword: (pw) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pw),
}  

