// <================ file to perform validation for the signup and login pages==============>

export const isValidUsername = (username: string) => {
  // Username should contain only alphabetic characters
  const usernameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
  return usernameRegex.test(username);
};

export const isStrongPassword = (password: string) => {
  // Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/;
  return passwordRegex.test(password);
};
